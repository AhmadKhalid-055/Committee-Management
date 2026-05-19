"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, FileSpreadsheet, Search, RefreshCw, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToCSV } from "@/lib/export";
import toast from "react-hot-toast";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      } else {
        toast.error(json.error || "Failed to load audit logs");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    const headers = [
      { key: "createdAt", label: "Timestamp" },
      { key: "user.name", label: "User Name" },
      { key: "user.email", label: "User Email" },
      { key: "module", label: "Module" },
      { key: "action", label: "Action" },
      { key: "description", label: "Description" },
      { key: "ipAddress", label: "IP Address" }
    ];
    exportToCSV(logs, headers, "system_audit_logs");
    toast.success("Audit logs exported!");
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Review organizational logs, database actions, and administrative actions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredLogs.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="all">All Modules</option>
              <option value="auth">Auth</option>
              <option value="committee">Committees</option>
              <option value="event">Events / Meetings</option>
              <option value="user">Users</option>
              <option value="document">Documents</option>
              <option value="notification">Notifications</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading audit logs...</TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No audit entries found.</TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{log.user?.name || "System"}</span>
                          <span className="text-[10px] text-muted-foreground">{log.user?.email || "internal@system"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase
                          ${log.module === 'auth' ? 'bg-orange-100 text-orange-800' : 
                            log.module === 'committee' ? 'bg-blue-100 text-blue-800' : 
                            log.module === 'event' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                          {log.module}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground uppercase">{log.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate" title={log.description}>{log.description}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{log.ipAddress || "127.0.0.1"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
