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
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "inactive", "dissolved"]),
  chairman: z.string().min(1, "Chairman is required"),
  establishedDate: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof schema>;

interface CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  committeeToEdit?: any;
  onSuccess: () => void;
}

export function CommitteeModal({ isOpen, onClose, committeeToEdit, onSuccess }: CommitteeModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
      category: "",
      chairman: "",
    }
  });

  const statusValue = watch("status");
  const categoryValue = watch("category");
  const chairmanValue = watch("chairman");

  useEffect(() => {
    // Fetch users for the chairman dropdown
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?role=committee_admin");
        const json = await res.json();
        if (json.success) {
          setUsers(json.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (committeeToEdit) {
      reset({
        name: committeeToEdit.name,
        description: committeeToEdit.description,
        category: committeeToEdit.category,
        status: committeeToEdit.status,
        chairman: committeeToEdit.chairman?._id || committeeToEdit.chairman,
        establishedDate: committeeToEdit.establishedDate ? new Date(committeeToEdit.establishedDate).toISOString().split('T')[0] : "",
      });
    } else {
      reset({
        status: "active",
        category: "",
        chairman: "",
      });
    }
  }, [committeeToEdit, reset, isOpen]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = committeeToEdit ? `/api/committees/${committeeToEdit._id}` : "/api/committees";
      const method = committeeToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(committeeToEdit ? "Committee updated!" : "Committee created!");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{committeeToEdit ? "Edit Committee" : "Add New Committee"}</DialogTitle>
          <DialogDescription>
            {committeeToEdit ? "Update the details of the committee below." : "Fill in the details to create a new committee."}
          </DialogDescription>
        </DialogHeader>

        <form id="committee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Committee Name</Label>
              <Input id="name" {...register("name")} disabled={loading} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                {...register("description")} 
                disabled={loading} 
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryValue} onValueChange={(v) => setValue("category", v, { shouldValidate: true })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="student_affairs">Student Affairs</SelectItem>
                  <SelectItem value="ad_hoc">Ad-hoc / Special</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusValue} onValueChange={(v: any) => setValue("status", v, { shouldValidate: true })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="dissolved">Dissolved</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Chairman (Admin)</Label>
              <Select value={chairmanValue} onValueChange={(v) => setValue("chairman", v, { shouldValidate: true })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign Chairman" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <SelectItem value="none" disabled>No Committee Admins found</SelectItem>
                  ) : (
                    users.map(u => (
                      <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.chairman && <p className="text-xs text-destructive">{errors.chairman.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishedDate">Established Date</Label>
              <Input id="establishedDate" type="date" {...register("establishedDate")} disabled={loading} />
              {errors.establishedDate && <p className="text-xs text-destructive">{errors.establishedDate.message}</p>}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="committee-form" disabled={loading}>
            {loading ? "Saving..." : "Save Committee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
