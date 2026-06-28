import React from "react";
import { CompanyProfile } from "@/lib/db";

interface SenderCardProps {
  senderName: string;
  setSenderName: (val: string) => void;
  senderEmail: string;
  setSenderEmail: (val: string) => void;
  senderPhone: string;
  setSenderPhone: (val: string) => void;
  senderAddress: string;
  setSenderAddress: (val: string) => void;
  showLogo: boolean;
  logoBase64: string;
  setLogoBase64: (val: string) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  enabledFields: {
    senderName: boolean;
    senderEmail: boolean;
    senderPhone: boolean;
    senderAddress: boolean;
  };
  setEnabledFields: React.Dispatch<React.SetStateAction<any>>;
  
  // Company Profile states
  companyProfiles: CompanyProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenAddBusiness: () => void;
}

export default function SenderCard({
  senderName,
  setSenderName,
  senderEmail,
  setSenderEmail,
  senderPhone,
  setSenderPhone,
  senderAddress,
  setSenderAddress,
  showLogo,
  logoBase64,
  setLogoBase64,
  handleLogoUpload,
  enabledFields,
  setEnabledFields,
  companyProfiles,
  selectedProfileId,
  onSelectProfile,
  onOpenAddBusiness,
}: SenderCardProps) {
  const toggleField = (field: string) => {
    setEnabledFields((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center justify-between border-b pb-3 border-zinc-800/20">
        <span className="flex items-center space-x-2">
          <span>🏢</span>
          <span>Sender Information</span>
        </span>
      </h2>

      {/* Business Template Selector */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/20 border border-zinc-800/40">
        <div className="w-full sm:flex-1 space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Use Business Template</label>
          <select
            value={selectedProfileId}
            onChange={(e) => onSelectProfile(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-800 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white cursor-pointer"
          >
            <option value="" className="bg-zinc-900 text-zinc-400">--- Custom Sender Details ---</option>
            {companyProfiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                {p.business_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onOpenAddBusiness}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-650/10 hover:bg-indigo-650/20 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>➕</span>
          <span>Add Business</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {showLogo && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Company Logo</label>
            <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[110px] overflow-hidden transition-all bg-zinc-950/30">
              {logoBase64 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLogoBase64("")}
                    className="absolute top-2 right-2 bg-red-950/70 border border-red-500/20 text-red-400 hover:text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center cursor-pointer z-10"
                    title="Remove Logo"
                  >
                    ✕
                  </button>
                  <img src={logoBase64} alt="Company Logo" className="max-h-[80px] object-contain" />
                </>
              ) : (
                <label className="flex flex-col items-center justify-center space-y-1 cursor-pointer w-full h-full py-4 text-center">
                  <span className="text-xl">🖼️</span>
                  <span className="text-[10px] font-semibold text-zinc-400">Click to upload logo</span>
                  <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </label>
              )}
            </div>
          </div>
        )}

        <div className={`space-y-4 ${showLogo ? "" : "sm:col-span-2"}`}>
          <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.senderName ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Business Name</label>
              <button
                type="button"
                onClick={() => toggleField("senderName")}
                className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
              >
                {enabledFields.senderName ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={!enabledFields.senderName}
              className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
              placeholder="diviteit studio"
            />
          </div>

          <div className="sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
            <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.senderEmail ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                <button
                  type="button"
                  onClick={() => toggleField("senderEmail")}
                  className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
                >
                  {enabledFields.senderEmail ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                disabled={!enabledFields.senderEmail}
                className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
                placeholder="hello@diviteit.com"
              />
            </div>

            <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.senderPhone ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phone</label>
                <button
                  type="button"
                  onClick={() => toggleField("senderPhone")}
                  className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
                >
                  {enabledFields.senderPhone ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                disabled={!enabledFields.senderPhone}
                className="w-full bg-transparent border-b border-zinc-850 focus:border-indigo-500 py-1 text-xs focus:outline-none text-white disabled:cursor-not-allowed"
                placeholder="+62 ..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-1.5 p-3 rounded-xl border ${enabledFields.senderAddress ? "border-transparent" : "bg-zinc-950/20 border-zinc-800/40 opacity-50"}`}>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Address</label>
          <button
            type="button"
            onClick={() => toggleField("senderAddress")}
            className="text-zinc-500 hover:text-indigo-400 text-xs cursor-pointer"
          >
            {enabledFields.senderAddress ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <textarea
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          disabled={!enabledFields.senderAddress}
          className="w-full bg-transparent border border-zinc-850 focus:border-indigo-500 p-2.5 rounded-xl text-xs focus:outline-none text-white disabled:cursor-not-allowed h-16 resize-y"
          placeholder="Street address, City, Country"
        />
      </div>
    </div>
  );
}
