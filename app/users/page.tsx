import { getSessionUser } from "@/lib/session";
import { getUsers } from "@/lib/db";
import ProvisionUserModal from "./ProvisionUserModal";
import DeleteUserButton from "./DeleteUserButton";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function ManageUsersPage({ searchParams }: PageProps) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect("/login");
  }

  // Route security gate: Intercept non-Manager attempts
  if (currentUser.global_role !== "manager") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center text-2xl mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-white">403 Unauthorized Action</h1>
        <p className="text-zinc-500 text-xs mt-2 max-w-sm leading-relaxed">
          Access Denied. Worker administration and account provisioning interfaces are restricted exclusively to Agency Managers.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-white border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { error, success } = await searchParams;
  const allUsers = await getUsers();

  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <span className="text-zinc-400">Manage Roster</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>👥</span>
          <span>Agency Roster & Users</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure agency accounts, manage staff personas, and provision system logins
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

      {/* Main Grid Content */}
      <div className="space-y-6">
        {/* Roster Users List Table */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>👥</span>
              <span>Active Worker Accounts</span>
            </h3>
            <ProvisionUserModal />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4">Worker Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Global Role</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {allUsers.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/10">
                      <td className="py-4 px-4 font-bold text-white flex items-center space-x-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-zinc-400">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                          u.global_role === "manager"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {u.global_role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-zinc-650 italic">Protected</span>
                        ) : (
                          <DeleteUserButton userId={u.id} userName={u.name} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
