import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Committee from "@/models/Committee";
import Event from "@/models/Event";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "committee_admin") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const userId = payload.userId;

    // Fetch committees where this admin is the chairman
    const committees = await Committee.find({ chairman: userId });
    const committeeIds = committees.map(c => c._id);

    // Sum members count across these committees
    let totalMembers = 0;
    committees.forEach(c => {
      totalMembers += c.members?.length || 0;
    });

    // Upcoming meetings for these committees
    const upcomingMeetings = await Event.find({
      committee: { $in: committeeIds },
      type: "meeting",
      startDate: { $gte: new Date() }
    })
      .populate("committee", "name")
      .sort({ startDate: 1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        committees,
        totalMembers,
        upcomingMeetings,
      }
    });
  } catch (error) {
    console.error("Committee admin stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
