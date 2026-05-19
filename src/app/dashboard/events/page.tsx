"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, MapPin, Video, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EventModal } from "@/components/events/EventModal";
import toast from "react-hot-toast";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const fetchEvents = async (search = "", category = "all") => {
    setLoading(true);
    try {
      let url = `/api/events?search=${encodeURIComponent(search)}`;
      if (category !== "all") {
        url += `&category=${category}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setEvents(json.data);
      }
    } catch (e) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) setUserRole(j.data.role);
    });
    fetchEvents();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents(searchQuery, categoryFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryFilter]);

  const handleOpenAddModal = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const getFallbackBanner = (type: string) => {
    switch (type) {
      case "workshop":
        return "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80";
      case "conference":
        return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Events</h1>
          <p className="text-muted-foreground mt-1">Discover, track, and register for workshops, conferences, and seminars.</p>
        </div>
        {(userRole === "super_admin" || userRole === "committee_admin") && (
          <Button onClick={handleOpenAddModal} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="event">General Event</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="other">Other Activity</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-[320px] animate-pulse bg-muted/30"></Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No events found. Check back later or adjust filters!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const startDate = new Date(event.startDate);
            const isFuture = startDate > new Date();

            return (
              <Card key={event._id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={event.banner || getFallbackBanner(event.type)}
                      alt={event.title}
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-full capitalize shadow-sm">
                      {event.type}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm
                      ${event.status === 'upcoming' ? 'bg-blue-500 text-white' : 
                        event.status === 'ongoing' ? 'bg-orange-500 text-white' : 
                        event.status === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-500 text-white'}`}>
                      {event.status}
                    </span>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-semibold">{event.committee?.name}</p>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3 text-sm">
                    <p className="text-muted-foreground text-xs line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.isVirtual ? (
                          <><Video className="h-3.5 w-3.5 text-blue-500" /> <span className="truncate max-w-[180px]">Virtual Stream</span></>
                        ) : (
                          <><MapPin className="h-3.5 w-3.5" /> <span className="truncate max-w-[180px]">{event.location || "Room"}</span></>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-4 border-t flex justify-between items-center bg-muted/5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {event.attendees?.length || 0} Registered
                  </span>

                  <Button size="sm" onClick={() => router.push(`/dashboard/events/${event._id}`)}>
                    Details <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={eventToEdit}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
