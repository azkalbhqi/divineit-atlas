"use client";

import React, { useState } from "react";
import { saveHeroSettingsAction } from "../../actions/landing-page";

interface HeroSettings {
  id?: string;
  title: string;
  subtitle: string;
  cta_text: string;
}

export default function HeroTab({ initialData }: { initialData: HeroSettings | null }) {
  const [formData, setFormData] = useState<HeroSettings>(
    initialData || {
      title: "",
      subtitle: "",
      cta_text: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    if (formData.id) data.append("id", formData.id);
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle || "");
    data.append("cta_text", formData.cta_text || "");

    const res = await saveHeroSettingsAction(data);
    setLoading(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Hero settings saved!" });
      if (!formData.id) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Hero Header Section</h3>
        <p className="text-zinc-400 text-xs mt-1">
          Customize the main entrance area of the public landing page.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/5 border-rose-500/20 text-rose-400"
          }`}
        >
          {message.type === "success" ? "✓" : "✗"} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.id && <input type="hidden" name="id" value={formData.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Main Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Digital & Software Solutions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Subtitle Description
            </label>
            <textarea
              rows={3}
              placeholder="e.g. We build high-performance web applications tailored to your business needs."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              CTA Button Text
            </label>
            <input
              type="text"
              placeholder="e.g. Explore Workspaces"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-750 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving settings...</span>
              </>
            ) : (
              <span>Save Hero Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
