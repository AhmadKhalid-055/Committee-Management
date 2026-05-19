"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar as CalendarIcon, Video, MapPin, Eye, Bell, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MeetingModal } from "@/components/meetings/MeetingModal";
import toast from "react-hot-toast";

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  
  // Filters & Selected date
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calendar parameters
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<any>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      let url = "/api/meetings";
      const params = [];
      if (committeeFilter !== "all") params.push(`committeeId=${committeeFilter}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setMeetings(json.data);
      }
    } catch (e) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommittees = async () => {
    try {
      const res = await fetch("/api/committees");
      const json = await res.json();
      if (json.success) {
        setCommittees(json.data.committees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) setUserRole(j.data.role);
    });
    fetchCommittees();
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [committeeFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Meeting deleted");
        fetchMeetings();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleSendReminder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/meetings/${id}/remind`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Reminders sent!");
      } else {
        toast.error(json.error || "Failed to send reminders");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // Calendar Helpers
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (month: number, year: number) => new Date(year, month, 1).getDay();

  const getDaysArray = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startIdx = firstDayIndex(currentMonth, currentYear);
    const daysArr = [];

    // Empty spaces for previous month's end
    for (let i = 0; i < startIdx; i++) {
      daysArr.push(null);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      daysArr.push(new Date(currentYear, currentMonth, d));
    }

    return daysArr;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getMeetingsForDay = (day: Date) => {
    return meetings.filter(m => {
      const mDate = new Date(m.startDate);
      return mDate.getDate() === day.getDate() &&
             mDate.getMonth() === day.getMonth() &&
             mDate.getFullYear() === day.getFullYear();
    });
  };

  const handleOpenAddModal = () => {
    setMeetingToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setMeetingToEdit(meeting);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and monitor executive and committee meetings.</p>
        </div>
        {(userRole === "super_admin" || userRole === "committee_admin") && (
          <Button onClick={handleOpenAddModal} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" /> Schedule Meeting
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Calendar View */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>{monthNames[currentMonth]} {currentYear}</CardTitle>
              <CardDescription>Select a day to view its meetings.</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>&lt;</Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>&gt;</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-1.5">
              {getDaysArray().map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-16 bg-muted/10 rounded-md"></div>;
                }

                const dayMeetings = getMeetingsForDay(day);
                const isSelected = selectedDate &&
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear();

                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <button
                    key={`day-${day.getTime()}`}
                    onClick={() => setSelectedDate(day)}
                    className={`h-16 p-1.5 flex flex-col justify-between border rounded-md hover:bg-muted/40 transition-colors text-left relative
                      ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}
                      ${isToday ? 'bg-primary/5 font-bold border-primary/50' : 'bg-background'}`}
                  >
                    <span className="text-xs">{day.getDate()}</span>
                    {dayMeetings.length > 0 && (
                      <div className="flex flex-col gap-0.5 w-full">
                        {dayMeetings.slice(0, 2).map((m, mIdx) => (
                          <span key={m._id} className="text-[9px] truncate bg-primary/10 text-primary px-1 py-0.5 rounded block">
                            {m.title}
                          </span>
                        ))}
                        {dayMeetings.length > 2 && (
                          <span className="text-[8px] text-muted-foreground">+{dayMeetings.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected date & filter sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Committee</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={committeeFilter}
                    onChange={(e) => setCommitteeFilter(e.target.value)}
                  >
                    <option value="all">All Committees</option>
                    {committees.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day details or upcoming meetings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate
                  ? `Meetings on ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                  : "All Scheduled Meetings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[350px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-center text-muted-foreground animate-pulse py-8">Loading meetings...</p>
              ) : (selectedDate ? getMeetingsForDay(selectedDate) : meetings).length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">No meetings scheduled.</p>
              ) : (
                (selectedDate ? getMeetingsForDay(selectedDate) : meetings).map((meeting) => (
                  <div
                    key={meeting._id}
                    onClick={() => router.push(`/dashboard/meetings/${meeting._id}`)}
                    className="p-3 border rounded-md hover:bg-muted/40 transition-colors cursor-pointer space-y-2 relative group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm pr-6 group-hover:text-primary transition-colors">{meeting.title}</h4>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize
                        ${meeting.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                          meeting.status === 'ongoing' ? 'bg-orange-100 text-orange-800' : 
                          meeting.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{meeting.committee?.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(meeting.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        {meeting.isVirtual ? (
                          <><Video className="h-3.5 w-3.5 text-blue-500" /> Virtual</>
                        ) : (
                          <><MapPin className="h-3.5 w-3.5" /> {meeting.location || "Room"}</>
                        )}
                      </span>
                    </div>

                    {/* Quick actions on hover */}
                    {(userRole === "super_admin" || userRole === "committee_admin") && (
                      <div className="absolute right-2 bottom-2 hidden group-hover:flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReminder(meeting._id, e);
                          }}
                          title="Send Reminders"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={(e) => handleOpenEditModal(meeting, e)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={(e) => handleDelete(meeting._id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meetingToEdit={meetingToEdit}
        onSuccess={fetchMeetings}
      />
    </div>
  );
}
