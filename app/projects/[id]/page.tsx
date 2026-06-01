import { getSessionUser } from "@/lib/session";
import { getProjectDetail, getUsers } from "@/lib/db";
import {
  updateProjectLinksAction,
  assignUserAction,
  addTimeLogAction,
  addProjectReportAction,
  updateTimeLogAction,
  deleteTimeLogAction,
  updateRosterAction,
  deleteRosterAction,
} from "@/app/actions/projects";
import { redirect } from "next/navigation";
import Link from "next/link";

import WorkspaceHeader from "./components/WorkspaceHeader";
import OverviewTab from "./components/OverviewTab";
import RosterTab from "./components/RosterTab";
import LogsTab from "./components/LogsTab";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = tabParam || "overview";

  // Fetch project details. If user is Staff and not in roster, this returns null
  const detail = await getProjectDetail(id, user.id, user.global_role);

  if (!detail) {
    // 403 Access Denied
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center text-2xl mb-4">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-white">403 Unauthorized Access</h1>
        <p className="text-zinc-500 text-xs mt-2 max-w-sm leading-relaxed">
          You do not have access to this workspace. Standard Staff personas are restricted to projects in their assigned rosters.
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

  const { project, links, roster, reports, timeLogs } = detail;
  const allUsers = await getUsers();

  // Filter users not currently in the roster for assignments dropdown
  const rosterUserIds = roster.map((r) => r.user_id);
  const unassignedUsers = allUsers.filter((u) => !rosterUserIds.includes(u.id));

  // Determine role-based edit permissions (Manager globally, or Project Manager / Lead Engineer in roster)
  const isGlobalManager = user.global_role === "manager";
  const userRosterEntry = roster.find((r) => r.user_id === user.id);
  const userProjectRole = userRosterEntry ? userRosterEntry.project_role : null;
  const canEdit = isGlobalManager || userProjectRole === "Project Manager" || userProjectRole === "Lead Engineer";

  // Server actions wrapper handlers
  async function handleUpdateLinks(formData: FormData) {
    "use server";
    const data = {
      project_board_url: formData.get("boardUrl") as string,
      repository_url: formData.get("repoUrl") as string,
      deployment_url: formData.get("deployUrl") as string,
      design_files_url: formData.get("designUrl") as string,
    };
    await updateProjectLinksAction(id, data);
    redirect(`/projects/${id}?tab=overview`);
  }

  async function handleAssignUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    const rate = Number(formData.get("rate"));

    if (!userId || !role || isNaN(rate)) return;
    await assignUserAction(id, userId, role, rate);
    redirect(`/projects/${id}?tab=roster`);
  }

  async function handleLogHours(formData: FormData) {
    "use server";
    const hours = Number(formData.get("hours"));
    const description = formData.get("description") as string;

    if (isNaN(hours) || !description) return;
    await addTimeLogAction(id, hours, description);
    redirect(`/projects/${id}?tab=logs`);
  }

  async function handleAddReport(formData: FormData) {
    "use server";
    const evalText = formData.get("evaluation") as string;
    if (!evalText) return;
    await addProjectReportAction(id, evalText);
    redirect(`/projects/${id}?tab=logs`);
  }

  async function handleUpdateLog(logId: string, hours: number, description: string) {
    "use server";
    await updateTimeLogAction(id, logId, hours, description);
    redirect(`/projects/${id}?tab=logs`);
  }

  async function handleDeleteLog(logId: string) {
    "use server";
    await deleteTimeLogAction(id, logId);
    redirect(`/projects/${id}?tab=logs`);
  }

  async function handleUpdateRoster(rosterId: string, role: string, rate: number) {
    "use server";
    await updateRosterAction(id, rosterId, role, rate);
    redirect(`/projects/${id}?tab=roster`);
  }

  async function handleDeleteRoster(rosterId: string) {
    "use server";
    await handleDeleteRosterAction(rosterId);
  }

  // Separate action wrapper specifically to bypass dynamic closures
  async function handleDeleteRosterAction(rosterId: string) {
    "use server";
    await deleteRosterAction(id, rosterId);
    redirect(`/projects/${id}?tab=roster`);
  }

  return (
    <div className="flex-1 p-8 space-y-6 relative z-10">
      {/* Workspace Header */}
      <WorkspaceHeader
        project={project}
        canEdit={canEdit}
        showBudget={isGlobalManager}
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800/80 space-x-1">
        <Link
          href={`/projects/${id}?tab=overview`}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            tab === "overview"
              ? "border-indigo-500 text-white bg-indigo-500/5"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          📋 Overview
        </Link>
        <Link
          href={`/projects/${id}?tab=roster`}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            tab === "roster"
              ? "border-indigo-500 text-white bg-indigo-500/5"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          👥 Roster & Team
        </Link>
        <Link
          href={`/projects/${id}?tab=logs`}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            tab === "logs"
              ? "border-indigo-500 text-white bg-indigo-500/5"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          ⏱️ Tasks & Logged Hours
        </Link>
        <Link
          href={`/projects/${id}/financials`}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            isGlobalManager
              ? "border-transparent text-zinc-400 hover:text-emerald-400"
              : "border-transparent text-zinc-650 cursor-not-allowed"
          }`}
        >
          {isGlobalManager ? "📊 Financials" : "📊 Financials 🔒"}
        </Link>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {tab === "overview" && (
          <OverviewTab
            project={project}
            links={links}
            canEdit={canEdit}
            handleUpdateLinks={handleUpdateLinks}
          />
        )}

        {tab === "roster" && (
          <RosterTab
            roster={roster}
            unassignedUsers={unassignedUsers}
            canEdit={canEdit}
            isGlobalManager={isGlobalManager}
            handleAssignUser={handleAssignUser}
            handleUpdateRoster={handleUpdateRoster}
            handleDeleteRoster={handleDeleteRoster}
          />
        )}

        {tab === "logs" && (
          <LogsTab
            timeLogs={timeLogs}
            reports={reports}
            canEdit={canEdit}
            isGlobalManager={isGlobalManager}
            handleLogHours={handleLogHours}
            handlePostReport={handleAddReport}
            handleUpdateLog={handleUpdateLog}
            handleDeleteLog={handleDeleteLog}
          />
        )}
      </div>
    </div>
  );
}
