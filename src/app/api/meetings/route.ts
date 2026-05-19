import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committeeId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = { type: "meeting" };
    if (committeeId) query.committee = committeeId;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    // Non-admins can only see meetings they are invited to OR belong to the committee
    // Let's return all meetings in the system for admin/dashboard purposes,
    // but filter for members if they are not super_admin or committee_admin.
    if (payload.role === "member") {
      query.$or = [
        { "attendees.user": payload.userId },
        { createdBy: payload.userId }
      ];
    }

    const meetings = await Event.find(query)
      .populate("committee", "name")
      .populate("attendees.user", "name email avatar")
      .populate("createdBy", "name")
      .sort({ startDate: 1 });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error("Get meetings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || (payload.role !== "super_admin" && payload.role !== "committee_admin")) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const meeting = await Event.create({
      ...body,
      type: "meeting",
      createdBy: payload.userId,
    });

    await meeting.populate("committee", "name");
    await meeting.populate("attendees.user", "name email");

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
