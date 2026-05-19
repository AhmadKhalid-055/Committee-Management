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
  startDate: z.string().min(1, "Start date and time is required"),
  endDate: z.string().min(1, "End date and time is required"),
  location: z.string().optional(),
  isVirtual: z.boolean(),
  meetingLink: z.string().optional(),
  agenda: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToEdit?: any;
  onSuccess: () => void;
}

export function MeetingModal({ isOpen, onClose, meetingToEdit, onSuccess }: MeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      committee: "",
      isVirtual: false,
      location: "",
      meetingLink: "",
      agenda: "",
    }
  });

  const committeeValue = watch("committee");
  const isVirtualValue = watch("isVirtual");

  useEffect(() => {
    // Fetch committees
    const fetchCommittees = async () => {
      try {
        const res = await fetch("/api/committees");
        const json = await res.json();
        if (json.success) {
          setCommittees(json.data.committees);
        }
      } catch (err) {
        console.error("Failed to load committees", err);
      }
    };
    fetchCommittees();
  }, []);

  useEffect(() => {
    if (meetingToEdit) {
      reset({
        title: meetingToEdit.title,
        description: meetingToEdit.description,
        committee: meetingToEdit.committee?._id || meetingToEdit.committee,
        startDate: meetingToEdit.startDate ? new Date(meetingToEdit.startDate).toISOString().slice(0, 16) : "",
        endDate: meetingToEdit.endDate ? new Date(meetingToEdit.endDate).toISOString().slice(0, 16) : "",
        location: meetingToEdit.location || "",
        isVirtual: meetingToEdit.isVirtual || false,
        meetingLink: meetingToEdit.meetingLink || "",
        agenda: meetingToEdit.agenda || "",
      });
    } else {
      reset({
        committee: "",
        isVirtual: false,
        location: "",
        meetingLink: "",
        agenda: "",
      });
    }
  }, [meetingToEdit, reset, isOpen]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = meetingToEdit ? `/api/meetings/${meetingToEdit._id}` : "/api/meetings";
      const method = meetingToEdit ? "PUT" : "POST";

      // If scheduling a new meeting, auto-populate the attendees list with all members of that committee
      const payload: any = { ...data };
      if (!meetingToEdit) {
        const selectedCommittee = committees.find(c => c._id === data.committee);
        if (selectedCommittee && selectedCommittee.members) {
          payload.attendees = selectedCommittee.members.map((m: any) => ({
            user: m.user?._id || m.user,
            status: "invited"
          }));
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(meetingToEdit ? "Meeting updated successfully!" : "Meeting scheduled successfully!");
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
          <DialogTitle>{meetingToEdit ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
          <DialogDescription>
            {meetingToEdit ? "Update meeting details and logistics." : "Schedule a new meeting for a committee."}
          </DialogDescription>
        </DialogHeader>

        <form id="meeting-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="title">Meeting Title</Label>
              <Input id="title" {...register("title")} disabled={loading} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="description">Brief Description</Label>
              <Input id="description" {...register("description")} disabled={loading} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Host Committee</Label>
              <Select value={committeeValue} onValueChange={(v) => setValue("committee", v, { shouldValidate: true })} disabled={loading || !!meetingToEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Host Committee" />
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
              <Label htmlFor="isVirtual">Virtual Meeting</Label>
            </div>

            {isVirtualValue ? (
              <div className="space-y-1">
                <Label htmlFor="meetingLink">Meeting Link (e.g. Zoom / Meet)</Label>
                <Input id="meetingLink" placeholder="https://..." {...register("meetingLink")} disabled={loading} />
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="location">Physical Location</Label>
                <Input id="location" placeholder="Conference Room B" {...register("location")} disabled={loading} />
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label htmlFor="agenda">Meeting Agenda</Label>
              <textarea
                id="agenda"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="List topics to discuss..."
                {...register("agenda")}
                disabled={loading}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="meeting-form" disabled={loading}>
            {loading ? "Saving..." : "Schedule Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
