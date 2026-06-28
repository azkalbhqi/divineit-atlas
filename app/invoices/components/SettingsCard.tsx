import React from "react";

interface SettingsCardProps {
  invoiceNumber: string;
  setInvoiceNumber: (val: string) => void;
  currency: string;
  onCurrencyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  currencies: Array<{ value: string; label: string }>;
  issueDate: string;
  setIssueDate: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
  terms: string;
  setTerms: (val: string) => void;
  enabledFields: {
    invoiceNumber: boolean;
    issueDate: boolean;
    dueDate: boolean;
    paymentTerms: boolean;
  };
  setEnabledFields: React.Dispatch<React.SetStateAction<any>>;
  headerPosition: "right" | "left";
  setHeaderPosition: (val: "right" | "left") => void;
}

export default function SettingsCard({
  invoiceNumber,
  setInvoiceNumber,
  currency,
  onCurrencyChange,
  currencies,
  issueDate,
  setIssueDate,
  dueDate,
  setDueDate,
  terms,
  setTerms,
  enabledFields,
  setEnabledFields,
  headerPosition,
  setHeaderPosition,
}: SettingsCardProps) {
  const toggleField = (field: string) => {
    setEnabledFields((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center space-x-2 border-b pb-3 border-zinc-800/20">
        <span>📄</span>
        <span>Invoice Settings</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.invoiceNumber ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Invoice Number</label>
            <button
              type="button"
              onClick={() => toggleField("invoiceNumber")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
              title="Toggle Visibility"
            >
              {enabledFields.invoiceNumber ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="text"
            value={invoiceNumber}
            disabled={true}
            className="w-full bg-transparent border-b border-zinc-850 py-1 text-xs focus:outline-none text-zinc-400 cursor-not-allowed"
            placeholder="Auto-generated"
            title="Automatically generated: INV-[order]-[date]"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-xl border border-transparent">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Currency</label>
          <select
            value={currency}
            onChange={onCurrencyChange}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.value} value={c.value} className="bg-zinc-900 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.issueDate ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Issue Date</label>
            <button
              type="button"
              onClick={() => toggleField("issueDate")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.issueDate ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={!enabledFields.issueDate}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed [color-scheme:dark]"
          />
        </div>

        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.dueDate ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Due Date</label>
            <button
              type="button"
              onClick={() => toggleField("dueDate")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.dueDate ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={!enabledFields.dueDate}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed [color-scheme:dark]"
          />
        </div>

        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.paymentTerms ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Terms</label>
            <button
              type="button"
              onClick={() => toggleField("paymentTerms")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.paymentTerms ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="text"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            disabled={!enabledFields.paymentTerms}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
            placeholder="Due on Receipt"
          />
        </div>
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/30">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Header Title Position</label>
          <select
            value={headerPosition}
            onChange={(e) => setHeaderPosition(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs cursor-pointer text-white"
          >
            <option value="right">Right (Default)</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>
    </div>
  );
}
