import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Committee from "@/models/Committee";
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
      return NextResponse.json({ success: false, error: "Invalid committee ID." }, { status: 400 });
    }

    const committee = await Committee.findById(id)
      .populate("chairman", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name");

    if (!committee) {
      return NextResponse.json({ success: false, error: "Committee not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: committee });
  } catch (error) {
    console.error("Get committee error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid committee ID." }, { status: 400 });
    }

    const body = await req.json();

    const committee = await Committee.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("chairman", "name email avatar");

    if (!committee) {
      return NextResponse.json({ success: false, error: "Committee not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: committee });
  } catch (error) {
    console.error("Update committee error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid committee ID." }, { status: 400 });
    }

    const committee = await Committee.findByIdAndDelete(id);

    if (!committee) {
      return NextResponse.json({ success: false, error: "Committee not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Committee deleted successfully." });
  } catch (error) {
    console.error("Delete committee error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
