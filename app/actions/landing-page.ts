"use server";

import { getSessionUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Middleware security gate
async function verifyManager() {
  const user = await getSessionUser();
  if (!user || user.global_role !== "manager") {
    throw new Error("403 Unauthorized: Managers only");
  }
  return user;
}

// Helper to save uploaded files directly to Supabase Storage 'porto_image' bucket
async function handleFileUpload(file: File): Promise<string> {
  if (!file || file.size === 0) return "";
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // Upload file buffer directly to Supabase Storage
  const { data, error } = await supabase.storage
    .from("porto_image")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    console.error("Supabase Storage upload error details:", error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Retrieve the public URL of the uploaded image file
  const { data: urlData } = supabase.storage
    .from("porto_image")
    .getPublicUrl(filename);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to get public URL for uploaded file.");
  }

  return urlData.publicUrl;
}

// ----------------------------------------------------
// HERO SETTINGS ACTIONS
// ----------------------------------------------------
export async function saveHeroSettingsAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const cta_text = formData.get("cta_text") as string;

  if (!title) {
    return { error: "Title is required for the Hero section." };
  }

  const payload = {
    title,
    subtitle,
    cta_text,
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      const { error } = await supabase
        .from("hero_settings")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("hero_settings")
        .insert(payload);
      if (error) throw error;
    }

    revalidatePath("/landing-page");
    return { success: "Hero settings saved successfully." };
  } catch (err: any) {
    console.error("Hero Save Error:", err);
    return { error: err.message || "Failed to save Hero settings." };
  }
}

// ----------------------------------------------------
// PORTFOLIOS ACTIONS
// ----------------------------------------------------
export async function savePortfolioAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const order_index = parseInt(formData.get("order_index") as string || "0", 10);
  const is_active = formData.get("is_active") === "true";
  
  let image_url = formData.get("image_url") as string;
  const imageFile = formData.get("image_file") as File | null;

  if (!name) {
    return { error: "Portfolio name is required." };
  }

  try {
    // If a file is uploaded, process upload to Supabase bucket
    if (imageFile && imageFile.size > 0) {
      image_url = await handleFileUpload(imageFile);
    }

    const payload = {
      name,
      category,
      image_url,
      description,
      order_index,
      is_active,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await supabase
        .from("portfolios")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("portfolios")
        .insert(payload);
      if (error) throw error;
    }

    revalidatePath("/landing-page");
    return { success: "Portfolio item saved successfully." };
  } catch (err: any) {
    console.error("Portfolio Save Error:", err);
    return { error: err.message || "Failed to save portfolio item." };
  }
}

export async function deletePortfolioAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Portfolio ID is required." };

  try {
    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/landing-page");
    return { success: "Portfolio item deleted successfully." };
  } catch (err: any) {
    console.error("Portfolio Delete Error:", err);
    return { error: err.message || "Failed to delete portfolio item." };
  }
}

// ----------------------------------------------------
// TESTIMONIAL ACTIONS
// ----------------------------------------------------
export async function saveTestimonialAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  const author_name = formData.get("author_name") as string;
  const author_role = formData.get("author_role") as string;
  const quote = formData.get("quote") as string;
  const order_index = parseInt(formData.get("order_index") as string || "0", 10);
  const is_active = formData.get("is_active") === "true";
  const porto_id = formData.get("porto_id") as string || null;

  if (!author_name || !quote) {
    return { error: "Author Name and Quote are required." };
  }

  const payload = {
    author_name,
    author_role,
    quote,
    order_index,
    is_active,
    porto_id: porto_id === "" ? null : porto_id,
  };

  try {
    if (id) {
      const { error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("testimonials")
        .insert(payload);
      if (error) throw error;
    }

    revalidatePath("/landing-page");
    return { success: "Testimonial saved successfully." };
  } catch (err: any) {
    console.error("Testimonial Save Error:", err);
    return { error: err.message || "Failed to save testimonial." };
  }
}

export async function deleteTestimonialAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Testimonial ID is required." };

  try {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/landing-page");
    return { success: "Testimonial deleted successfully." };
  } catch (err: any) {
    console.error("Testimonial Delete Error:", err);
    return { error: err.message || "Failed to delete testimonial." };
  }
}

// ----------------------------------------------------
// PACKAGE ACTIONS
// ----------------------------------------------------
export async function savePackageAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string || "0");
  const order_index = parseInt(formData.get("order_index") as string || "0", 10);
  const is_active = formData.get("is_active") === "true";
  const is_highlight = formData.get("is_highlight") === "true";

  if (!title) {
    return { error: "Package title is required." };
  }

  const payload = {
    title,
    description,
    price,
    order_index,
    is_active,
    is_highlight,
  };

  try {
    if (id) {
      const { error } = await supabase
        .from("packages")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("packages")
        .insert(payload);
      if (error) throw error;
    }

    revalidatePath("/landing-page");
    return { success: "Package saved successfully." };
  } catch (err: any) {
    console.error("Package Save Error:", err);
    return { error: err.message || "Failed to save package." };
  }
}

export async function deletePackageAction(formData: FormData) {
  try {
    await verifyManager();
  } catch (err: any) {
    return { error: err.message };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Package ID is required." };

  try {
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/landing-page");
    return { success: "Package deleted successfully." };
  } catch (err: any) {
    console.error("Package Delete Error:", err);
    return { error: err.message || "Failed to delete package." };
  }
}
