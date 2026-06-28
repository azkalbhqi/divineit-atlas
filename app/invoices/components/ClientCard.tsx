import React from "react";

interface ClientCardProps {
  clientName: string;
  setClientName: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  clientPhone: string;
  setClientPhone: (val: string) => void;
  clientAddress: string;
  setClientAddress: (val: string) => void;
  enabledFields: {
    clientName: boolean;
    clientEmail: boolean;
    clientPhone: boolean;
    clientAddress: boolean;
  };
  setEnabledFields: React.Dispatch<React.SetStateAction<any>>;
  clientAlign: "left" | "center" | "right";
  setClientAlign: (val: "left" | "center" | "right") => void;
  addressOrder: "normal" | "reverse";
  setAddressOrder: (val: "normal" | "reverse") => void;
}

export default function ClientCard({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  enabledFields,
  setEnabledFields,
  clientAlign,
  setClientAlign,
  addressOrder,
  setAddressOrder,
}: ClientCardProps) {
  const toggleField = (field: string) => {
    setEnabledFields((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center space-x-2 border-b pb-3 border-zinc-800/20">
        <span>👥</span>
        <span>Client Information (Bill To)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.clientName ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Client Name</label>
            <button
              type="button"
              onClick={() => toggleField("clientName")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.clientName ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={!enabledFields.clientName}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
            placeholder="Client Company or Individual Name"
          />
        </div>

        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.clientEmail ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
            <button
              type="button"
              onClick={() => toggleField("clientEmail")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.clientEmail ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            disabled={!enabledFields.clientEmail}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
            placeholder="client@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.clientPhone ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
            <button
              type="button"
              onClick={() => toggleField("clientPhone")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.clientPhone ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <input
            type="text"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            disabled={!enabledFields.clientPhone}
            className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
            placeholder="Client Phone Number"
          />
        </div>

        <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.clientAddress ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Address</label>
            <button
              type="button"
              onClick={() => toggleField("clientAddress")}
              className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
            >
              {enabledFields.clientAddress ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <textarea
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            disabled={!enabledFields.clientAddress}
            className="w-full bg-transparent border border-zinc-850 focus:border-indigo-500 p-2.5 rounded-xl text-xs focus:outline-none text-white disabled:cursor-not-allowed h-16 resize-y"
            placeholder="Client Billing Address"
          />
        </div>
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/30">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Client Alignment</label>
          <select
            value={clientAlign}
            onChange={(e) => setClientAlign(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs cursor-pointer text-white"
          >
            <option value="left">Left Alignment</option>
            <option value="center">Center Alignment</option>
            <option value="right">Right Alignment</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Address Block Order</label>
          <select
            value={addressOrder}
            onChange={(e) => setAddressOrder(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs cursor-pointer text-white"
          >
            <option value="normal">Sender Left, Client Right</option>
            <option value="reverse">Client Left, Sender Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}
