"use server";

import { getSessionUser } from "@/lib/session";
import { createUser, deleteUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createUserAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.global_role !== "manager") {
    throw new Error("403 Unauthorized: Managers only");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const globalRole = formData.get("globalRole") as "manager" | "staff";
  const password = formData.get("password") as string;

  if (!name || !email || !globalRole || !password) {
    redirect("/users?error=Please fill all user account fields.");
  }

  try {
    await createUser(name, email, globalRole, password);
    revalidatePath("/users");
    redirect("/users?success=User account created successfully.");
  } catch (error: any) {
    redirect(`/users?error=${encodeURIComponent(error.message || "Failed to create user")}`);
  }
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.global_role !== "manager") {
    throw new Error("403 Unauthorized: Managers only");
  }

  const id = formData.get("userId") as string;
  if (!id) {
    redirect("/users?error=Missing user ID to delete.");
  }

  // Prevent self-deletion
  if (id === currentUser.id) {
    redirect("/users?error=Critical: You cannot delete your own active administrator account.");
  }

  try {
    await deleteUser(id);
    revalidatePath("/users");
    revalidatePath("/dashboard");
    redirect("/users?success=User account deleted successfully.");
  } catch (error: any) {
    redirect(`/users?error=${encodeURIComponent(error.message || "Failed to delete user")}`);
  }
}
