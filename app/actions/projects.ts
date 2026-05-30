"use server";

import { getSessionUser } from "@/lib/session";
import {
  createProject,
  assignUserToProject,
  addProjectExpense,
  addProjectTimeLog,
  updateProjectLinks,
  addProjectReport,
} from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper to assert current user is Manager
async function assertManager() {
  const user = await getSessionUser();
  if (!user || user.global_role !== "manager") {
    throw new Error("403 Unauthorized: Managers only");
  }
  return user;
}

// Helper to assert current user is assigned to project or is Manager
async function assertProjectAccess(projectId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("401 Unauthenticated");
  }
  if (user.global_role === "manager") {
    return user;
  }
  
  const { data: rosterEntry, error } = await supabase
    .from("project_users")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !rosterEntry) {
    throw new Error("403 Unauthorized: Access to this workspace is restricted");
  }
  return user;
}


export async function createProjectAction(
  name: string,
  description: string,
  clientName: string,
  startDate: string,
  endDate: string,
  budget: number
) {
  try {
    await assertManager();
    const project = await createProject(name, description, clientName, startDate, endDate, budget);
    revalidatePath("/dashboard");
    return { success: true, project };
  } catch (error: any) {
    return { error: error.message || "Failed to create project" };
  }
}

export async function updateProjectLinksAction(
  projectId: string,
  linksData: {
    project_board_url: string;
    repository_url: string;
    deployment_url: string;
    design_files_url: string;
  }
) {
  try {
    await assertProjectAccess(projectId);
    const links = await updateProjectLinks(projectId, linksData);
    revalidatePath(`/projects/${projectId}`);
    return { success: true, links };
  } catch (error: any) {
    return { error: error.message || "Failed to update links" };
  }
}

export async function assignUserAction(
  projectId: string,
  userId: string,
  projectRole: string,
  hourlyRate: number
) {
  try {
    await assertManager();
    const assignment = await assignUserToProject(projectId, userId, projectRole, hourlyRate);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true, assignment };
  } catch (error: any) {
    return { error: error.message || "Failed to assign user" };
  }
}

export async function addExpenseAction(
  projectId: string,
  label: string,
  costAmount: number
) {
  try {
    await assertManager();
    const expense = await addProjectExpense(projectId, label, costAmount);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true, expense };
  } catch (error: any) {
    return { error: error.message || "Failed to add expense" };
  }
}

export async function addTimeLogAction(
  projectId: string,
  hours: number,
  description: string
) {
  try {
    const user = await assertProjectAccess(projectId);
    const timeLog = await addProjectTimeLog(projectId, user.id, hours, description);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true, timeLog };
  } catch (error: any) {
    return { error: error.message || "Failed to add time log" };
  }
}

export async function addProjectReportAction(
  projectId: string,
  evaluation: string
) {
  try {
    await assertManager();
    const report = await addProjectReport(projectId, evaluation);
    revalidatePath(`/projects/${projectId}`);
    return { success: true, report };
  } catch (error: any) {
    return { error: error.message || "Failed to add project evaluation" };
  }
}
