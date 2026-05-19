import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Committee from "@/models/Committee";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const userId = searchParams.get("userId");
    if (userId) {
      query["members.user"] = userId;
    } else if (payload.role === "committee_member") {
      // Non-admins can only see committees they belong to
      query["members.user"] = payload.userId;
    }

    const total = await Committee.countDocuments(query);
    const committees = await Committee.find(query)
      .populate("chairman", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { committees, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get committees error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const committee = await Committee.create({
      ...body,
      createdBy: payload.userId,
    });

    await committee.populate("chairman", "name email avatar");

    return NextResponse.json({ success: true, data: committee }, { status: 201 });
  } catch (error) {
    console.error("Create committee error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
