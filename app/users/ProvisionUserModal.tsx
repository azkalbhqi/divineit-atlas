"use client";

import React, { useState } from "react";
import { createUserAction } from "@/app/actions/users";
import { useRouter } from "next/navigation";

export default function ProvisionUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const globalRole = formData.get("globalRole") as string;

    if (!name || !email || !password || !globalRole) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // We can call the action directly. Note that Next.js actions that use redirect() will throw a redirect error which is handled by Next.js, 
      // but if we call them via form action or fetch it handles it. 
      // Let's use a standard HTML form submission action or call it manually.
      // Actually, since createUserAction redirects to `/users?success=...`, we can just submit the form elements.
      // To prevent CORS/Action issues, let's submit it using the action attribute or call it in a form submit.
      // If we use form action directly:
      // <form action={createUserAction} ...> then it handles redirect natively!
      // But if we want to show loading state or close the modal, we can let the native redirect reload the page, which closes the modal naturally since the page re-renders!
      // This is extremely simple and robust. Let's do that!
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-550/30 transform hover:-translate-y-0.5 transition-all cursor-pointer flex items-center space-x-1.5"
      >
        <span>➕</span>
        <span>Provision Account</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>➕</span>
                <span>Provision User Account</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
              Create new administrative Managers or standard staff members instantly. Registered accounts will immediately be assignable to project rosters.
            </p>

            <form
              action={createUserAction}
              onSubmit={() => {
                setLoading(true);
                // The native redirect on success will refresh the page, closing the modal.
              }}
              className="space-y-4 pt-4"
            >
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. John Dev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. john@agency.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password (used for manual login)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Global Roster Role *
                </label>
                <select
                  name="globalRole"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-655 transition-all text-xs text-zinc-300"
                >
                  <option value="staff">Staff (Filters Workspaces)</option>
                  <option value="manager">Manager (Global Admin Bypass)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1"
                >
                  <span>{loading ? "Provisioning..." : "Provision Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
