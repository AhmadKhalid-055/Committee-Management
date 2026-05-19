import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Committee from "@/models/Committee";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const userId = payload.userId;

    // Get committees where user is enrolled as a member
    const committees = await Committee.find({ members: userId });
    const committeeIds = committees.map(c => c._id);

    // Get upcoming events/meetings where user is participant or the event belongs to their committees
    const upcomingEvents = await Event.find({
      $or: [
        { committee: { $in: committeeIds } },
        { participants: userId }
      ],
      startDate: { $gte: new Date() }
    })
      .populate("committee", "name")
      .sort({ startDate: 1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        committeesCount: committees.length,
        committees,
        upcomingEvents,
      }
    });
  } catch (error) {
    console.error("Member stats API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
