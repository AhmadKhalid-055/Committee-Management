import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID." }, { status: 400 });
    }

    const event = await Event.findOne({ _id: id, type: { $ne: "meeting" } });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    const userId = payload.userId;

    // Check if already registered
    const isAlreadyAttendee = event.attendees.some(
      (a: any) => a.user.toString() === userId
    );

    if (isAlreadyAttendee) {
      return NextResponse.json({ success: false, error: "You are already registered for this event." }, { status: 400 });
    }

    event.attendees.push({
      user: new mongoose.Types.ObjectId(userId),
      status: "accepted", // Representing accepted invitation/registration
    });

    await event.save();
    await event.populate("attendees.user", "name email avatar");

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Register for event error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID." }, { status: 400 });
    }

    const event = await Event.findOne({ _id: id, type: { $ne: "meeting" } });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    const userId = payload.userId;

    event.attendees = event.attendees.filter(
      (a: any) => a.user.toString() !== userId
    );

    await event.save();
    await event.populate("attendees.user", "name email avatar");

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Unregister from event error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
