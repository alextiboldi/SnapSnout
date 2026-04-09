import { prisma } from "@/lib/prisma";
import { resolveSiteUrl } from "@/lib/url";

/**
 * Returns every active (non-revoked) milestone share for the given family,
 * each with its share URL pre-resolved and the milestone + pet info attached.
 * Used by the settings "Active shares" management section.
 */
export async function getActiveSharesForFamily(familyId: string) {
  const shares = await prisma.milestoneShare.findMany({
    where: {
      revokedAt: null,
      milestone: { pet: { familyId } },
    },
    include: {
      milestone: {
        select: {
          id: true,
          title: true,
          emoji: true,
          completedDate: true,
          targetDate: true,
          pet: { select: { id: true, name: true, species: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = await resolveSiteUrl();
  return shares.map((s) => ({
    id: s.id,
    token: s.token,
    url: `${baseUrl}/share/${s.token}`,
    createdAt: s.createdAt,
    viewCount: s.viewCount,
    lastViewedAt: s.lastViewedAt,
    milestone: s.milestone,
  }));
}

export type ActiveShare = Awaited<
  ReturnType<typeof getActiveSharesForFamily>
>[number];
