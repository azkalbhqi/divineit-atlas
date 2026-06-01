import React from "react";
import Link from "next/link";
import EditProjectModal from "./EditProjectModal";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  client_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
}

interface WorkspaceHeaderProps {
  project: ProjectData;
  canEdit: boolean;
  showBudget: boolean;
}

export default function WorkspaceHeader({
  project,
  canEdit,
  showBudget,
}: WorkspaceHeaderProps) {
  return (
    <div className="border-b border-zinc-800 pb-6">
      <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
        <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
        <span>/</span>
        <span className="text-zinc-400">Workspaces</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h1>
            {canEdit && <EditProjectModal project={project} />}
          </div>
          <p className="text-sm text-zinc-400">
            Client: <span className="font-semibold text-white">{project.client_name}</span>
          </p>
        </div>
        <div className="flex space-x-6 text-xs bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl items-center">
          <div>
            <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Timeline</p>
            <p className="text-white font-medium mt-0.5">
              {project.start_date} to {project.end_date}
            </p>
          </div>
          {showBudget && (
            <div className="border-l border-zinc-850 pl-6">
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Project Budget</p>
              <p className="text-emerald-400 font-bold mt-0.5">
                ${project.total_budget.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
