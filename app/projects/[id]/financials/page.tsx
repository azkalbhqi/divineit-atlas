import { getSessionUser } from "@/lib/session";
import { getProjectFinancials } from "@/lib/db";
import { addExpenseAction } from "@/app/actions/projects";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectFinancialsPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Enforce global manager role validation
  if (user.global_role !== "manager") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center text-2xl mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-white">403 Unauthorized Access</h1>
        <p className="text-zinc-500 text-xs mt-2 max-w-sm leading-relaxed">
          Access Denied. Workspace financials, cost breakdowns, and operational expense logs are restricted exclusively to Agency Managers.
        </p>
        <Link
          href={`/projects/${id}`}
          className="mt-6 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-white border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
        >
          Return to Workspace
        </Link>
      </div>
    );
  }

  const details = await getProjectFinancials(id);
  if (!details) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-full flex items-center justify-center text-2xl mb-4">
          🔍
        </div>
        <h1 className="text-xl font-bold text-white">Workspace Not Found</h1>
        <p className="text-zinc-550 text-xs mt-2 max-w-sm leading-relaxed">
          The requested workspace does not exist or has been removed from the portal registries.
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

  const {
    project,
    expenses,
    laborBreakdown,
    totalLaborCost,
    totalExpensesCost,
    accumulatedCost,
  } = details;

  const budget = Number(project.total_budget);
  const remaining = budget - accumulatedCost;
  const isOverBudget = remaining < 0;
  const marginPct = budget > 0 ? Math.round((remaining / budget) * 100) : 0;
  const burnPct = budget > 0 ? Math.round((accumulatedCost / budget) * 100) : 0;

  // Server Action wrapper handler
  async function handleAddExpense(formData: FormData) {
    "use server";
    const label = formData.get("label") as string;
    const amount = Number(formData.get("costAmount"));

    if (!label || isNaN(amount) || amount <= 0) return;
    await addExpenseAction(id, label, amount);
    redirect(`/projects/${id}/financials`);
  }

  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header breadcrumbs */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-indigo-400">{project.name}</Link>
          <span>/</span>
          <span className="text-zinc-400">Financial Ledger</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>📊</span>
          <span>{project.name} Financials</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Detailed labor cost burndown, operational expenditures, and workspace margin metrics.
        </p>
      </div>

      {/* Tabs list matching parent workspace view */}
      <div className="flex border-b border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link
          href={`/projects/${id}?tab=overview`}
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-zinc-400 hover:text-white transition-all"
        >
          📄 Overview & Scope
        </Link>
        <Link
          href={`/projects/${id}?tab=roster`}
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-zinc-400 hover:text-white transition-all"
        >
          👥 Roster & Team
        </Link>
        <Link
          href={`/projects/${id}?tab=logs`}
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-zinc-400 hover:text-white transition-all"
        >
          ⏱️ Tasks & Logged Hours
        </Link>
        <Link
          href={`/projects/${id}/financials`}
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-emerald-500 text-white bg-emerald-500/5 transition-all"
        >
          📊 Financials
        </Link>
      </div>

      {/* Capital cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Budget */}
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Contract Budget</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            Rp {budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 font-semibold uppercase">Initial cap target</div>
        </div>

        {/* Card 2: Accumulated Spent */}
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Portfolio Cost</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            Rp {accumulatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 font-semibold uppercase flex items-center justify-between">
            <span>{burnPct}% of budget burned</span>
            {budget > 0 && (
              <span className="w-16 h-1.5 bg-zinc-850 rounded-full overflow-hidden inline-block ml-1">
                <span className="h-full bg-indigo-500 block" style={{ width: `${Math.min(burnPct, 100)}%` }} />
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Labor Cost */}
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Labor Cost Burndown</p>
          <p className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Rp {totalLaborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 font-semibold uppercase">
            {laborBreakdown.reduce((sum, lb) => sum + lb.totalHours, 0)} hours logged total
          </div>
        </div>

        {/* Card 4: Remaining Margin */}
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Remaining Margin runway</p>
          <p className={`text-2xl font-extrabold tracking-tight ${isOverBudget ? 'text-red-500' : 'text-emerald-400'}`}>
            Rp {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] font-semibold uppercase">
            {isOverBudget ? (
              <span className="text-red-400">⚠️ OVER BUDGET BY {Math.abs(marginPct)}%</span>
            ) : (
              <span className="text-emerald-500">{marginPct}% profit margin left</span>
            )}
          </div>
        </div>
      </div>

      {/* Roster labor and expenses split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Roster labor table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>👥</span>
            <span>Roster Cost Burndown Details</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px] pb-2">
                  <th className="py-2.5 px-3">Roster Member</th>
                  <th className="py-2.5 px-3">Workspace Role</th>
                  <th className="py-2.5 px-3">Hourly Rate</th>
                  <th className="py-2.5 px-3 text-center">Hours Logged</th>
                  <th className="py-2.5 px-3 text-right">Burndown Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {laborBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-zinc-500 italic">
                      No team members assigned or no logged hours recorded.
                    </td>
                  </tr>
                ) : (
                  laborBreakdown.map((lb) => (
                    <tr key={lb.userId} className="hover:bg-zinc-900/10">
                      <td className="py-3 px-3 font-semibold text-white">{lb.userName}</td>
                      <td className="py-3 px-3 text-zinc-400">{lb.projectRole}</td>
                      <td className="py-3 px-3 text-zinc-550">Rp {Number(lb.hourlyRate).toFixed(2)}/hr</td>
                      <td className="py-3 px-3 text-center text-zinc-350">{lb.totalHours.toFixed(1)} hrs</td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-200">
                        Rp {lb.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Logged operational outlays form & display */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add expense form */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>💳</span>
              <span>Log Operational Outlay</span>
            </h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Record external operational expenses such as infrastructure licenses, cloud resource allocations, or tooling subscriptions.
            </p>
            <form action={handleAddExpense} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Expense Label *
                </label>
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="e.g. AWS Production Billing May"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Expense Amount (Rp IDR) *
                </label>
                <input
                  name="costAmount"
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 249.99"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
              >
                Log Outlay
              </button>
            </form>
          </div>

          {/* Expenses list */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Logged Expenses</h3>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                Total: Rp {totalExpensesCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-xs text-zinc-550 italic text-center py-4">No operational expenses logged</p>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-start text-xs border-b border-zinc-850/60 pb-2">
                    <div>
                      <p className="font-semibold text-white">{exp.label}</p>
                      <p className="text-[10px] text-zinc-550">{new Date(exp.logged_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-zinc-300">Rp {Number(exp.cost_amount).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
