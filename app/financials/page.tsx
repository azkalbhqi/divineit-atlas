import { getSessionUser } from "@/lib/session";
import { getGlobalPortfolioFinancials } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function GlobalFinancialsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Route security gate: Intercept non-Manager attempts
  if (user.global_role !== "manager") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center text-2xl mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-white">403 Unauthorized Action</h1>
        <p className="text-zinc-500 text-xs mt-2 max-w-sm leading-relaxed">
          Access Denied. Global portfolio financials are restricted exclusively to Agency Managers.
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
  const financials = await getGlobalPortfolioFinancials();

  const {
    projectBreakdown,
    totalBudget,
    totalOperationalCost,
    totalLaborCost,
    totalSpent,
    totalRemaining,
    portfolioUtilizationPct,
  } = financials;

  const isOverBudget = totalSpent > totalBudget;

  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <span className="text-zinc-400">Global Financials</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>💳</span>
          <span>Global Portfolio Financials</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Aggregated agency metrics, initiative outlays, and budget utilization
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

      {/* Summary Capital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Portfolio Budget</p>
          <p className="text-2xl font-bold text-white mt-1.5">Rp {totalBudget.toLocaleString()}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Operational Costs (Ops)</p>
          <p className="text-2xl font-bold text-rose-400 mt-1.5">Rp {totalOperationalCost.toLocaleString()}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Labor Expenditures (Dev)</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1.5">Rp {totalLaborCost.toLocaleString()}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {totalRemaining >= 0 ? "Portfolio Profit Runway" : "Portfolio Deficit"}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            Rp {totalRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Capital Utilization Progress Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span>Global Capital Utilization</span>
          <span className={isOverBudget ? "text-red-400 font-bold" : "text-indigo-400"}>
            {portfolioUtilizationPct}% spent (Rp {totalSpent.toLocaleString()} of Rp {totalBudget.toLocaleString()})
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5 flex">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? "bg-gradient-to-r from-red-600 to-rose-500"
                : portfolioUtilizationPct > 80
                ? "bg-gradient-to-r from-amber-500 to-orange-400"
                : "bg-gradient-to-r from-indigo-500 to-emerald-400"
            }`}
            style={{ width: `${Math.min(portfolioUtilizationPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Aggregated Project Ledger (Table) */}
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <span>📂</span>
          <span>Aggregated Initiative Ledger</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">Initiative Name</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Roster</th>
                <th className="py-3 px-4 text-right">Contract Budget</th>
                <th className="py-3 px-4 text-right">Ops Cost</th>
                <th className="py-3 px-4 text-right">Labor Cost</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {projectBreakdown.map((proj) => (
                <tr key={proj.id} className="hover:bg-zinc-900/20">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <Link href={`/projects/${proj.id}`} className="hover:text-indigo-400 hover:underline">
                      {proj.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">{proj.client_name}</td>
                  <td className="py-3.5 px-4 text-zinc-400 font-semibold">{proj.rosterCount} members</td>
                  <td className="py-3.5 px-4 text-right font-semibold">Rp {Number(proj.total_budget).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-rose-450">Rp {proj.operationalCost.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-indigo-455">Rp {proj.laborCost.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">Rp {proj.accumulatedCost.toLocaleString()}</td>
                  <td className={`py-3.5 px-4 text-right font-semibold ${proj.remainingBudget < 0 ? "text-red-400" : "text-emerald-450"}`}>
                    Rp {proj.remainingBudget.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      proj.remainingBudget < 0
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : proj.utilizationPct > 80
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {proj.utilizationPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
