"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ResponsiveLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    global_role: "manager" | "staff";
  };
  projects: Array<{
    id: string;
    name: string;
  }>;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export default function ResponsiveLayout({
  user,
  projects,
  logoutAction,
  children,
}: ResponsiveLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    return pathname === href;
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/invoices", label: "Invoices", icon: "🧾" },
    ...(user.global_role === "manager"
      ? [
          { href: "/financials", label: "Global Financials", icon: "💳" },
          { href: "/users", label: "Manage Roster", icon: "👥" },
        ]
      : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 text-zinc-100 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3 group" onClick={() => setIsOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all">
            D
          </div>
          <div>
            <h1 className="text-lg leading-none tracking-tight text-white transition-colors">
              <span className="font-normal text-zinc-100">Divine</span>
              <span className="font-black italic text-white">IT</span>
              <span className="font-semibold text-indigo-500 ml-1.5 text-xs tracking-wider uppercase">Atlas</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-semibold tracking-wider mt-0.5 uppercase">Workspace OS</p>
          </div>
        </Link>
        {/* Mobile close button */}
        <button
          className="md:hidden text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Active Profile Info */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-semibold text-zinc-300 shadow-inner">
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-100 truncate tracking-wide">
              {user.name}
            </p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-900/60 pt-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border transition-colors ${
              user.global_role === "manager"
                ? "bg-amber-500/5 text-amber-400 border-amber-500/20"
                : "bg-sky-500/5 text-sky-400 border-sky-500/20"
            }`}
          >
            {user.global_role}
          </span>

          <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-400">
            <Link
              href="/profile"
              className="hover:text-zinc-200 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <span className="w-px h-3 bg-zinc-800" aria-hidden="true" />
            <form action={logoutAction} className="inline m-0">
              <button
                type="submit"
                className="hover:text-red-400 transition-colors duration-200 cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10"
                    : "text-zinc-350 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Workspace List */}
        <div className="pt-2">
          <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            My Workspaces
          </h2>
          {projects.length === 0 ? (
            <p className="text-xs text-zinc-500 px-3 italic">No assigned workspaces</p>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => {
                const active = pathname === `/projects/${project.id}` || pathname.startsWith(`/projects/${project.id}/`);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                      active
                        ? "bg-zinc-800/60 text-white font-semibold"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-indigo-400" : "bg-indigo-650"}`} />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex w-full h-full overflow-hidden min-h-screen text-zinc-100 bg-zinc-950">
      {/* Desktop Sidebar (Left side, fixed) */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay backdrop) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Slider panel */}
          <aside className="relative flex flex-col w-72 h-full z-10 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-72 min-h-screen relative overflow-hidden">
        {/* Top Navbar for Mobile */}
        <header className="flex md:hidden h-16 items-center justify-between px-6 bg-zinc-900 border-b border-zinc-800 z-30 shrink-0 select-none">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-xs">
              D
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Divine<span className="italic font-black text-indigo-400">IT</span>
              <span className="text-zinc-400 font-semibold ml-1 text-xs">Atlas</span>
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -mr-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
            aria-label="Toggle Sidebar Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* Ambient Glows */}
        <div className="radial-glow top-0 right-0 pointer-events-none" />

        {/* Dynamic Pages */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
