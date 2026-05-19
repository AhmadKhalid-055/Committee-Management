import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const event = await Event.findOne({ _id: id, type: { $ne: "meeting" } })
      .populate("committee", "name")
      .populate("attendees.user", "name email avatar")
      .populate("createdBy", "name");

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Get event details error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload || (payload.role !== "super_admin" && payload.role !== "committee_admin")) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID." }, { status: 400 });
    }

    const body = await req.json();

    const event = await Event.findOneAndUpdate(
      { _id: id, type: { $ne: "meeting" } },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("committee", "name")
      .populate("attendees.user", "name email avatar");

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload || (payload.role !== "super_admin" && payload.role !== "committee_admin")) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID." }, { status: 400 });
    }

    const event = await Event.findOneAndDelete({ _id: id, type: { $ne: "meeting" } });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
