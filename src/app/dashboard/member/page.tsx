"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Calendar, ClipboardList, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats/member");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review committee tasks, upcoming meetings, and announcements.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Memberships</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.committeesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.upcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned or invited events</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Info className="h-4 w-4 text-primary animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">New Updates</div>
            <p className="text-xs text-muted-foreground mt-1">Check top right panel</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrolled Committees List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Committees</CardTitle>
            <CardDescription>Committees you actively participate in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.committees?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">You are not enrolled in any committee yet.</p>
            ) : (
              data?.committees?.map((committee: any) => (
                <div 
                  key={committee._id} 
                  onClick={() => router.push(`/dashboard/committees/${committee._id}`)}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-sm block">{committee.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{committee.category} • {committee.status}</span>
                  </div>
                  <span className="text-xs text-primary font-medium hover:underline">View details</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Invited / Related Meetings List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Schedule & Agenda</CardTitle>
            <CardDescription>Upcoming meetings for your committees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.upcomingEvents?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming meetings scheduled.</p>
            ) : (
              data?.upcomingEvents?.map((event: any) => (
                <div 
                  key={event._id}
                  onClick={() => router.push(`/dashboard/meetings/${event._id}`)}
                  className="p-3 border rounded-md hover:bg-muted/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{event.committee?.name || "General Event"}</span>
                    <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
