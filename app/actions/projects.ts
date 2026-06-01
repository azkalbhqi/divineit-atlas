"use server";

import { getSessionUser } from "@/lib/session";
import {
  createProject,
  assignUserToProject,
  addProjectExpense,
  addProjectTimeLog,
  updateProjectLinks,
  addProjectReport,
  updateProject,
  deleteProject,
  updateProjectTimeLog,
  deleteProjectTimeLog,
  updateRosterMember,
  deleteRosterMember,
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

// Helper to assert current user has edit rights (Manager, Project Manager, Lead Engineer)
export async function assertProjectEditAccess(projectId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("401 Unauthenticated");
  }
  if (user.global_role === "manager") {
    return user;
  }
  
  const { data: rosterEntry, error } = await supabase
    .from("project_users")
    .select("project_role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !rosterEntry) {
    throw new Error("403 Unauthorized: Access to this workspace is restricted");
  }

  const allowedRoles = ["Project Manager", "Lead Engineer"];
  if (!allowedRoles.includes(rosterEntry.project_role)) {
    throw new Error("403 Unauthorized: Editing projects requires Manager, Project Manager, or Lead Engineer roles");
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
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to create project" };
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
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to update links" };
  }
}

export async function assignUserAction(
  projectId: string,
  userId: string,
  projectRole: string,
  hourlyRate: number
) {
  try {
    await assertProjectEditAccess(projectId);
    const assignment = await assignUserToProject(projectId, userId, projectRole, hourlyRate);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true, assignment };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to assign user" };
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
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to add expense" };
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
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to add time log" };
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
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to add project evaluation" };
  }
}

export async function updateProjectAction(
  projectId: string,
  data: {
    name: string;
    description: string;
    clientName: string;
    startDate: string;
    endDate: string;
    budget: number;
  }
) {
  try {
    await assertProjectEditAccess(projectId);
    const project = await updateProject(projectId, {
      name: data.name,
      description: data.description,
      client_name: data.clientName,
      start_date: data.startDate,
      end_date: data.endDate,
      total_budget: data.budget,
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/dashboard`);
    return { success: true, project };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to update project" };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    await assertProjectEditAccess(projectId);
    await deleteProject(projectId);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to delete project" };
  }
}

export async function updateTimeLogAction(
  projectId: string,
  logId: string,
  hours: number,
  description: string
) {
  try {
    await assertProjectEditAccess(projectId);
    await updateProjectTimeLog(logId, hours, description);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to update time log" };
  }
}

export async function deleteTimeLogAction(
  projectId: string,
  logId: string
) {
  try {
    await assertProjectEditAccess(projectId);
    await deleteProjectTimeLog(logId);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to delete time log" };
  }
}

export async function updateRosterAction(
  projectId: string,
  rosterId: string,
  projectRole: string,
  hourlyRate: number
) {
  try {
    await assertProjectEditAccess(projectId);
    await updateRosterMember(rosterId, projectRole, hourlyRate);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to update roster member" };
  }
}

export async function deleteRosterAction(
  projectId: string,
  rosterId: string
) {
  try {
    await assertProjectEditAccess(projectId);
    await deleteRosterMember(rosterId);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/financials`);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { error: err.message || "Failed to remove roster member" };
  }
}


