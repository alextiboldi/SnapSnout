"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const session = await requireSession();

  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Name is required");

  let avatarUrl = session.user.avatarUrl;
  const file = formData.get("avatar") as File | null;
  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) throw new Error("File must be an image");
    const supabase = await createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/profile/avatar.${ext}`;

    const { data, error } = await supabase.storage
      .from("pet-photos")
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("pet-photos").getPublicUrl(data.path);
    avatarUrl = publicUrl;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim(), avatarUrl },
  });

  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  revalidatePath("/");
}
