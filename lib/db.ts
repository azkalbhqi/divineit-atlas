import { supabase } from "./supabase";
import { hashPassword } from "./crypto";

// Types corresponding to the database schema
export interface User {
  id: string;
  name: string;
  email: string;
  global_role: "manager" | "staff";
  hashed_password?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  total_cost: number;
  created_at: string;
}

export interface ProjectUser {
  id: string;
  project_id: string;
  user_id: string;
  project_role: string;
  hourly_rate: number;
  joined_at: string;
}

export interface ProjectLinks {
  id: string;
  project_id: string;
  project_board_url: string;
  repository_url: string;
  deployment_url: string;
  design_files_url: string;
  updated_at: string;
}

export interface ProjectExpense {
  id: string;
  project_id: string;
  label: string;
  cost_amount: number;
  logged_at: string;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  evaluation: string;
}

export interface ProjectTimeLog {
  id: string;
  project_id: string;
  user_id: string;
  hours: number;
  description: string;
  logged_at: string;
}

// Sync/Recalculate project total costs based on expenses and time logs in Supabase
export async function syncProjectTotalCost(projectId: string): Promise<void> {
  try {
    // 1. Calculate Expenses Cost
    const { data: expenses } = await supabase
      .from("project_expenses")
      .select("cost_amount")
      .eq("project_id", projectId);

    const expensesCost = (expenses || []).reduce((sum, e) => sum + Number(e.cost_amount), 0);

    // 2. Calculate Labor Cost
    const { data: roster } = await supabase
      .from("project_users")
      .select("user_id, hourly_rate")
      .eq("project_id", projectId);

    const { data: timeLogs } = await supabase
      .from("project_time_logs")
      .select("user_id, hours")
      .eq("project_id", projectId);

    let laborCost = 0;
    if (roster && timeLogs) {
      for (const log of timeLogs) {
        const rosterMember = roster.find((r) => r.user_id === log.user_id);
        if (rosterMember) {
          laborCost += Number(log.hours) * Number(rosterMember.hourly_rate);
        }
      }
    }

    const totalCost = expensesCost + laborCost;

    // 3. Update the projects table
    await supabase
      .from("projects")
      .update({ total_cost: totalCost })
      .eq("id", projectId);
  } catch (error) {
    console.error("Failed to sync project total cost:", error);
  }
}

// User methods
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, global_role, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch users from Supabase:", error.message, error.details);
    return [];
  }
  return data || [];
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, global_role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user by ID from Supabase:", error.message, error.details);
    return null;
  }
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user by email from Supabase:", error.message, error.details);
    return null;
  }
  return data;
}

// Project methods
export async function getProjects(
  currentUserId: string,
  globalRole: "manager" | "staff"
): Promise<Project[]> {
  if (globalRole === "manager") {
    // Managers see all projects (global view)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects for Manager:", error.message, error.details);
      return [];
    }
    return data || [];
  } else {
    // Staff see only projects they are associated with in project_users
    const { data: rosterEntries, error: rosterError } = await supabase
      .from("project_users")
      .select("project_id")
      .eq("user_id", currentUserId);

    if (rosterError || !rosterEntries || rosterEntries.length === 0) {
      return [];
    }

    const assignedProjectIds = rosterEntries.map((re) => re.project_id);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .in("id", assignedProjectIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects for Staff:", error.message, error.details);
      return [];
    }
    return data || [];
  }
}

// Get the roster count for dashboard project list
export async function getProjectRosterCount(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from("project_users")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) {
    console.error("Failed to get project roster count:", error);
    return 0;
  }
  return count || 0;
}

// Get the localized role for a specific user in a project
export async function getUserProjectRole(projectId: string, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("project_users")
    .select("project_role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data.project_role;
}

// Retrieve details of a project if authorized
export async function getProjectDetail(
  projectId: string,
  currentUserId: string,
  globalRole: "manager" | "staff"
) {
  // Authorization check at database/server layer
  if (globalRole !== "manager") {
    const { data: hasAccess, error: accessError } = await supabase
      .from("project_users")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (accessError || !hasAccess) {
      console.warn(`Unauthorized access attempt by user ${currentUserId} to project ${projectId}`);
      return null; // Not authorized
    }
  }

  // Fetch Project metadata
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projError || !project) {
    return null;
  }

  // Fetch Links
  const { data: dbLinks } = await supabase
    .from("project_links")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const links = dbLinks || {
    id: "pl-" + projectId,
    project_id: projectId,
    project_board_url: "",
    repository_url: "",
    deployment_url: "",
    design_files_url: "",
    updated_at: new Date().toISOString(),
  };

  // Fetch Roster
  const { data: dbRoster } = await supabase
    .from("project_users")
    .select("*")
    .eq("project_id", projectId)
    .order("joined_at", { ascending: true });

  const users = await getUsers();

  const roster = (dbRoster || []).map((pu) => {
    const user = users.find((u) => u.id === pu.user_id);
    return {
      ...pu,
      user_name: user ? user.name : "Unknown User",
      user_email: user ? user.email : "",
    };
  });

  // Fetch Reports
  const { data: reports } = await supabase
    .from("project_reports")
    .select("*")
    .eq("project_id", projectId);

  // Fetch Time Logs
  const { data: dbTimeLogs } = await supabase
    .from("project_time_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("logged_at", { ascending: false });

  const timeLogs = (dbTimeLogs || []).map((log) => {
    const user = users.find((u) => u.id === log.user_id);
    const rosterMember = roster.find((r) => r.user_id === log.user_id);
    return {
      ...log,
      user_name: user ? user.name : "Unknown User",
      project_role: rosterMember ? rosterMember.project_role : "Unknown Role",
    };
  });

  return {
    project,
    links,
    roster,
    reports: reports || [],
    timeLogs,
  };
}

// Add a project (Manager only)
export async function createProject(
  name: string,
  description: string,
  clientName: string,
  startDate: string,
  endDate: string,
  budget: number
): Promise<Project> {
  const { data: insertedProject, error: projError } = await supabase
    .from("projects")
    .insert({
      name,
      description,
      client_name: clientName,
      start_date: startDate,
      end_date: endDate,
      total_budget: Number(budget),
      total_cost: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (projError || !insertedProject) {
    throw new Error("Failed to insert project: " + (projError?.message || "Unknown error"));
  }

  const { error: linkError } = await supabase
    .from("project_links")
    .insert({
      project_id: insertedProject.id,
      project_board_url: "",
      repository_url: "",
      deployment_url: "",
      design_files_url: "",
      updated_at: new Date().toISOString(),
    });

  if (linkError) {
    console.error("Failed to insert project links helper:", linkError.message);
  }

  return insertedProject;
}

// Update project links
export async function updateProjectLinks(
  projectId: string,
  linksData: Partial<Omit<ProjectLinks, "id" | "project_id" | "updated_at">>
): Promise<ProjectLinks> {
  const { data: existing } = await supabase
    .from("project_links")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const updatedFields = {
    project_board_url: linksData.project_board_url ?? "",
    repository_url: linksData.repository_url ?? "",
    deployment_url: linksData.deployment_url ?? "",
    design_files_url: linksData.design_files_url ?? "",
    updated_at: new Date().toISOString(),
  };

  if (!existing) {
    const { data: newLinks, error } = await supabase
      .from("project_links")
      .insert({
        project_id: projectId,
        ...updatedFields,
      })
      .select()
      .single();

    if (error || !newLinks) {
      throw new Error("Failed to insert project links: " + (error?.message || "Unknown error"));
    }
    return newLinks as ProjectLinks;
  } else {
    const { data: updatedLinks, error } = await supabase
      .from("project_links")
      .update(updatedFields)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error || !updatedLinks) {
      throw new Error("Failed to update project links: " + (error?.message || "Unknown error"));
    }
    return updatedLinks as ProjectLinks;
  }
}

// Assign user to project (Manager only)
export async function assignUserToProject(
  projectId: string,
  userId: string,
  projectRole: string,
  hourlyRate: number
): Promise<ProjectUser> {
  const { data: existing } = await supabase
    .from("project_users")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { data: updatedAssignment, error } = await supabase
      .from("project_users")
      .update({
        project_role: projectRole,
        hourly_rate: Number(hourlyRate),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error || !updatedAssignment) {
      throw new Error("Failed to update assignment: " + (error?.message || "Unknown error"));
    }

    await syncProjectTotalCost(projectId);
    return updatedAssignment as ProjectUser;
  }

  const { data: newAssignment, error } = await supabase
    .from("project_users")
    .insert({
      project_id: projectId,
      user_id: userId,
      project_role: projectRole,
      hourly_rate: Number(hourlyRate),
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newAssignment) {
    throw new Error("Failed to assign user: " + (error?.message || "Unknown error"));
  }

  await syncProjectTotalCost(projectId);
  return newAssignment as ProjectUser;
}

// Add Expense (Manager only)
export async function addProjectExpense(
  projectId: string,
  label: string,
  costAmount: number
): Promise<ProjectExpense> {
  const { data: newExpense, error } = await supabase
    .from("project_expenses")
    .insert({
      project_id: projectId,
      label,
      cost_amount: Number(costAmount),
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newExpense) {
    throw new Error("Failed to add expense: " + (error?.message || "Unknown error"));
  }

  await syncProjectTotalCost(projectId);
  return newExpense as ProjectExpense;
}

// Add Time Log
export async function addProjectTimeLog(
  projectId: string,
  userId: string,
  hours: number,
  description: string
): Promise<ProjectTimeLog> {
  const { data: newLog, error } = await supabase
    .from("project_time_logs")
    .insert({
      project_id: projectId,
      user_id: userId,
      hours: Number(hours),
      description,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newLog) {
    throw new Error("Failed to add time log: " + (error?.message || "Unknown error"));
  }

  await syncProjectTotalCost(projectId);
  return newLog as ProjectTimeLog;
}

// Add evaluation report (Manager only)
export async function addProjectReport(
  projectId: string,
  evaluation: string
): Promise<ProjectReport> {
  const { data: newReport, error } = await supabase
    .from("project_reports")
    .insert({
      project_id: projectId,
      evaluation,
    })
    .select()
    .single();

  if (error || !newReport) {
    throw new Error("Failed to add evaluation report: " + (error?.message || "Unknown error"));
  }

  return newReport as ProjectReport;
}

// Get Financial details (Highly Secured - Manager only check at API/Server level)
export async function getProjectFinancials(projectId: string) {
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const { data: expenses } = await supabase
    .from("project_expenses")
    .select("*")
    .eq("project_id", projectId)
    .order("logged_at", { ascending: false });

  const { data: dbRoster } = await supabase
    .from("project_users")
    .select("*")
    .eq("project_id", projectId);

  const users = await getUsers();

  const roster = (dbRoster || []).map((pu) => {
    const user = users.find((u) => u.id === pu.user_id);
    return {
      ...pu,
      user_name: user ? user.name : "Unknown User",
    };
  });

  const { data: timeLogs } = await supabase
    .from("project_time_logs")
    .select("*")
    .eq("project_id", projectId);

  // Compute labor burndown breakdown per user
  const laborBreakdown = roster.map((member) => {
    const memberLogs = (timeLogs || []).filter((log) => log.user_id === member.user_id);
    const totalHours = memberLogs.reduce((sum, log) => sum + Number(log.hours), 0);
    const totalCost = totalHours * Number(member.hourly_rate);
    return {
      userId: member.user_id,
      userName: member.user_name,
      projectRole: member.project_role,
      hourlyRate: member.hourly_rate,
      totalHours,
      totalCost,
    };
  });

  const totalLaborCost = laborBreakdown.reduce((sum, lb) => sum + lb.totalCost, 0);
  const totalExpensesCost = (expenses || []).reduce((sum, e) => sum + Number(e.cost_amount), 0);
  const accumulatedCost = totalLaborCost + totalExpensesCost;

  return {
    project,
    expenses: expenses || [],
    laborBreakdown,
    totalLaborCost,
    totalExpensesCost,
    accumulatedCost,
  };
}

// Create a new User Account (Manager only)
export async function createUser(
  name: string,
  email: string,
  globalRole: "manager" | "staff",
  password: string
): Promise<User> {
  const hashedPassword = hashPassword(password);
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      name,
      email,
      global_role: globalRole,
      hashed_password: hashedPassword,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newUser) {
    throw new Error("Failed to create user account: " + (error?.message || "Unknown error"));
  }

  return newUser as User;
}

// Get global portfolio financial data aggregated across all projects
export async function getGlobalPortfolioFinancials() {
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (projError || !projects) {
    throw new Error("Failed to fetch projects: " + projError?.message);
  }

  const { data: expenses } = await supabase.from("project_expenses").select("*");
  const { data: roster } = await supabase.from("project_users").select("*");
  const { data: timeLogs } = await supabase.from("project_time_logs").select("*");

  const projectBreakdown = projects.map((p) => {
    // 1. Calculate operational outlays
    const projectExpenses = (expenses || []).filter((e) => e.project_id === p.id);
    const operationalCost = projectExpenses.reduce((sum, e) => sum + Number(e.cost_amount), 0);

    // 2. Calculate labor outlays
    const projectRoster = (roster || []).filter((pu) => pu.project_id === p.id);
    const projectLogs = (timeLogs || []).filter((log) => log.project_id === p.id);

    let laborCost = 0;
    for (const log of projectLogs) {
      const rosterMember = projectRoster.find((r) => r.user_id === log.user_id);
      if (rosterMember) {
        laborCost += Number(log.hours) * Number(rosterMember.hourly_rate);
      }
    }

    const accumulatedCost = operationalCost + laborCost;
    const remainingBudget = Number(p.total_budget) - accumulatedCost;
    const utilizationPct = p.total_budget > 0 ? Math.round((accumulatedCost / Number(p.total_budget)) * 100) : 0;

    return {
      ...p,
      operationalCost,
      laborCost,
      accumulatedCost,
      remainingBudget,
      utilizationPct,
      rosterCount: projectRoster.length,
    };
  });

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.total_budget), 0);
  const totalOperationalCost = projectBreakdown.reduce((sum, pb) => sum + pb.operationalCost, 0);
  const totalLaborCost = projectBreakdown.reduce((sum, pb) => sum + pb.laborCost, 0);
  const totalSpent = totalOperationalCost + totalLaborCost;
  const totalRemaining = totalBudget - totalSpent;
  const portfolioUtilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    projectBreakdown,
    totalBudget,
    totalOperationalCost,
    totalLaborCost,
    totalSpent,
    totalRemaining,
    portfolioUtilizationPct,
  };
}

// Update a User's Password
export async function updateUserPassword(userId: string, newPasswordPlain: string): Promise<void> {
  const hashedPassword = hashPassword(newPasswordPlain);
  const { error } = await supabase
    .from("users")
    .update({ hashed_password: hashedPassword })
    .eq("id", userId);

  if (error) {
    throw new Error("Failed to update password: " + error.message);
  }
}

// Delete a User Account (Manager only)
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) {
    throw new Error("Failed to delete user account: " + error.message);
  }
}
