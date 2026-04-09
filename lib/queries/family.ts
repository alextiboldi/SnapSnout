import { prisma } from "@/lib/prisma";

export async function getFamilyDetails(familyId: string) {
  const [family, members, invites] = await Promise.all([
    prisma.family.findUnique({ where: { id: familyId } }),
    prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    }),
    prisma.familyInvite.findMany({
      where: {
        familyId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!family) throw new Error("Family not found");

  return { family, members, invites };
}

export type FamilyDetails = Awaited<ReturnType<typeof getFamilyDetails>>;
export type FamilyMemberWithUser = FamilyDetails["members"][number];
export type FamilyInviteRow = FamilyDetails["invites"][number];
