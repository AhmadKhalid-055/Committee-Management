import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Committee from "@/models/Committee";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    // Only super_admin or committee_admin can manage members
    if (!payload || (payload.role !== "super_admin" && payload.role !== "committee_admin")) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid committee ID." }, { status: 400 });
    }

    const { userId, role } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const committee = await Committee.findById(id);
    if (!committee) {
      return NextResponse.json({ success: false, error: "Committee not found." }, { status: 404 });
    }

    // Check if user is already a member
    const isAlreadyMember = committee.members.some(
      (m: any) => m.user.toString() === userId
    );

    if (isAlreadyMember) {
      return NextResponse.json({ success: false, error: "User is already a member of this committee." }, { status: 400 });
    }

    committee.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: role || "Member",
      joinedAt: new Date(),
    });

    await committee.save();
    await committee.populate("members.user", "name email avatar");

    return NextResponse.json({ success: true, data: committee });
  } catch (error) {
    console.error("Add committee member error:", error);
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
      return NextResponse.json({ success: false, error: "Invalid committee ID." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const committee = await Committee.findById(id);
    if (!committee) {
      return NextResponse.json({ success: false, error: "Committee not found." }, { status: 404 });
    }

    committee.members = committee.members.filter(
      (m: any) => m.user.toString() !== userId
    );

    await committee.save();
    await committee.populate("members.user", "name email avatar");

    return NextResponse.json({ success: true, data: committee });
  } catch (error) {
    console.error("Remove committee member error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
