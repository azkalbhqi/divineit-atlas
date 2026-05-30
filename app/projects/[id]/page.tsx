import { getSessionUser } from "@/lib/session";
import { getProjectDetail, getUsers } from "@/lib/db";
import {
  updateProjectLinksAction,
  assignUserAction,
  addTimeLogAction,
  addProjectReportAction,
} from "@/app/actions/projects";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  // Fetch project details. If user is Staff and not in roster, this returns null (Security Isolation - Requirement 3.2.1)
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

  return (
    <div className="flex-1 p-8 space-y-6 relative z-10">
      {/* Workspace Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <span className="text-zinc-400">Workspaces</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">Client: <span className="font-semibold text-white">{project.client_name}</span></p>
          </div>
          <div className="flex space-x-6 text-xs bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl">
            <div>
              <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Timeline</p>
              <p className="text-white font-medium mt-0.5">{project.start_date} to {project.end_date}</p>
            </div>
            {user.global_role === "manager" && (
              <div className="border-l border-zinc-850 pl-6">
                <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Project Budget</p>
                <p className="text-emerald-400 font-bold mt-0.5">${project.total_budget.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
            user.global_role === "manager"
              ? "border-transparent text-zinc-400 hover:text-emerald-400"
              : "border-transparent text-zinc-600 hover:text-red-400 cursor-not-allowed"
          }`}
        >
          {user.global_role === "manager" ? "📊 Financials" : "📊 Financials 🔒"}
        </Link>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Scope & Goals</h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
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

            {/* Links Editor Form (Manager Only) */}
            <div className="lg:col-span-1">
              {user.global_role === "manager" ? (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white mb-4">Edit Resource URLs</h3>
                  <form action={handleUpdateLinks} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        Board URL
                      </label>
                      <input
                        name="boardUrl"
                        type="url"
                        defaultValue={links.project_board_url}
                        placeholder="https://jira.agency.com/..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      Save URLs
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center">
                  <span className="text-xl">ℹ️</span>
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                    Workspace links are managed by agency Managers. Contact your PM if link updates are required.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ROSTER & ASSIGNMENTS */}
        {tab === "roster" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-4">Workspace Roster</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Workspace Role</th>
                        {user.global_role === "manager" && (
                          <th className="py-3 px-4">Cost Rate</th>
                        )}
                        <th className="py-3 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {roster.map((member) => (
                        <tr key={member.id} className="hover:bg-zinc-900/30">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {member.user_name}
                            <p className="text-[10px] text-zinc-500 font-normal">{member.user_email}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-850 text-zinc-300 font-semibold border border-zinc-800 text-[10px]">
                              {member.project_role}
                            </span>
                          </td>
                          {user.global_role === "manager" && (
                            <td className="py-3.5 px-4 font-semibold text-emerald-400">
                              ${member.hourly_rate}/hr
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-zinc-400">
                            {new Date(member.joined_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Roster Assignment Tool (Manager Only) */}
            <div className="lg:col-span-1">
              {user.global_role === "manager" ? (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white mb-2">Bind Staff to Workspace</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">
                    Lookup and append a team member, defining a localized role and labor rate for this specific project.
                  </p>

                  <form action={handleAssignUser} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        Select Member
                      </label>
                      {unassignedUsers.length === 0 ? (
                        <select
                          disabled
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-zinc-500 opacity-60"
                        >
                          <option>All agency users already bound</option>
                        </select>
                      ) : (
                        <select
                          name="userId"
                          required
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={unassignedUsers.length === 0}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      Bind Persona to Roster
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center">
                  <span className="text-xl">🔒</span>
                  <h4 className="font-semibold text-zinc-300 text-xs mt-2">Roster Management</h4>
                  <p className="text-zinc-500 text-[11px] mt-1 leading-relaxed">
                    Binding members and adjusting hourly costs requires Manager authorization.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TASKS, TIME LOGS & EVALUATIONS */}
        {tab === "logs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Time logs list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Work logs list */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-4">Logged Work & Development Hours</h3>
                {timeLogs.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic py-4">No development hours logged yet</p>
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
                            <span className="ml-2 font-normal text-zinc-500 text-[10px]">{log.project_role}</span>
                          </p>
                          <p className="text-zinc-350 text-xs leading-relaxed">{log.description}</p>
                          <p className="text-[10px] text-zinc-500">
                            Logged on {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold whitespace-nowrap">
                          {log.hours} hrs
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Evaluation Reports */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-4">Manager Evaluation Reports</h3>
                {reports.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic py-2">No evaluation reports logged yet</p>
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

            {/* Time Logger Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form: Log hours (Accessible by all rostered team members) */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Log Development Hours</h3>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
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
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
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
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    Log Time
                  </button>
                </form>
              </div>

              {/* Form: Create Evaluation (Manager Only) */}
              {user.global_role === "manager" && (
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Assess Initiative</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Submit an overall status update and evaluation for this workspace project.
                  </p>

                  <form action={handleAddReport} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        Evaluation Commentary
                      </label>
                      <textarea
                        name="evaluation"
                        rows={3}
                        required
                        placeholder="Project is currently mapping to timeline perfectly..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all"
                    >
                      Post Evaluation
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
