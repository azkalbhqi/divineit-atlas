import { getSessionUser } from "@/lib/session";
import { login } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const taglines = [
  "Codified by Heaven, Engineered for Earth.",
  "Elevating Innovation to a Divine Art.",
  "Flawless Code. Divine Results.",
  "Where Vision Meets Velocity.",
  "Your Tech, Blessed with Perfection."
];

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  // Pick a random tagline on load
  const tagline = taglines[Math.floor(Math.random() * taglines.length)];

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 font-sans antialiased overflow-hidden">
      
      {/* Inject custom CSS keyframe animations for premium ambient effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ambient-glow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -35px) scale(1.1); }
        }
        @keyframes ambient-glow-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-30px, 20px) scale(0.9); }
        }
        .animate-glow-1 {
          animation: ambient-glow-1 15s ease-in-out infinite;
        }
        .animate-glow-2 {
          animation: ambient-glow-2 18s ease-in-out infinite;
        }
      `}} />

      {/* LEFT COLUMN: Sign In Form (Light Theme) */}
      <div className="w-full md:w-[45%] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-12 bg-white text-zinc-900 relative z-10 shadow-2xl transition-all duration-300">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile-only logo */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm select-none">
              D
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-800">
              Divine<span className="font-black italic">IT</span>
              <span className="text-indigo-650 font-semibold ml-1">Atlas</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Sign in</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              DivineIT Workspace OS
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 text-xs text-red-750 font-medium flex items-center gap-2.5 animate-shake">
              <span className="text-red-500 text-sm">⚠️</span> 
              <span>{error}</span>
            </div>
          )}

          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="sarah@agency.com"
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 focus:bg-white transition-all text-sm duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-650 focus:bg-white transition-all text-sm duration-200 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 border border-transparent hover:border-zinc-800"
            >
              <span>Sign in to Portal</span>
              <span className="text-xs opacity-60">→</span>
            </button>
          </form>

        </div>
      </div>

      {/* RIGHT COLUMN: Brand Identity & Enhanced Showcase Taglines */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-[#0c0a35] via-[#05041a] to-[#1a0630] flex-col justify-between p-16 relative overflow-hidden select-none">

        {/* Floating Glowing Orbs (Vibrant Aesthetics) */}
        <div className="absolute top-[15%] left-[20%] w-[380px] h-[380px] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none animate-glow-1" />
        <div className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none animate-glow-2" />

        {/* Overlay Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />

        {/* Top Header Identity */}
        <div className="relative z-10 flex items-center space-x-3 self-start">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs shadow-inner">
            D
          </div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Divine<span className="text-white italic font-black">IT</span> Atlas Engine
          </span>
        </div>

        {/* Main Focus: Micro-Hero Interactive Typography for Taglines */}
        <div className="max-w-xl mx-auto space-y-8 relative z-10 my-auto text-left w-full">

          {/* Accent Line Indicator */}
          <div className="h-[2px] w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-80 animate-pulse" />

          <blockquote className="space-y-4 relative">
            <span className="absolute -top-8 -left-6 text-7xl font-serif text-indigo-500/10 select-none leading-none pointer-events-none">&ldquo;</span>
            <p className="text-white text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-zinc-50 via-white to-zinc-300 drop-shadow-sm transition-all duration-700">
              {tagline}
            </p>
          </blockquote>

          <p className="text-xs font-semibold text-indigo-300/70 tracking-widest uppercase inline-flex items-center gap-2 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            System Slogan Verified
          </p>
        </div>

        {/* Bottom Footer Environment Specs */}
        <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-zinc-500 w-full border-t border-zinc-800/60 pt-6">
          <span>SECURE PROTOCOL // TLS 1.3</span>
          <span>© {new Date().getFullYear()} DIVINEIT INC.</span>
        </div>
      </div>

    </div>
  );
}