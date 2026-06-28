"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectAction, deleteProjectAction } from "@/app/actions/projects";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  client_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
}

interface EditProjectModalProps {
  project: ProjectData;
}

export default function EditProjectModal({ project }: EditProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const clientName = formData.get("clientName") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const budget = Number(formData.get("budget"));

    if (!name || !clientName || !startDate || !endDate || isNaN(budget)) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const res = await updateProjectAction(project.id, {
        name,
        description,
        clientName,
        startDate,
        endDate,
        budget,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    setError("");
    if (confirmName !== project.name) {
      setError("Project name confirmation does not match.");
      return;
    }

    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
        setIsDeleting(false);
        router.push("/dashboard");
      }
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsDeleting(false);
          setConfirmName("");
          setError("");
        }}
        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
      >
        <span>⚙️</span>
        <span>Edit Workspace</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>⚙️</span>
                <span>{isDeleting ? "Delete Workspace" : "Edit Workspace Parameters"}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl border border-red-500/15 bg-red-500/5 text-xs text-red-400 font-medium">
                ⚠️ {error}
              </div>
            )}

            {!isDeleting ? (
              <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Project Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={project.name}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    name="clientName"
                    type="text"
                    required
                    defaultValue={project.client_name}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Scope Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={project.description}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Start Date *
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={project.start_date}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      End Date *
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      required
                      defaultValue={project.end_date}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Total Contract Budget (Rp IDR) *
                  </label>
                  <input
                    name="budget"
                    type="number"
                    required
                    min={0}
                    defaultValue={project.total_budget}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                  />
                </div>

                {/* Destructive Deletion Link/Option */}
                <div className="pt-4 border-t border-zinc-850 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-550 leading-relaxed max-w-[280px]">
                    To permanently destroy this workspace, including roster links, time logs, and expenses.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleting(true);
                      setError("");
                    }}
                    className="px-3.5 py-2 bg-red-950/40 text-red-400 border border-red-900/35 hover:bg-red-900/40 hover:text-white rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    Delete Workspace
                  </button>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1"
                  >
                    <span>{isPending ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="p-3 bg-red-950/30 border border-red-550/15 rounded-xl text-xs text-red-400 leading-relaxed">
                  <strong>Warning:</strong> Deleting a workspace is a destructive process. All links, time logs, evaluation reports, and expenses will be permanently wiped out. This cannot be undone.
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-relaxed">
                    Type project name <span className="text-white font-bold">&quot;{project.name}&quot;</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-900 transition-all text-xs text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsDeleting(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending || confirmName !== project.name}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
                  >
                    {isPending ? "Deleting..." : "Confirm & Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
