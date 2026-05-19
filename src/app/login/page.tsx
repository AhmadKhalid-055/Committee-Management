"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Logged in successfully");
        // Role‑based redirect
        const role = json.data.user.role;
        if (role === "super_admin") router.push("/dashboard/super-admin");
        else if (role === "committee_admin") router.push("/dashboard/committee-admin");
        else router.push("/dashboard/member");
      } else {
        toast.error(json.error || "Login failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Committee Management Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled={loading} />
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} disabled={loading} />
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput) emailInput.value = 'admin@committeems.com';
                  if (passwordInput) passwordInput.value = 'admin123456';
                  // trigger react hook form update
                  const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                  document.querySelector('form')?.dispatchEvent(submitEvent);
                }}
              >
                Use Sample Admin Credentials
              </Button>
            </div>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <a href="/forgot-password" className="underline hover:text-primary">Forgot password?</a>
            <a href="/register" className="underline hover:text-primary">Create account</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
