"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (e) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        toast.success("Notification marked as read");
        fetchNotifications();
      }
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      }
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Keep track of alerts, meeting reminders, and organizational notices.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button onClick={handleMarkAllRead} className="shrink-0">
            <Check className="h-4 w-4 mr-2" /> Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/10 border-b">
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "unread" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button 
              variant={filter === "read" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("read")}
            >
              Read
            </Button>
          </div>
          <CardDescription>
            {filteredNotifications.length} alerts showing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading alerts...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <span>No notifications in this category.</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-4 flex gap-4 items-start transition-colors
                    ${!n.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="mt-1">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <p className={`text-sm font-semibold ${!n.isRead ? 'text-foreground font-bold' : 'text-foreground/90'}`}>{n.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    
                    {!n.isRead && (
                      <div className="pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs font-semibold px-3 border"
                          onClick={() => handleMarkRead(n._id)}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
