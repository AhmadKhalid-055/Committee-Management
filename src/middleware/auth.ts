import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, JWTPayload } from "@/lib/auth";

type Role = "super_admin" | "committee_member" | "user";

export function withAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  allowedRoles?: Role[]
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    return handler(req, user);
  };
}

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
