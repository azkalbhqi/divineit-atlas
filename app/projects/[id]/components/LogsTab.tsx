"use client";

import React, { useState, useTransition } from "react";

interface TimeLog {
  id: string;
  user_name: string;
  project_role: string;
  description: string;
  hours: number;
  logged_at: string;
}

interface EvaluationReport {
  id: string;
  evaluation: string;
}

interface LogsTabProps {
  timeLogs: TimeLog[];
  reports: EvaluationReport[];
  canEdit: boolean;
  isGlobalManager: boolean;
  handleLogHours: (formData: FormData) => Promise<void>;
  handlePostReport: (formData: FormData) => Promise<void>;
  handleUpdateLog: (logId: string, hours: number, description: string) => Promise<void>;
  handleDeleteLog: (logId: string) => Promise<void>;
}

export default function LogsTab({
  timeLogs,
  reports,
  canEdit,
  isGlobalManager,
  handleLogHours,
  handlePostReport,
  handleUpdateLog,
  handleDeleteLog,
}: LogsTabProps) {
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLog) return;
    const formData = new FormData(e.currentTarget);
    const hours = Number(formData.get("hours"));
    const description = formData.get("description") as string;

    if (isNaN(hours) || !description) return;

    startTransition(async () => {
      await handleUpdateLog(editingLog.id, hours, description);
      setEditingLog(null);
    });
  };

  const onDeleteClick = (logId: string) => {
    if (confirm("Are you sure you want to delete this development time log entry?")) {
      startTransition(async () => {
        await handleDeleteLog(logId);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Task Time logs list */}
      <div className="lg:col-span-2 space-y-6">
        {/* Work logs list */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-4">Logged Work & Development Hours</h3>
          {timeLogs.length === 0 ? (
            <p className="text-zinc-555 text-xs italic py-4">No development hours logged yet</p>
          ) : (
            <div className="space-y-4">
              {timeLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 flex items-start justify-between space-x-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      {log.user_name}
                      <span className="ml-2 font-normal text-zinc-550 text-[10px]">{log.project_role}</span>
                    </p>
                    <p className="text-zinc-350 text-xs leading-relaxed">{log.description}</p>
                    <p className="text-[10px] text-zinc-550">
                      Logged on {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold whitespace-nowrap">
                      {log.hours} hrs
                    </span>
                    {canEdit && (
                      <div className="flex space-x-1.5 mt-2">
                        <button
                          onClick={() => setEditingLog(log)}
                          className="px-2.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 hover:text-white border border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-400 transition-all cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => onDeleteClick(log.id)}
                          className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-white border border-red-900/25 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Reports */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-4">Manager Evaluation Reports</h3>
          {reports.length === 0 ? (
            <p className="text-zinc-555 text-xs italic py-2">No evaluation reports logged yet</p>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-amber-300 leading-relaxed"
                >
                  <div className="flex items-center space-x-1.5 mb-2 font-semibold uppercase tracking-wider text-[10px] text-amber-400">
                    <span>📋</span>
                    <span>Project Assessment</span>
                  </div>
                  {rep.evaluation}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Time Logger Form & Evaluation Form */}
      <div className="lg:col-span-1 space-y-6">
        {/* Form: Log hours (Accessible by all rostered team members) */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Log Development Hours</h3>
          <p className="text-zinc-550 text-[11px] leading-relaxed">
            Log your work hours below. Labor costs are dynamically calculated using your localized cost rate.
          </p>

          <form action={handleLogHours} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Hours Worked
              </label>
              <input
                name="hours"
                type="number"
                required
                min={0.5}
                step={0.5}
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Task Description
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="e.g. Optimized database query performance and configured indexes..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Log Time
            </button>
          </form>
        </div>

        {/* Form: Create Evaluation (Manager Only) */}
        {isGlobalManager && (
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Assess Initiative</h3>
            <p className="text-zinc-555 text-[11px] leading-relaxed">
              Submit an overall status update and evaluation for this workspace project.
            </p>

            <form action={handlePostReport} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Evaluation Commentary
                </label>
                <textarea
                  name="evaluation"
                  rows={3}
                  required
                  placeholder="Project is currently mapping to timeline perfectly..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                Post Evaluation
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Edit Time Log Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingLog(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>⏱️</span>
                <span>Edit Logged Time Entry</span>
              </h3>
              <button
                onClick={() => setEditingLog(null)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Hours Worked
                </label>
                <input
                  name="hours"
                  type="number"
                  required
                  min={0.5}
                  step={0.5}
                  defaultValue={editingLog.hours}
                  placeholder="e.g. 4.5"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Task Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  defaultValue={editingLog.description}
                  placeholder="e.g. Optimized database query performance and configured indexes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
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
