import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Notification from "@/models/Notification";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload || (payload.role !== "super_admin" && payload.role !== "committee_admin")) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid meeting ID." }, { status: 400 });
    }

    const meeting = await Event.findOne({ _id: id, type: "meeting" });
    if (!meeting) {
      return NextResponse.json({ success: false, error: "Meeting not found." }, { status: 404 });
    }

    const recipientIds = meeting.attendees.map((attendee: any) => attendee.user);
    if (recipientIds.length === 0) {
      return NextResponse.json({ success: true, message: "No attendees to notify." });
    }

    const dateStr = new Date(meeting.startDate).toLocaleString();

    // Create a notification for each recipient
    const notifications = recipientIds.map((userId: any) => ({
      title: `Meeting Reminder: ${meeting.title}`,
      message: `You have an upcoming meeting scheduled for ${dateStr} at ${meeting.location || "Virtual"}.`,
      type: "info",
      recipient: userId,
      relatedTo: {
        model: "Event",
        id: meeting._id,
      },
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ success: true, message: `Reminders sent to ${recipientIds.length} members.` });
  } catch (error) {
    console.error("Send meeting reminders error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
