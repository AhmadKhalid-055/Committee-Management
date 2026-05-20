"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Bell, FileText, Settings, ShieldCheck, Activity, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Award className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            CommitteeOS
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Performance</a>
          <a href="#about" className="hover:text-white transition-colors">Security</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col justify-center py-20 lg:py-32 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-8 text-left z-10">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit tracking-wide uppercase"
            >
              <Activity className="h-3.5 w-3.5 animate-pulse" /> Next-Generation Committee Workspace
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Empower Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                Committees
              </span>
              . Elevate Decisions.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-2xl"
            >
              A premium, all-in-one governance platform designed for seamless collaboration, secure document sharing, advanced analytics, and real-time alerts. Streamline your entire committee workflow today.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Platform
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 border border-zinc-800 hover:bg-zinc-900 bg-zinc-950 text-zinc-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                Create Account
              </Link>
            </motion.div>
          </div>

          {/* Graphic Section */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[420px] aspect-[4/5] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              {/* Card internal gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
              
              {/* Header card info */}
              <div className="flex justify-between items-center z-10">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Workspace Health</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Central Widget */}
              <div className="flex flex-col gap-6 py-8 z-10">
                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Active Committees</h3>
                    <p className="text-xs text-zinc-500">12 departments configured</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Document Repository</h3>
                    <p className="text-xs text-zinc-500">Secure AES-256 cloud encryption</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Reminders & Toast Updates</h3>
                    <p className="text-xs text-zinc-500">Socket.io real-time alerts</p>
                  </div>
                </div>
              </div>

              {/* Bottom widget details */}
              <div className="border-t border-zinc-800/80 pt-6 flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500">Live Status</span>
                  <span className="text-sm font-bold text-zinc-200">Database Active</span>
                </div>
                <Link
                  href="/login"
                  className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-indigo-600 flex items-center justify-center transition-colors text-zinc-300 hover:text-white"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-zinc-950 border-t border-zinc-900 py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Everything you need for enterprise governance
            </h2>
            <p className="text-zinc-400">
              Meticulously designed tools built to satisfy audit, accessibility, and high performance demands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 p-6 rounded-2xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Real-Time Sync</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Stay updated instantly. Pusher / Socket.io toast alerts bring direct notifications for meetings, files, and events.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 p-6 rounded-2xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Document Manager</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Secure file storage with Cloudinary integration. Upload, filter, search, and view PDFs directly in a beautiful reader.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 p-6 rounded-2xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Security Standard</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Role-based access controls, protected API routes, secure password hashes, and detailed audit logs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 p-6 rounded-2xl transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Fine-Tuned Settings</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Complete control over account updates, password security, avatars, profile image uploads, and light/dark theme preference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-6 text-center text-xs text-zinc-600 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} CommitteeOS. Engineered with precision. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

