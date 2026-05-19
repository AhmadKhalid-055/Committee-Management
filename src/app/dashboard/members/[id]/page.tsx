"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, FileText, Plus, LogOut, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function MemberProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [assignedCommittees, setAssignedCommittees] = useState<any[]>([]);
  const [allCommittees, setAllCommittees] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningCommitteeId, setAssigningCommitteeId] = useState("");
  const [assignRole, setAssignRole] = useState("Member");
  const [userRole, setUserRole] = useState("");

  const fetchData = async () => {
    try {
      // 1. Fetch User details
      const userRes = await fetch(`/api/users/${id}`);
      const userData = await userRes.json();
      if (!userData.success) {
        toast.error("User not found");
        router.push("/dashboard/members");
        return;
      }
      setMember(userData.data);

      // 2. Fetch assigned committees
      const committeesRes = await fetch(`/api/committees?userId=${id}`);
      const committeesData = await committeesRes.json();
      if (committeesData.success) {
        setAssignedCommittees(committeesData.data.committees);
      }

      // 3. Fetch all committees (for assignment dropdown)
      const allCommitteesRes = await fetch("/api/committees");
      const allCommitteesData = await allCommitteesRes.json();
      if (allCommitteesData.success) {
        setAllCommittees(allCommitteesData.data.committees);
      }

      // 4. Fetch activity logs
      const activityRes = await fetch(`/api/users/${id}/activity`);
      const activityData = await activityRes.json();
      if (activityData.success) {
        setActivityLogs(activityData.data);
      }
    } catch (err) {
      toast.error("Error loading profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) setUserRole(j.data.role);
    });
    fetchData();
  }, [id]);

  const handleAssignCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCommitteeId) return;

    try {
      const res = await fetch(`/api/committees/${assigningCommitteeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role: assignRole }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Successfully assigned to committee");
        setAssigningCommitteeId("");
        fetchData();
      } else {
        toast.error(json.error || "Failed to assign committee");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleRemoveCommittee = async (committeeId: string) => {
    if (!confirm("Are you sure you want to remove this user from the committee?")) return;

    try {
      const res = await fetch(`/api/committees/${committeeId}/members?userId=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Removed from committee");
        fetchData();
      } else {
        toast.error(json.error || "Failed to remove");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading member profile...</div>;
  }

  if (!member) return null;

  const initials = member.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Filter out committees the member is already in
  const availableCommittees = allCommittees.filter(
    (c) => !assignedCommittees.some((ac) => ac._id === c._id)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/members")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Profile</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {initials}
            </div>
            <h2 className="text-xl font-bold">{member.name}</h2>
            <p className="text-sm text-muted-foreground capitalize mt-1">{member.role.replace('_', ' ')}</p>
            
            <div className="w-full mt-6 border-t pt-4 space-y-3 text-left text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span className="font-medium break-all">{member.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Phone</span>
                <span className="font-medium">{member.phone || "Not provided"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Address</span>
                <span className="font-medium">{member.address || "Not provided"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Joining Date</span>
                <span className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Status</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 capitalize
                  ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Panels */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="committees" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="committees" className="gap-2">Committees</TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">Activity Track</TabsTrigger>
            </TabsList>

            <TabsContent value="committees" className="space-y-6">
              {/* Assign Committee Form */}
              {userRole === "super_admin" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assign to Committee</CardTitle>
                    <CardDescription>Add this member to an existing committee.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAssignCommittee} className="flex flex-col sm:flex-row gap-4">
                      <select
                        className="flex h-10 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={assigningCommitteeId}
                        onChange={(e) => setAssigningCommitteeId(e.target.value)}
                        required
                      >
                        <option value="">Select Committee</option>
                        {availableCommittees.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>

                      <Input
                        placeholder="Role (e.g. Secretary)"
                        className="sm:max-w-[200px]"
                        value={assignRole}
                        onChange={(e) => setAssignRole(e.target.value)}
                        required
                      />

                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Assign
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Committee Memberships list */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Committee Memberships</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Committee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Member Role</TableHead>
                        {userRole === "super_admin" && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCommittees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={userRole === "super_admin" ? 4 : 3} className="text-center p-6 text-muted-foreground">
                            Not assigned to any committees.
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedCommittees.map((c) => {
                          const userInCommittee = c.members.find((m: any) => m.user?._id === id || m.user === id);
                          return (
                            <TableRow key={c._id}>
                              <TableCell className="font-semibold">{c.name}</TableCell>
                              <TableCell className="capitalize">{c.category.replace('_', ' ')}</TableCell>
                              <TableCell>{userInCommittee?.role || "Member"}</TableCell>
                              {userRole === "super_admin" && (
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveCommittee(c._id)}
                                  >
                                    <LogOut className="h-4 w-4 mr-1" /> Remove
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Logs</CardTitle>
                  <CardDescription>Track recent actions performed by this user.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No recorded activity for this user.</p>
                    ) : (
                      activityLogs.map((log) => (
                        <div key={log._id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                          <div className="mt-0.5 rounded-full p-1.5 bg-primary/5 text-primary">
                            <Check className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{log.description}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>Action: <span className="font-semibold">{log.action}</span></span>
                              <span>•</span>
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
