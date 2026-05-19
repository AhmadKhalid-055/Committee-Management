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
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["member", "committee_admin", "super_admin"]),
  isActive: z.boolean(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: any;
  onSuccess: () => void;
}

export function MemberModal({ isOpen, onClose, memberToEdit, onSuccess }: MemberModalProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "member",
      isActive: true,
      password: "",
    }
  });

  const roleValue = watch("role");
  const isActiveValue = watch("isActive");

  useEffect(() => {
    if (memberToEdit) {
      reset({
        name: memberToEdit.name,
        email: memberToEdit.email,
        phone: memberToEdit.phone || "",
        address: memberToEdit.address || "",
        role: memberToEdit.role,
        isActive: memberToEdit.isActive,
        password: "", // Always start empty when editing
      });
    } else {
      reset({
        role: "member",
        isActive: true,
        password: "",
      });
    }
  }, [memberToEdit, reset, isOpen]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = memberToEdit ? `/api/users/${memberToEdit._id}` : "/api/users";
      const method = memberToEdit ? "PUT" : "POST";

      // If editing and password is empty, don't send password field
      const payload: any = { ...data };
      if (memberToEdit && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(memberToEdit ? "Member updated successfully!" : "Member created successfully!");
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
          <DialogTitle>{memberToEdit ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {memberToEdit ? "Update member account and details." : "Create a new user account and profile."}
          </DialogDescription>
        </DialogHeader>

        <form id="member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} disabled={loading} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} disabled={loading || !!memberToEdit} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {!memberToEdit && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" type="password" {...register("password")} disabled={loading} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}

            {memberToEdit && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="password">Change Password (Optional)</Label>
                <Input id="password" type="password" placeholder="Leave blank to keep current" {...register("password")} disabled={loading} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register("phone")} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>System Role</Label>
              <Select value={roleValue} onValueChange={(v: any) => setValue("role", v, { shouldValidate: true })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="committee_admin">Committee Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select 
                value={isActiveValue ? "active" : "inactive"} 
                onValueChange={(v) => setValue("isActive", v === "active", { shouldValidate: true })} 
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="member-form" disabled={loading}>
            {loading ? "Saving..." : "Save Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
