import { prisma } from "@/lib/prisma";

export async function getMilestonesForPet(petId: string) {
  return prisma.milestone.findMany({
    where: { petId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getMilestoneById(milestoneId: string) {
  return prisma.milestone.findUnique({
    where: { id: milestoneId },
  });
}
