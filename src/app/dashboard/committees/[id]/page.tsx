"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, Calendar, FileText, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function CommitteeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [committee, setCommittee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const res = await fetch(`/api/committees/${id}`);
        const json = await res.json();
        if (json.success) {
          setCommittee(json.data);
        } else {
          toast.error("Failed to load committee");
          router.push("/dashboard/committees");
        }
      } catch (err) {
        toast.error("Network error");
        router.push("/dashboard/committees");
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, [id, router]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading committee details...</div>;
  }

  if (!committee) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/committees")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{committee.name}</h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {committee.category.replace('_', ' ')} • <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${committee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{committee.status}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About this Committee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {committee.description}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Admin / Chairman</span>
              <span className="font-medium">{committee.chairman?.name || "Unassigned"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Established</span>
              <span className="font-medium">{new Date(committee.establishedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Meeting Frequency</span>
              <span className="font-medium">{committee.meetingFrequency || "Not set"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="members" className="gap-2"><Users className="h-4 w-4" /> Members</TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2"><Calendar className="h-4 w-4" /> Meetings & Events</TabsTrigger>
          <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
              <CardTitle className="text-lg">Members List</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Assign Member</Button>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {committee.members?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center p-6 text-muted-foreground">No members assigned.</TableCell>
                    </TableRow>
                  ) : (
                    committee.members?.map((m: any) => (
                      <TableRow key={m._id}>
                        <TableCell>
                          <div className="font-medium">{m.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{m.user?.email}</div>
                        </TableCell>
                        <TableCell>{m.role}</TableCell>
                        <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
              <CardTitle className="text-lg">Upcoming Meetings & Events</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Schedule Meeting</Button>
            </div>
            <CardContent className="p-6 text-center text-muted-foreground">
              No meetings scheduled.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
              <CardTitle className="text-lg">Committee Documents</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Upload Document</Button>
            </div>
            <CardContent className="p-6 text-center text-muted-foreground">
              No documents uploaded yet.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
