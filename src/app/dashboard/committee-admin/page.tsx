"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MeetingModal } from "@/components/meetings/MeetingModal";

export default function CommitteeAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats/committee-admin");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Committee Panel</h1>
          <p className="text-muted-foreground mt-1">Manage operations, schedule meetings, and audit memberships.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Schedule Meeting
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Committees</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.committees?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Chaired by you</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled across your committees</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.upcomingMeetings?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for upcoming weeks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Managed Committees List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Committees</CardTitle>
            <CardDescription>Review and manage your assigned committees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.committees?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">You are not assigned as chairman of any committee.</p>
            ) : (
              data?.committees?.map((committee: any) => (
                <div 
                  key={committee._id} 
                  onClick={() => router.push(`/dashboard/committees/${committee._id}`)}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-sm block">{committee.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{committee.category} • {committee.members?.length || 0} Members</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full
                    ${committee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {committee.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Meetings scheduled for your committees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.upcomingMeetings?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming meetings scheduled.</p>
            ) : (
              data?.upcomingMeetings?.map((meeting: any) => (
                <div 
                  key={meeting._id}
                  onClick={() => router.push(`/dashboard/meetings/${meeting._id}`)}
                  className="p-3 border rounded-md hover:bg-muted/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{meeting.title}</span>
                    <span className="text-xs text-muted-foreground">{new Date(meeting.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{meeting.committee?.name}</span>
                    <span>{new Date(meeting.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStats}
      />
    </motion.div>
  );
}
