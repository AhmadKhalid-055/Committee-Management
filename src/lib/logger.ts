import connectDB from "./db";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";

export async function logActivity(
  userId: string,
  action: string,
  description: string,
  module: "auth" | "committee" | "event" | "user" | "document" | "notification",
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await connectDB();
    await ActivityLog.create({
      user: new mongoose.Types.ObjectId(userId),
      action,
      description,
      module,
      metadata,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
    });
  } catch (error) {
    console.error("Logger failed to write activity:", error);
  }
}
