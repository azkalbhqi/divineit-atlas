"use client";

import React, { useState } from "react";
import Link from "next/link";
import HeroTab from "./components/HeroTab";
import PortfolioTab from "./components/PortfolioTab";
import TestimonialsTab from "./components/TestimonialsTab";
import PackagesTab from "./components/PackagesTab";

interface PageProps {
  hero: any;
  portfolios: any[];
  testimonials: any[];
  packages: any[];
}

export default function LandingPageClient({ hero, portfolios, testimonials, packages }: PageProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "portfolio" | "testimonials" | "packages">("hero");

  const tabs = [
    { id: "hero", label: "Hero Settings", icon: "✨" },
    { id: "portfolio", label: "Portfolio Showcase", icon: "💼" },
    { id: "testimonials", label: "Testimonials", icon: "💬" },
    { id: "packages", label: "Pricing Packages", icon: "🏷️" },
  ] as const;

  return (
    <div className="flex-1 p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
          <span>/</span>
          <span className="text-zinc-400">Landing Page Control</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>🌐</span>
          <span>Landing Page Administration</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Directly configure copywriting, graphics, projects, client reviews, and price plans.
        </p>
      </div>

      {/* Responsive Tab Bar */}
      <div className="flex border-b border-zinc-850 overflow-x-auto space-x-6 select-none scrollbar-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs font-bold transition-all relative flex items-center space-x-2 shrink-0 ${
                active
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "hero" && <HeroTab initialData={hero} />}
        {activeTab === "portfolio" && <PortfolioTab initialItems={portfolios} />}
        {activeTab === "testimonials" && <TestimonialsTab initialItems={testimonials} portfolios={portfolios} />}
        {activeTab === "packages" && <PackagesTab initialItems={packages} />}
      </div>
    </div>
  );
}
