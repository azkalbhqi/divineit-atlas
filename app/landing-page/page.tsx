import { getSessionUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import LandingPageClient from "./LandingPageClient";

export default async function LandingPageSettings() {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    redirect("/login");
  }

  // 403 Security Gate
  if (currentUser.global_role !== "manager") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[70vh] z-10">
        <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center text-2xl mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-white">403 Unauthorized Action</h1>
        <p className="text-zinc-500 text-xs mt-2 max-w-sm leading-relaxed">
          Access Denied. Landing page controls and portfolio administration interfaces are restricted exclusively to Agency Managers.
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

  // Fetch data safely, catching table relation errors
  try {
    const [heroRes, portfolioRes, testimonialsRes, packagesRes] = await Promise.all([
      supabase.from("hero_settings").select("*").maybeSingle(),
      supabase.from("portfolios").select("*").order("order_index", { ascending: true }),
      supabase.from("testimonials").select("*").order("order_index", { ascending: true }),
      supabase.from("packages").select("*").order("order_index", { ascending: true }),
    ]);

    // Check for relation missing errors (PostgREST code for "relation does not exist" is 42P01)
    const errors = [heroRes.error, portfolioRes.error, testimonialsRes.error, packagesRes.error].filter(Boolean);
    const missingTablesError = errors.find((e) => e?.code === "42P01");

    if (missingTablesError) {
      return <SetupSQLPanel />;
    }

    return (
      <LandingPageClient
        hero={heroRes.data || null}
        portfolios={portfolioRes.data || []}
        testimonials={testimonialsRes.data || []}
        packages={packagesRes.data || []}
      />
    );
  } catch (error) {
    console.error("Landing Page fetch failed:", error);
    return <SetupSQLPanel />;
  }
}

function SetupSQLPanel() {
  const ddlSql = `-- 1. Create hero_settings table
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial row
INSERT INTO hero_settings (title, subtitle, cta_text)
SELECT 'DIVINE IT', '“Codified by Heaven, Engineered for Earth.”', 'See Our Service'
WHERE NOT EXISTS (SELECT 1 FROM hero_settings);

-- 2. Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  porto_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div className="flex-1 p-8 space-y-6 relative z-10 max-w-4xl mx-auto">
      <div className="p-6 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-4">
        <div className="flex items-center space-x-3 text-amber-500">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="text-base font-bold text-white">Database Migration Required</h2>
            <p className="text-xs text-zinc-400">
              The database tables required for the landing page controls do not exist yet in your Supabase instance.
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Please open your{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 font-bold hover:underline"
          >
            Supabase Dashboard
          </a>
          , navigate to the **SQL Editor**, paste the following DDL script, and click **Run**. Once completed, refresh this page.
        </p>

        <div className="relative">
          <pre className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl overflow-x-auto text-[10px] text-zinc-350 font-mono leading-normal max-h-[300px]">
            {ddlSql}
          </pre>
        </div>
      </div>
    </div>
  );
}
