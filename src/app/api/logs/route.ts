import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden. Admin only access." }, { status: 403 });
    }

    await connectDB();
    const logs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get activity logs error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
