import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "super_admin" });
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: "Super admin already exists." }, { status: 400 });
    }

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@committeems.com",
      password: "admin123456",
      role: "super_admin",
      department: "Administration",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully.",
      data: { email: admin.email, name: admin.name },
    }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
