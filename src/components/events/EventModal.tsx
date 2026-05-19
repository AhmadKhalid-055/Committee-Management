"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  committee: z.string().min(1, "Committee is required"),
  type: z.enum(["event", "workshop", "conference", "other"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().optional(),
  isVirtual: z.boolean(),
  meetingLink: z.string().optional(),
  banner: z.string().optional(),
  agenda: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: any;
  onSuccess: () => void;
}

export function EventModal({ isOpen, onClose, eventToEdit, onSuccess }: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "event",
      committee: "",
      isVirtual: false,
      location: "",
      meetingLink: "",
      banner: "",
      agenda: "",
    }
  });

  const typeValue = watch("type");
  const committeeValue = watch("committee");
  const isVirtualValue = watch("isVirtual");

  useEffect(() => {
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
    fetchCommittees();
  }, []);

  useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        description: eventToEdit.description,
        committee: eventToEdit.committee?._id || eventToEdit.committee,
        type: eventToEdit.type || "event",
        startDate: eventToEdit.startDate ? new Date(eventToEdit.startDate).toISOString().slice(0, 16) : "",
        endDate: eventToEdit.endDate ? new Date(eventToEdit.endDate).toISOString().slice(0, 16) : "",
        location: eventToEdit.location || "",
        isVirtual: eventToEdit.isVirtual || false,
        meetingLink: eventToEdit.meetingLink || "",
        banner: eventToEdit.banner || "",
        agenda: eventToEdit.agenda || "",
      });
    } else {
      reset({
        type: "event",
        committee: "",
        isVirtual: false,
        location: "",
        meetingLink: "",
        banner: "",
        agenda: "",
      });
    }
  }, [eventToEdit, reset, isOpen]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = eventToEdit ? `/api/events/${eventToEdit._id}` : "/api/events";
      const method = eventToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(eventToEdit ? "Event updated successfully!" : "Event created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(json.error || "Operation failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? "Edit Event" : "Create New Event"}</DialogTitle>
          <DialogDescription>
            {eventToEdit ? "Update event scheduling, location, and parameters." : "Publish a new organizational event."}
          </DialogDescription>
        </DialogHeader>

        <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" {...register("title")} disabled={loading} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="description">Event Description</Label>
              <textarea
                id="description"
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("description")}
                disabled={loading}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Host Committee</Label>
              <Select value={committeeValue} onValueChange={(v) => setValue("committee", v, { shouldValidate: true })} disabled={loading || !!eventToEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.committee && <p className="text-xs text-destructive">{errors.committee.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Event Category</Label>
              <Select value={typeValue} onValueChange={(v: any) => setValue("type", v, { shouldValidate: true })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">General Event</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="other">Other Activity</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="banner">Banner Image URL (Optional)</Label>
              <Input id="banner" placeholder="https://images.unsplash.com/..." {...register("banner")} disabled={loading} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input id="startDate" type="datetime-local" {...register("startDate")} disabled={loading} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input id="endDate" type="datetime-local" {...register("endDate")} disabled={loading} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                id="isVirtual"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register("isVirtual")}
                disabled={loading}
              />
              <Label htmlFor="isVirtual">Virtual Event</Label>
            </div>

            {isVirtualValue ? (
              <div className="space-y-1">
                <Label htmlFor="meetingLink">Streaming Link (e.g. Zoom / Youtube)</Label>
                <Input id="meetingLink" placeholder="https://..." {...register("meetingLink")} disabled={loading} />
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="location">Physical Location</Label>
                <Input id="location" placeholder="Main Auditorium" {...register("location")} disabled={loading} />
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="event-form" disabled={loading}>
            {loading ? "Publishing..." : "Publish Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
