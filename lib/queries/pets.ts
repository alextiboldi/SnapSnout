import { prisma } from "@/lib/prisma";

export async function getPetsForUser(userId: string) {
  return prisma.pet.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivePet(userId: string) {
  return prisma.pet.findFirst({
    where: { userId, isActive: true },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getPetById(petId: string, userId: string) {
  return prisma.pet.findFirst({
    where: { id: petId, userId },
  });
}
