"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Bell, 
  ShieldCheck,
  Building
} from "lucide-react";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    const baseItems = [
      { name: "Overview", href: `/dashboard/${role.replace('_', '-')}`, icon: LayoutDashboard },
      { name: "Committees", href: "/dashboard/committees", icon: Building },
      { name: "Members", href: "/dashboard/members", icon: Users },
      { name: "Meetings", href: "/dashboard/meetings", icon: Calendar },
      { name: "Events", href: "/dashboard/events", icon: Calendar },
      { name: "Documents", href: "/dashboard/documents", icon: FileText },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ];

    if (role === "super_admin") {
      baseItems.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-card border-r flex flex-col hidden md:flex h-full min-h-screen">
      <div className="p-6 border-b flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">CommitteeMS</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/dashboard/${role.replace('_', '-')}` && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
