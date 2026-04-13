"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, assertPetInFamily } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function saveGeneratedCard(
  petId: string,
  data: {
    title: string;
    description: string;
    tags: string[];
    photoUrl: string;
    style: string;
  }
) {
  const session = await requireSession();
  await assertPetInFamily(session, petId);

  const lastMilestone = await prisma.milestone.findFirst({
    where: { petId },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.milestone.create({
    data: {
      petId,
      title: data.title,
      description: data.description,
      emoji: "\uD83C\uDFA8",
      completedDate: new Date(),
      photoUrl: data.photoUrl,
      isCustom: true,
      isShareable: true,
      tags: [
        ...data.tags,
        "ai-studio",
        data.style.toLowerCase().replace(/\s+/g, "-"),
      ],
      sortOrder: (lastMilestone?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/milestones");
  revalidatePath("/");
}

export async function uploadStudioPhoto(
  petId: string,
  formData: FormData
): Promise<string> {
  const session = await requireSession();
  await assertPetInFamily(session, petId);

  const file = formData.get("file") as File;
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Invalid file");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${session.family.id}/${petId}/studio/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("pet-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("pet-photos").getPublicUrl(data.path);
  return publicUrl;
}
