"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { resolveSiteUrl } from "@/lib/url";

/**
 * Verifies the milestone exists and belongs to a pet in the caller's family.
 * Returns the milestone or throws.
 */
async function loadMilestoneInFamily(milestoneId: string, familyId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { pet: { select: { familyId: true } } },
  });
  if (!milestone || milestone.pet.familyId !== familyId) {
    throw new Error("Milestone not found");
  }
  return milestone;
}

/** Returns the active share for a milestone (or null) without creating one. */
export async function getMilestoneShareStatus(milestoneId: string) {
  const session = await requireSession();
  await loadMilestoneInFamily(milestoneId, session.family.id);

  const share = await prisma.milestoneShare.findUnique({
    where: { milestoneId },
  });
  if (!share || share.revokedAt) return { shared: false as const };

  const baseUrl = await resolveSiteUrl();
  return {
    shared: true as const,
    token: share.token,
    url: `${baseUrl}/share/${share.token}`,
  };
}

/**
 * Returns the active share URL for a milestone, creating one if none exists
 * (or rotating the token if a previous share was revoked). Idempotent for an
 * already-active share.
 */
export async function getOrCreateMilestoneShare(milestoneId: string) {
  const session = await requireSession();
  await loadMilestoneInFamily(milestoneId, session.family.id);

  const baseUrl = await resolveSiteUrl();

  const existing = await prisma.milestoneShare.findUnique({
    where: { milestoneId },
  });
  if (existing && !existing.revokedAt) {
    return { token: existing.token, url: `${baseUrl}/share/${existing.token}` };
  }

  const token = randomBytes(16).toString("base64url");
  const share = await prisma.milestoneShare.upsert({
    where: { milestoneId },
    update: { token, revokedAt: null, createdById: session.user.id },
    create: { milestoneId, token, createdById: session.user.id },
  });

  revalidatePath("/milestones");
  return { token: share.token, url: `${baseUrl}/share/${share.token}` };
}

/** Marks the active share for a milestone as revoked. No-op if none active. */
export async function revokeMilestoneShare(milestoneId: string) {
  const session = await requireSession();
  await loadMilestoneInFamily(milestoneId, session.family.id);

  await prisma.milestoneShare.updateMany({
    where: { milestoneId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/milestones");
}
