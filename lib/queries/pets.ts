import { prisma } from "@/lib/prisma";

export async function getPetsForFamily(familyId: string) {
  return prisma.pet.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns the pet the given member is currently viewing, with its milestones.
 * Falls back to the most recently created pet in the family if the member has
 * no explicit active pet set (e.g. first visit after creating the first pet).
 */
export async function getActivePetForMember(
  familyId: string,
  memberId: string
) {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    select: { activePetId: true },
  });

  if (member?.activePetId) {
    const pet = await prisma.pet.findFirst({
      where: { id: member.activePetId, familyId },
      include: { milestones: { orderBy: { sortOrder: "asc" } } },
    });
    if (pet) return pet;
  }

  return prisma.pet.findFirst({
    where: { familyId },
    orderBy: { createdAt: "desc" },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getPetByIdForFamily(petId: string, familyId: string) {
  return prisma.pet.findFirst({
    where: { id: petId, familyId },
  });
}
