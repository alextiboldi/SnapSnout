"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, assertPetInFamily } from "@/lib/auth/session";

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
      isShareable: true,
      sortOrder: (lastMilestone?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/milestones");
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
