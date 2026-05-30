"use server";

import { getUserByEmail, getUserById } from "@/lib/db";
import { setSessionUser, clearSessionUser } from "@/lib/session";
import { verifyPassword } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=Email and password are required.");
  }

  const user = await getUserByEmail(email);

  if (!user || !verifyPassword(password, user.hashed_password || "")) {
    redirect("/login?error=Invalid email or password.");
  }

  await setSessionUser(user.id);
  
  revalidatePath("/");
  redirect("/dashboard");
}

export async function logout() {
  await clearSessionUser();
  revalidatePath("/");
  redirect("/login");
}

export async function switchProfile(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    return { error: "User not found." };
  }

  await setSessionUser(user.id);
  revalidatePath("/");
  
  // Note: we let the client-side redirect or reload
  return { success: true };
}

