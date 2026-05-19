"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Determine the user's role and redirect
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          const role = data.data.role;
          if (role === "super_admin") router.replace("/dashboard/super-admin");
          else if (role === "committee_admin") router.replace("/dashboard/committee-admin");
          else router.replace("/dashboard/member");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
