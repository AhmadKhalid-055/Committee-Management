"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, MapPin, Calendar, Clock, Users, ShieldAlert, Award } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [registering, setRegistering] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      const json = await res.json();
      if (json.success) {
        setEvent(json.data);
      } else {
        toast.error("Failed to load event details");
        router.push("/dashboard/events");
      }
    } catch (err) {
      toast.error("Network error");
      router.push("/dashboard/events");
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
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Successfully registered for this event!");
        fetchEvent();
      } else {
        toast.error(json.error || "Registration failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Cancelled registration successfully");
        fetchEvent();
      } else {
        toast.error(json.error || "Cancellation failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Event deleted");
        router.push("/dashboard/events");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading event details...</div>;
  }

  if (!event) return null;

  const isAdmin = userRole === "super_admin" || userRole === "committee_admin";
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const isRegistered = event.attendees?.some(
    (a: any) => (a.user?._id || a.user) === currentUserId
  );

  const getFallbackBanner = (type: string) => {
    switch (type) {
      case "workshop":
        return "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80";
      case "conference":
        return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
      default:
        return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/events")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground mt-1">Host Committee: <span className="font-semibold text-foreground">{event.committee?.name}</span></p>
          </div>
        </div>

        {isAdmin && (
          <Button variant="destructive" onClick={handleDeleteEvent}>
            Delete Event
          </Button>
        )}
      </div>

      {/* Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-100 rounded-lg overflow-hidden border">
        <img
          src={event.banner || getFallbackBanner(event.type)}
          alt={event.title}
          className="object-cover h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-white space-y-2">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-semibold uppercase shadow-sm">
            {event.type}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">{event.title}</h2>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Logistics & Registration details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Event Schedule & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Start Time</span>
                  <span className="font-semibold">{startDate.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">End Time</span>
                  <span className="font-semibold">{endDate.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2 border-t pt-3">
                {event.isVirtual ? (
                  <>
                    <Video className="h-5 w-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Virtual Platform URL</span>
                      {event.meetingLink ? (
                        <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold truncate max-w-[300px]">
                          {event.meetingLink}
                        </a>
                      ) : (
                        <span className="font-semibold text-muted-foreground italic">Link will be shared soon</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Location</span>
                      <span className="font-semibold">{event.location || "Auditorium"}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">About the Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Registered Participants Roster */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Registered Participants</CardTitle>
              <CardDescription>All members registered for this session.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Response Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.attendees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center p-6 text-muted-foreground">No one has registered for this event yet.</TableCell>
                    </TableRow>
                  ) : (
                    event.attendees?.map((a: any) => (
                      <TableRow key={a._id}>
                        <TableCell className="font-medium">{a.user?.name}</TableCell>
                        <TableCell>{a.user?.email}</TableCell>
                        <TableCell>
                          <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                            Registered
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Registration Card Widget */}
        <div className="space-y-6">
          <Card className="shadow-sm border-2 border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
              <Award className="h-10 w-10 text-primary mx-auto mb-2 animate-bounce" />
              <CardTitle className="text-lg">Join this Event</CardTitle>
              <CardDescription>Reserve your spot to secure attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Current Registrations:</span>
                <span className="font-semibold flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {event.attendees?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Event Status:</span>
                <span className="font-semibold uppercase text-xs">{event.status}</span>
              </div>

              {isRegistered ? (
                <div className="space-y-2 pt-2">
                  <div className="text-center text-sm text-green-700 bg-green-100/80 p-2 rounded-md font-semibold">
                    ✓ You are registered!
                  </div>
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleUnregister} disabled={registering}>
                    Cancel Registration
                  </Button>
                </div>
              ) : (
                <Button className="w-full pt-2" onClick={handleRegister} disabled={registering || event.status === 'completed' || event.status === 'cancelled'}>
                  {event.status === 'completed' ? "Event Completed" : event.status === 'cancelled' ? "Event Cancelled" : "Register Now"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
