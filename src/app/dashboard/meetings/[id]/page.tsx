"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Video, MapPin, Calendar, Clock, Clipboard, FileText, Bell, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MeetingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Notes & Agenda Edit State
  const [minutes, setMinutes] = useState("");
  const [agenda, setAgenda] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingAgenda, setIsEditingAgenda] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`);
      const json = await res.json();
      if (json.success) {
        setMeeting(json.data);
        setMinutes(json.data.minutes || "");
        setAgenda(json.data.agenda || "");
      } else {
        toast.error("Failed to load meeting details");
        router.push("/dashboard/meetings");
      }
    } catch (err) {
      toast.error("Network error");
      router.push("/dashboard/meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) {
        setUserRole(j.data.role);
        setCurrentUserId(j.data._id || j.data.userId);
      }
    });
    fetchMeeting();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Meeting marked as ${status}`);
        fetchMeeting();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Meeting notes updated!");
        setIsEditingNotes(false);
        fetchMeeting();
      }
    } catch (err) {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgenda = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Meeting agenda updated!");
        setIsEditingAgenda(false);
        fetchMeeting();
      }
    } catch (err) {
      toast.error("Failed to save agenda");
    } finally {
      setSaving(false);
    }
  };

  const handleAttendanceChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Attendance status updated");
        fetchMeeting();
      } else {
        toast.error(json.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleSendReminder = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}/remind`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Reminders sent successfully!");
      }
    } catch (err) {
      toast.error("Failed to send reminders");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading meeting details...</div>;
  }

  if (!meeting) return null;

  const isAdmin = userRole === "super_admin" || userRole === "committee_admin";
  const startDateTime = new Date(meeting.startDate);
  const endDateTime = new Date(meeting.endDate);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/meetings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{meeting.title}</h1>
            <p className="text-muted-foreground mt-1">Host Committee: <span className="font-semibold text-foreground">{meeting.committee?.name}</span></p>
          </div>
        </div>

        {/* Quick status & reminder actions */}
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={handleSendReminder}>
                <Bell className="h-4 w-4 mr-2" /> Send Reminder
              </Button>

              <select
                className="flex h-9 w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={meeting.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details and Sections */}
        <div className="md:col-span-2 space-y-6">
          {/* Logistics Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Logistics Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <span className="font-semibold">{startDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="font-semibold">
                    {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                {meeting.isVirtual ? (
                  <>
                    <Video className="h-5 w-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Virtual Platform</span>
                      {meeting.meetingLink ? (
                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold truncate max-w-[300px]">
                          Join Meeting Link
                        </a>
                      ) : (
                        <span className="font-semibold text-muted-foreground italic">Link not provided</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Physical Location</span>
                      <span className="font-semibold">{meeting.location || "Not specified"}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agenda Section */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Clipboard className="h-5 w-5 text-primary" /> Meeting Agenda</CardTitle>
              {isAdmin && !isEditingAgenda && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingAgenda(true)}>Edit</Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingAgenda ? (
                <div className="space-y-3">
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Provide details about the meeting agenda..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAgenda(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveAgenda} disabled={saving}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {meeting.agenda || "No agenda has been defined for this meeting."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meeting Notes / Minutes */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Meeting Notes & Minutes</CardTitle>
              {isAdmin && !isEditingNotes && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingNotes(true)}>Update</Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="Take notes or write down meeting resolutions here..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveNotes} disabled={saving}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {meeting.minutes ? (
                    meeting.minutes
                  ) : (
                    <div className="text-center py-6 italic text-muted-foreground">No notes or minutes recorded yet.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Attendance & Participants tracking */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Attendance Roster</CardTitle>
              <CardDescription>Track responses and record attendance.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {meeting.attendees?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No participants invited yet.</p>
                ) : (
                  meeting.attendees?.map((attendee: any) => {
                    const isSelf = attendee.user?._id === currentUserId;
                    
                    return (
                      <div key={attendee._id} className="p-3 flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold">{attendee.user?.name} {isSelf && "(You)"}</span>
                          <span className="text-xs text-muted-foreground">{attendee.user?.email}</span>
                        </div>

                        {/* Interactive Status select */}
                        {isAdmin || isSelf ? (
                          <select
                            className={`flex h-8 rounded border bg-background px-2 py-0.5 text-xs focus:outline-none`}
                            value={attendee.status}
                            onChange={(e) => handleAttendanceChange(attendee.user?._id || attendee.user, e.target.value)}
                          >
                            <option value="invited">Invited</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            {isAdmin && <option value="attended">Attended</option>}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize
                            ${attendee.status === 'accepted' || attendee.status === 'attended' ? 'bg-green-100 text-green-800' : 
                              attendee.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                            {attendee.status}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
