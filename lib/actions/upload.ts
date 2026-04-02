"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadPhoto(formData: FormData): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return null;

  const petId = formData.get("petId") as string;
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${petId || "profile"}/${Date.now()}.${ext}`;

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
