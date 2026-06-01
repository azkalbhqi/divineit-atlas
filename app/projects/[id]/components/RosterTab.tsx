"use client";

import React, { useState, useTransition } from "react";

interface RosterMember {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  project_role: string;
  hourly_rate: number;
  joined_at: string;
}

interface UserDropdownData {
  id: string;
  name: string;
  email: string;
}

interface RosterTabProps {
  roster: RosterMember[];
  unassignedUsers: UserDropdownData[];
  canEdit: boolean;
  isGlobalManager: boolean;
  handleAssignUser: (formData: FormData) => Promise<void>;
  handleUpdateRoster: (rosterId: string, role: string, rate: number) => Promise<void>;
  handleDeleteRoster: (rosterId: string) => Promise<void>;
}

export default function RosterTab({
  roster,
  unassignedUsers,
  canEdit,
  isGlobalManager,
  handleAssignUser,
  handleUpdateRoster,
  handleDeleteRoster,
}: RosterTabProps) {
  const [isBindOpen, setIsBindOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RosterMember | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBindSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await handleAssignUser(formData);
      setIsBindOpen(false);
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    const rate = Number(formData.get("rate"));

    if (!role || isNaN(rate)) return;

    startTransition(async () => {
      await handleUpdateRoster(editingMember.id, role, rate);
      setEditingMember(null);
    });
  };

  const onDeleteClick = (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member from the workspace roster?")) {
      startTransition(async () => {
        await handleDeleteRoster(memberId);
      });
    }
  };

  // Determine if we show rates (Managers, PMs, and Lead Engineers see rates)
  const showRates = isGlobalManager || canEdit;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Workspace Roster</h3>
            {canEdit && (
              <button
                onClick={() => setIsBindOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>➕</span>
                <span>Bind Staff</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Workspace Role</th>
                  {showRates && <th className="py-3 px-4">Cost Rate</th>}
                  <th className="py-3 px-4">Joined Date</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {roster.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/30">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {member.user_name}
                      <p className="text-[10px] text-zinc-550 font-normal">
                        {member.user_email}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-850 text-zinc-300 font-semibold border border-zinc-800 text-[10px]">
                        {member.project_role}
                      </span>
                    </td>
                    {showRates && (
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">
                        ${member.hourly_rate}/hr
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="px-2.5 py-1.5 bg-zinc-850 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 hover:text-white text-zinc-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteClick(member.id)}
                          className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-white border border-red-900/25 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info card on the right */}
      <div className="lg:col-span-1">
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[220px]">
          <span className="text-2xl">👥</span>
          <h4 className="text-white text-sm font-bold">Roster Administration</h4>
          <p className="text-zinc-400 text-[11px] leading-relaxed max-w-[200px] mx-auto">
            Authorized roles (Managers, PMs, and Lead Engineers) can assign new team members, edit roles, adjust hourly rates, or release staff.
          </p>
          {canEdit && (
            <button
              onClick={() => setIsBindOpen(true)}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-550/30 transition-all cursor-pointer"
            >
              Bind Staff Modal
            </button>
          )}
        </div>
      </div>

      {/* Bind Staff Modal */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsBindOpen(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>➕</span>
                <span>Bind Staff to Workspace</span>
              </h3>
              <button
                onClick={() => setIsBindOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBindSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Select Member
                </label>
                {unassignedUsers.length === 0 ? (
                  <select
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-550 opacity-60"
                  >
                    <option>All agency users already bound</option>
                  </select>
                ) : (
                  <select
                    name="userId"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                  >
                    <option value="">Select Persona...</option>
                    {unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Project Role (Localized)
                </label>
                <select
                  name="role"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Tester">QA Tester</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Localized Cost Rate ($/hr)
                </label>
                <input
                  name="rate"
                  type="number"
                  required
                  min={0}
                  placeholder="e.g. 110"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBindOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || unassignedUsers.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center cursor-pointer"
                >
                  Bind Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Roster Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingMember(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>👥</span>
                <span>Edit Roster Member: {editingMember.user_name}</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Project Role (Localized)
                </label>
                <select
                  name="role"
                  required
                  defaultValue={editingMember.project_role}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Tester">QA Tester</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Localized Cost Rate ($/hr)
                </label>
                <input
                  name="rate"
                  type="number"
                  required
                  min={0}
                  defaultValue={editingMember.hourly_rate}
                  placeholder="e.g. 110"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
