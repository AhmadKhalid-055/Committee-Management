import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid meeting ID." }, { status: 400 });
    }

    const { userId, status } = await req.json();
    if (!userId || !status) {
      return NextResponse.json({ success: false, error: "User ID and status are required." }, { status: 400 });
    }

    const validStatuses = ["invited", "accepted", "declined", "attended"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid attendance status." }, { status: 400 });
    }

    const meeting = await Event.findOne({ _id: id, type: "meeting" });
    if (!meeting) {
      return NextResponse.json({ success: false, error: "Meeting not found." }, { status: 404 });
    }

    // Only admins or committee admins can update other's status, members can only update their own response (accepted/declined)
    if (payload.userId !== userId && payload.role !== "super_admin" && payload.role !== "committee_admin") {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    if (payload.userId === userId && (status === "attended" || status === "invited") && payload.role === "member") {
      return NextResponse.json({ success: false, error: "Members cannot mark their own attendance record as attended/invited." }, { status: 403 });
    }

    // Find the attendee record
    const attendee = meeting.attendees.find((a: any) => a.user.toString() === userId);

    if (attendee) {
      attendee.status = status;
    } else {
      // Add as attendee if not present
      meeting.attendees.push({
        user: new mongoose.Types.ObjectId(userId),
        status: status,
      });
    }

    await meeting.save();
    await meeting.populate("attendees.user", "name email avatar");

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error("Update attendance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
