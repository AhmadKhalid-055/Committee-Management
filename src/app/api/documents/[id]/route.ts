import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Document from "@/models/Document";
import Committee from "@/models/Committee";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid document ID." }, { status: 400 });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, error: "Document not found." }, { status: 404 });
    }

    // Deletion access control:
    // Only super_admin, committee_admin of that committee, or the user who uploaded the document can delete it.
    let canDelete = payload.role === "super_admin";
    if (!canDelete) {
      if (doc.uploadedBy.toString() === payload.userId) {
        canDelete = true;
      } else if (payload.role === "committee_admin") {
        // Check if user is the chairman of this committee
        const committee = await Committee.findOne({ _id: doc.committee, chairman: payload.userId });
        if (committee) canDelete = true;
      }
    }

    if (!canDelete) {
      return NextResponse.json({ success: false, error: "Forbidden. You do not have permissions to delete this file." }, { status: 403 });
    }

    await Document.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
