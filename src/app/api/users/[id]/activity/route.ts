import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
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
      return NextResponse.json({ success: false, error: "Invalid user ID." }, { status: 400 });
    }

    // Retrieve activity logs for this user, sorted by most recent
    const logs = await ActivityLog.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get user activity logs error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
