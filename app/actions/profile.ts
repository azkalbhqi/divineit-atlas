"use server";

import { getSessionUser } from "@/lib/session";
import { getUserByEmail, updateUserPassword } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect("/login");
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/profile?error=All password fields are required.");
  }

  if (newPassword !== confirmPassword) {
    redirect("/profile?error=New passwords do not match.");
  }

  if (newPassword.length < 6) {
    redirect("/profile?error=New password must be at least 6 characters long.");
  }

  // Fetch full user record including password
  const fullUser = await getUserByEmail(currentUser.email);
  if (!fullUser) {
    redirect("/profile?error=Failed to resolve user session.");
  }

  // Verify current password
  const isCurrentPasswordCorrect = verifyPassword(currentPassword, fullUser.hashed_password || "");
  if (!isCurrentPasswordCorrect) {
    redirect("/profile?error=Incorrect current password.");
  }

  try {
    await updateUserPassword(currentUser.id, newPassword);
    revalidatePath("/profile");
    redirect("/profile?success=Password changed successfully.");
  } catch (error: any) {
    redirect(`/profile?error=${encodeURIComponent(error.message || "Failed to update password.")}`);
  }
}
