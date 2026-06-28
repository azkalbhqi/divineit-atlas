import { getSessionUser } from "@/lib/session";
import { getProjects } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import CreateProjectModal from "./CreateProjectModal";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const projects = await getProjects(user.id, user.global_role);
  const projectIds = projects.map((p) => p.id);

  // Query project users for all visible projects to find roster sizes and localized roles
  let projectUsers: any[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("project_users")
      .select("project_id, user_id, project_role")
      .in("project_id", projectIds);
    projectUsers = data || [];
  }

  // Get project roster counts and roles helper
  const getProjectMeta = (projectId: string) => {
    const roster = projectUsers.filter((pu) => pu.project_id === projectId);
    const userRole = roster.find((pu) => pu.user_id === user.id)?.project_role;
    return {
      rosterCount: roster.length,
      userRole,
    };
  };


  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Workspace Hub
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {user.global_role === "manager"
              ? "Global administration & portfolio tracking center"
              : `Active workspaces for ${user.name}`}
          </p>
        </div>

        {/* Portfolio Quick Stats for Manager */}
        {user.global_role === "manager" && (
          <div className="flex space-x-4 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800">
            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Initiatives
              </p>
              <p className="text-lg font-bold text-white mt-0.5">{projects.length}</p>
            </div>
            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Contract Budget
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                Rp {projects.reduce((sum, p) => sum + p.total_budget, 0).toLocaleString()}
              </p>
            </div>
            <div className="px-4 py-2 bg-zinc-950/60 rounded-xl">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Real-Time Costs
              </p>
              <p className="text-lg font-bold text-rose-400 mt-0.5">
                Rp {projects.reduce((sum, p) => sum + p.total_cost, 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>📂</span>
            <span>Active Workspaces</span>
          </h2>
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full font-semibold">
              {projects.length} Found
            </span>
            {user.global_role === "manager" && <CreateProjectModal />}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-zinc-800">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              📭
            </div>
            <h3 className="text-white font-semibold text-base">No Assigned Projects</h3>
            <p className="text-zinc-550 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
              You currently do not have any project assignments. Managers can append your persona to project rosters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const { rosterCount, userRole } = getProjectMeta(project.id);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between group h-64 border border-zinc-800 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        Client: {project.client_name}
                      </span>
                      {user.global_role === "staff" && userRole && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                          {userRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                      {project.name}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>{rosterCount} assigned</span>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-400 hover:underline inline-flex items-center space-x-1 font-semibold">
                        <span>Enter Workspace</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
