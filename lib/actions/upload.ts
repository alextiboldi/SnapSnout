"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

export async function uploadPhoto(formData: FormData): Promise<string | null> {
  const session = await requireSession();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return null;

  const petId = formData.get("petId") as string;
  const ext = file.name.split(".").pop() || "jpg";
  // Store files under family id so ownership travels with the shared pet graph.
  const fileName = `${session.family.id}/${petId || "profile"}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("pet-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("pet-photos").getPublicUrl(data.path);

  return publicUrl;
}
