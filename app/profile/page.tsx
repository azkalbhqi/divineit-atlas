import { getSessionUser } from "@/lib/session";
import { updatePasswordAction } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect("/login");
  }

  const { error, success } = await searchParams;

  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header breadcrumb */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <span className="text-zinc-400">My Profile</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>👤</span>
          <span>My Profile Account</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your personal workspace account settings and security credentials
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-xs text-red-400 font-medium">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-400 font-medium">
          ✅ {success}
        </div>
      )}

      {/* Profile Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-6 border border-zinc-800 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 pb-4 border-b border-zinc-800">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-indigo-500 flex items-center justify-center text-2xl font-bold text-zinc-100 shadow-xl">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{currentUser.email}</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
              currentUser.global_role === "manager"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}>
              {currentUser.global_role}
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-850">
                <span className="text-zinc-500">Account ID</span>
                <span className="font-mono text-zinc-350 select-all truncate max-w-[150px]">{currentUser.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-850">
                <span className="text-zinc-500">Security State</span>
                <span className="text-emerald-400 font-medium">Hashed / Salted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-zinc-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>🔒</span>
              <span>Change Password</span>
            </h3>
            <p className="text-zinc-500 text-xs mt-1">
              To update your account password, verify your identity by entering your current password below.
            </p>
          </div>

          <form action={updatePasswordAction} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Current Password *
              </label>
              <input
                name="currentPassword"
                type="password"
                required
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  New Password *
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Confirm New Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all mt-4"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
