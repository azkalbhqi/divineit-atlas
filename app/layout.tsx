import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSessionUser } from "../lib/session";
import { getProjects } from "../lib/db";
import { logout } from "./actions/auth";
import ResponsiveLayout from "@/app/components/ResponsiveLayout";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DivineIT Atlas",
  description: "Secure Workspace Portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const projects = user ? await getProjects(user.id, user.global_role) : [];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-zinc-950 text-zinc-100 flex overflow-hidden">
        {user ? (
          <ResponsiveLayout user={user} projects={projects} logoutAction={logout}>
            {children}
          </ResponsiveLayout>
        ) : (
          // Unauthenticated Page (e.g. Login)
          <main className="w-full min-h-screen">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
