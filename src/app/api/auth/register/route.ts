import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required." }, { status: 400 });
    }

    // Role validation - restrict super_admin registration from public endpoint
    const validRoles = ["member", "committee_admin"];
    const assignedRole = validRoles.includes(role) ? role : "member";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already in use." }, { status: 409 });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "REGISTER",
      description: `New user ${user.name} registered as ${assignedRole}`,
      module: "auth",
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
