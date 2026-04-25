import { createClient } from "@/lib/supabase/client";

export async function uploadPhotoClient(
  file: File,
  path: string
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${path}/${Date.now()}.${ext}`;

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
