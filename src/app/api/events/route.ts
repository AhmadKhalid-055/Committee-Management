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
    const category = searchParams.get("category"); // matches event type (workshop, conference, event, other)
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = { type: { $ne: "meeting" } };
    if (category) query.type = category;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const events = await Event.find(query)
      .populate("committee", "name")
      .populate("attendees.user", "name email avatar")
      .populate("createdBy", "name")
      .sort({ startDate: 1 });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Get events error:", error);
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

    // Default to type 'event' if not specified or set to meeting
    const eventType = body.type && body.type !== "meeting" ? body.type : "event";

    const event = await Event.create({
      ...body,
      type: eventType,
      createdBy: payload.userId,
    });

    await event.populate("committee", "name");
    await event.populate("attendees.user", "name email");

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
