"use client";

import { useEffect, useState } from "react";
import { Settings, Moon, Sun, Monitor, ShieldAlert, Key, Globe, Database, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);

  // Initialize theme from document class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`Theme updated to ${newTheme} mode!`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Global system settings saved successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global application behavior, branding, and platform properties.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5 text-primary" /> Appearance Theme</CardTitle>
            <CardDescription>Customize the application theme variables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant={theme === "light" ? "default" : "outline"} 
                className="flex items-center gap-2 flex-1 justify-center py-6"
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="h-5 w-5" /> Light Mode
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"} 
                className="flex items-center gap-2 flex-1 justify-center py-6"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="h-5 w-5" /> Dark Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs navigation card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Terminal className="h-5 w-5 text-primary" /> System Audit Logs</CardTitle>
            <CardDescription>Review system interactions, database alterations, and security logs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">The audit trail tracks administrative settings, user logins, event creations, and committee modifications.</p>
            <Button onClick={() => router.push("/dashboard/settings/logs")}>
              View Audit Logs
            </Button>
          </CardContent>
        </Card>

        {/* Global Security / Policies */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /> Authentication & Registrations</CardTitle>
            <CardDescription>Manage user registration settings and policies.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Allow Self-Registration</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to register new Member accounts from the sign-up page.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={allowRegistration}
                    onChange={(e) => setAllowRegistration(e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Active System Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Restrict platform operations to Super Admins during active upgrades.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={!isSystemActive}
                    onChange={(e) => setIsSystemActive(!e.target.checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">
                  Save Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System parameters metadata */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> System Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between py-1.5 border-b">
              <span>Application Version</span>
              <span className="font-semibold text-foreground">v1.2.0</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span>Mongoose Connection</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">✓ Connected</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Server Environment</span>
              <span className="font-semibold text-foreground">NextJS 15 / Node v20</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
