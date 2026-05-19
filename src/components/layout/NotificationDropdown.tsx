"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Trash, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevNotificationsLength = useRef(0);

  const fetchNotifications = async (isPoll = false) => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        const list = json.data;
        setNotifications(list);
        
        const unreads = list.filter((n: any) => !n.isRead);
        setUnreadCount(unreads.length);

        // Real-time Toast Notification trigger for new notifications
        if (isPoll && list.length > prevNotificationsLength.current) {
          const newNotifications = list.slice(0, list.length - prevNotificationsLength.current);
          newNotifications.forEach((n: any) => {
            if (!n.isRead) {
              toast((t) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.message}</span>
                </div>
              ), {
                icon: getNotificationIcon(n.type),
                duration: 4000
              });
            }
          });
        }
        prevNotificationsLength.current = list.length;
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 8 seconds to simulate real-time updates
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-600 border-2 border-card text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96" align="end" forceMount>
        <DropdownMenuLabel className="flex justify-between items-center py-2 px-3">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No notifications.</div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`p-3 flex gap-3 cursor-pointer hover:bg-muted/30 transition-colors
                  ${!n.isRead ? 'bg-primary/5 font-medium' : ''}`}
              >
                <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-foreground leading-tight">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-muted-foreground block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!n.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
