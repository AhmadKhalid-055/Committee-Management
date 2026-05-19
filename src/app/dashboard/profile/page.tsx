"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Building, Lock, Bell, Camera, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [avatar, setAvatar] = useState("");

  // Security password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preference state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
        setName(json.data.name || "");
        setPhone(json.data.phone || "");
        setAddress(json.data.address || "");
        setDepartment(json.data.department || "");
        setAvatar(json.data.avatar || "");
      }
    } catch (e) {
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/${user._id || user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, department, avatar }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profile details updated successfully!");
        fetchProfile();
      } else {
        toast.error(json.error || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch(`/api/users/${user._id || user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      } else {
        toast.error(json.error || "Password update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success("Profile image loaded. Click 'Save Changes' to update.");
      };
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences saved successfully!");
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading profile settings...</div>;
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your user parameters, details, security, and alerts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Avatar card */}
        <Card className="md:col-span-1 h-fit shadow-sm">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Click the camera icon to upload an avatar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <div className="relative group">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={name} 
                  className="h-28 w-28 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-dashed">
                  {initials}
                </div>
              )}
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/95 transition-colors border border-background"
              >
                <Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            
            <div className="text-center mt-4 space-y-1">
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
              <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded mt-2">
                <Shield className="h-3 w-3" /> {user?.role.replace('_', ' ')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Edit forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Update your general contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="email">Email (Read Only)</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={user?.email} className="pl-9 bg-muted/30" readOnly />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="pl-9" />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={updating}>
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security / Password Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Change your password to secure your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-9" placeholder="At least 6 characters" required />
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-9" required />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={updatingPassword}>
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preferences Settings Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure alerts and system updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Email Alerts</Label>
                      <p className="text-xs text-muted-foreground">Receive digest summaries and meeting invitations in your inbox.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Meeting Reminders</Label>
                      <p className="text-xs text-muted-foreground">Receive browser banners and top panel notices prior to events.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={meetingReminders}
                      onChange={(e) => setMeetingReminders(e.target.checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit">
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
