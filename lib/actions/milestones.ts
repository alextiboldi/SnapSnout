"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, assertPetInFamily } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function completeMilestone(
  milestoneId: string,
  data?: { notes?: string; photoUrl?: string }
) {
  const session = await requireSession();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { familyId: true } } },
  });
  if (!milestone || milestone.pet.familyId !== session.family.id) {
    throw new Error("Milestone not found");
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      completedDate: new Date(),
      notes: data?.notes ?? undefined,
      photoUrl: data?.photoUrl ?? undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
}

export async function createCustomMilestone(
  petId: string,
  data: {
    title: string;
    description?: string;
    emoji?: string;
    targetDate?: string;
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
      description: data.description || "",
      emoji: data.emoji || "🎯",
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      isCustom: true,
      sortOrder: (lastMilestone?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/milestones");
}

/**
 * Returns photos linked to a milestone, oldest-first so the upload order is
 * preserved in the modal grid.
 */
export async function getMilestonePhotos(milestoneId: string) {
  const session = await requireSession();
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { familyId: true } } },
  });
  if (!milestone || milestone.pet.familyId !== session.family.id) {
    throw new Error("Milestone not found");
  }

  return prisma.photo.findMany({
    where: { milestoneId },
    orderBy: { capturedDate: "asc" },
    select: {
      id: true,
      url: true,
      caption: true,
      capturedDate: true,
    },
  });
}

/**
 * Uploads a file to Supabase storage and creates a Photo row linked to the
 * milestone (and its pet). If the milestone has no primary photo yet, the
 * upload also becomes its `photoUrl`.
 */
export async function addMilestonePhoto(
  milestoneId: string,
  formData: FormData
) {
  const session = await requireSession();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { id: true, familyId: true } } },
  });
  if (!milestone || milestone.pet.familyId !== session.family.id) {
    throw new Error("Milestone not found");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${session.family.id}/${milestone.pet.id}/milestones/${milestoneId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("pet-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("pet-photos").getPublicUrl(data.path);

  const photo = await prisma.photo.create({
    data: {
      petId: milestone.pet.id,
      milestoneId,
      uploaderId: session.user.id,
      url: publicUrl,
    },
    select: {
      id: true,
      url: true,
      caption: true,
      capturedDate: true,
    },
  });

  if (!milestone.photoUrl) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { photoUrl: publicUrl },
    });
  }

  revalidatePath("/milestones");
  revalidatePath("/milestones/gallery");
  revalidatePath("/");

  return photo;
}

export async function updateMilestoneTags(milestoneId: string, tags: string[]) {
  const session = await requireSession();
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { familyId: true } } },
  });
  if (!milestone || milestone.pet.familyId !== session.family.id) {
    throw new Error("Milestone not found");
  }
  const normalized = [...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))];
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { tags: normalized },
  });
  revalidatePath("/milestones");
  revalidatePath("/");
}
