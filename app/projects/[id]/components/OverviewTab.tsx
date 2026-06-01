"use client";

import React, { useState, useTransition } from "react";

interface ProjectData {
  id: string;
  name: string;
  description: string;
}

interface ProjectLinksData {
  project_board_url: string;
  repository_url: string;
  deployment_url: string;
  design_files_url: string;
}

interface OverviewTabProps {
  project: ProjectData;
  links: ProjectLinksData;
  canEdit: boolean;
  handleUpdateLinks: (formData: FormData) => Promise<void>;
}

export default function OverviewTab({
  project,
  links,
  canEdit,
  handleUpdateLinks,
}: OverviewTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await handleUpdateLinks(formData);
      setIsOpen(false);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Scope & Goals</h3>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {project.description || "No description provided."}
          </p>
        </div>

        {/* Resource Links Display */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Project Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={links.repository_url || "#"}
              target={links.repository_url ? "_blank" : undefined}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                links.repository_url
                  ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                  : "border-zinc-850 bg-zinc-950/20 text-zinc-600 cursor-default"
              } transition-all`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">💻</span>
                <div>
                  <p className="text-xs font-bold">Repository</p>
                  <p className="text-[10px] opacity-60 truncate max-w-[150px]">
                    {links.repository_url || "Not configured"}
                  </p>
                </div>
              </div>
              {links.repository_url && <span>↗</span>}
            </a>

            <a
              href={links.project_board_url || "#"}
              target={links.project_board_url ? "_blank" : undefined}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                links.project_board_url
                  ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                  : "border-zinc-850 bg-zinc-950/20 text-zinc-600 cursor-default"
              } transition-all`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">📋</span>
                <div>
                  <p className="text-xs font-bold">Project Board</p>
                  <p className="text-[10px] opacity-60 truncate max-w-[150px]">
                    {links.project_board_url || "Not configured"}
                  </p>
                </div>
              </div>
              {links.project_board_url && <span>↗</span>}
            </a>

            <a
              href={links.deployment_url || "#"}
              target={links.deployment_url ? "_blank" : undefined}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                links.deployment_url
                  ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                  : "border-zinc-850 bg-zinc-950/20 text-zinc-600 cursor-default"
              } transition-all`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🚀</span>
                <div>
                  <p className="text-xs font-bold">Staging / Production</p>
                  <p className="text-[10px] opacity-60 truncate max-w-[150px]">
                    {links.deployment_url || "Not configured"}
                  </p>
                </div>
              </div>
              {links.deployment_url && <span>↗</span>}
            </a>

            <a
              href={links.design_files_url || "#"}
              target={links.design_files_url ? "_blank" : undefined}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                links.design_files_url
                  ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                  : "border-zinc-850 bg-zinc-950/20 text-zinc-600 cursor-default"
              } transition-all`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎨</span>
                <div>
                  <p className="text-xs font-bold">Design Files</p>
                  <p className="text-[10px] opacity-60 truncate max-w-[150px]">
                    {links.design_files_url || "Not configured"}
                  </p>
                </div>
              </div>
              {links.design_files_url && <span>↗</span>}
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Manage Configuration Button */}
      <div className="lg:col-span-1">
        {canEdit ? (
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[220px]">
            <span className="text-2xl">🔗</span>
            <h4 className="text-white text-sm font-bold">Resource Configuration</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed max-w-[200px] mx-auto">
              Configure code repositories, tracking boards, and deployment targets for this workspace initiative.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-550/30 transition-all cursor-pointer"
            >
              Configure URLs
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[220px]">
            <span className="text-xl">ℹ️</span>
            <h4 className="text-zinc-350 text-xs font-bold">Resource Configuration</h4>
            <p className="text-zinc-550 text-[11px] leading-relaxed max-w-[200px] mx-auto">
              Workspace links are managed by workspace coordinators. Contact your project lead if updates are required.
            </p>
          </div>
        )}
      </div>

      {/* Configuration Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🔗</span>
                <span>Configure Resource URLs</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Board URL
                </label>
                <input
                  name="boardUrl"
                  type="url"
                  defaultValue={links.project_board_url}
                  placeholder="https://jira.agency.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Repository URL
                </label>
                <input
                  name="repoUrl"
                  type="url"
                  defaultValue={links.repository_url}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Deployment URL
                </label>
                <input
                  name="deployUrl"
                  type="url"
                  defaultValue={links.deployment_url}
                  placeholder="https://dev-site.net"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Design Files URL
                </label>
                <input
                  name="designUrl"
                  type="url"
                  defaultValue={links.design_files_url}
                  placeholder="https://figma.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all text-xs text-white"
                />
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
                >
                  {isPending ? "Saving..." : "Save URLs"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
