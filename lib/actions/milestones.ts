"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function completeMilestone(
  milestoneId: string,
  data?: { notes?: string; photoUrl?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the milestone belongs to the user's pet
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { userId: true } } },
  });
  if (!milestone || milestone.pet.userId !== user.id) {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: user.id },
  });
  if (!pet) throw new Error("Pet not found");

  // Get the highest sortOrder for this pet
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
