import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/models/Document";
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
    const committeeId = searchParams.get("committeeId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    if (committeeId) query.committee = committeeId;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    // Committee-based access control enforcement:
    // Non-admins can only see documents belonging to committees they are assigned to.
    if (payload.role === "member") {
      const userCommittees = await Committee.find({ "members.user": payload.userId });
      const committeeIds = userCommittees.map(c => c._id);
      
      if (committeeId) {
        // If they requested a specific committee, verify membership
        if (!committeeIds.some(id => id.toString() === committeeId)) {
          return NextResponse.json({ success: false, error: "Access Denied. You do not belong to this committee." }, { status: 403 });
        }
      } else {
        // Otherwise, restrict search to only their committees
        query.committee = { $in: committeeIds };
      }
    }

    const documents = await Document.find(query)
      .populate("committee", "name")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, url, size, type, category, committeeId } = body;

    if (!name || !url || !size || !type || !committeeId) {
      return NextResponse.json({ success: false, error: "Missing required file metadata." }, { status: 400 });
    }

    // Check if the user is authorized to upload to this committee (must be member or admin)
    if (payload.role === "member") {
      const committee = await Committee.findOne({ _id: committeeId, "members.user": payload.userId });
      if (!committee) {
        return NextResponse.json({ success: false, error: "Access Denied. You cannot upload to this committee." }, { status: 403 });
      }
    }

    const doc = await Document.create({
      name,
      url,
      size,
      type,
      category: category || "other",
      committee: committeeId,
      uploadedBy: payload.userId,
    });

    await doc.populate("committee", "name");
    await doc.populate("uploadedBy", "name");

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
