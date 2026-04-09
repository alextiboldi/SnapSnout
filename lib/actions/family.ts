"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession, assertOwner } from "@/lib/auth/session";
import type { FamilyInvite } from "@/lib/generated/prisma/client";

export type InviteValidation =
  | { status: "valid"; invite: FamilyInvite; familyName: string }
  | { status: "expired" }
  | { status: "revoked" }
  | { status: "accepted" }
  | { status: "not_found" };

/** Public lookup — does not require auth. Used by /invite/[token] page. */
export async function validateInvite(token: string): Promise<InviteValidation> {
  const invite = await prisma.familyInvite.findUnique({
    where: { token },
    include: { family: { select: { name: true } } },
  });
  if (!invite) return { status: "not_found" };
  if (invite.acceptedAt) return { status: "accepted" };
  if (invite.revokedAt) return { status: "revoked" };
  if (invite.expiresAt < new Date()) return { status: "expired" };
  return {
    status: "valid",
    invite,
    familyName: invite.family.name,
  };
}

export type AcceptInvitePreview =
  | { status: "already_member" }
  | {
      status: "ready";
      currentFamilyName: string;
      currentFamilyPetCount: number;
      currentRoleIsOwner: boolean;
      destructive: boolean;
    }
  | {
      status: "blocked_owner";
      reason: "has_other_members";
    };

/** Returns what will happen if the current user accepts this invite. */
export async function previewAcceptInvite(
  token: string
): Promise<AcceptInvitePreview> {
  const session = await requireSession();
  const validation = await validateInvite(token);
  if (validation.status !== "valid") {
    throw new Error("Invite is no longer valid");
  }

  if (validation.invite.familyId === session.family.id) {
    return { status: "already_member" };
  }

  const [memberCount, petCount] = await Promise.all([
    prisma.familyMember.count({ where: { familyId: session.family.id } }),
    prisma.pet.count({ where: { familyId: session.family.id } }),
  ]);

  const isOwner = session.member.role === "owner";
  if (isOwner && memberCount > 1) {
    return { status: "blocked_owner", reason: "has_other_members" };
  }

  return {
    status: "ready",
    currentFamilyName: session.family.name,
    currentFamilyPetCount: petCount,
    currentRoleIsOwner: isOwner,
    destructive: petCount > 0,
  };
}

/**
 * Accept an invite. Removes the user from their current family (deleting it
 * if they were the sole owner) and joins them to the inviting family.
 */
export async function acceptInvite(token: string) {
  const session = await requireSession();

  const validation = await validateInvite(token);
  if (validation.status !== "valid") {
    throw new Error(`Invite ${validation.status}`);
  }
  const invite = validation.invite;

  if (invite.familyId === session.family.id) {
    redirect("/");
  }

  const memberCount = await prisma.familyMember.count({
    where: { familyId: session.family.id },
  });
  const isOwner = session.member.role === "owner";
  if (isOwner && memberCount > 1) {
    throw new Error(
      "You own a family with other members. Transfer ownership before joining another family."
    );
  }

  await prisma.$transaction(async (tx) => {
    // Detach from current family.
    await tx.familyMember.delete({ where: { id: session.member.id } });

    if (isOwner) {
      // Sole owner — delete the entire family (cascades to pets/photos).
      await tx.family.delete({ where: { id: session.family.id } });
    }

    // Join the inviting family as a member.
    await tx.user.update({
      where: { id: session.user.id },
      data: { familyId: invite.familyId },
    });
    await tx.familyMember.create({
      data: {
        familyId: invite.familyId,
        userId: session.user.id,
        role: "member",
      },
    });
    await tx.familyInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  revalidatePath("/", "layout");
  redirect("/");
}

const INVITE_TTL_DAYS = 7;
const MAX_FAMILY_NAME_LENGTH = 60;

/** Owner renames their family. */
export async function renameFamily(name: string) {
  const session = await requireSession();
  assertOwner(session);

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Family name is required");
  if (trimmed.length > MAX_FAMILY_NAME_LENGTH) {
    throw new Error(`Family name must be ${MAX_FAMILY_NAME_LENGTH} characters or fewer`);
  }

  await prisma.family.update({
    where: { id: session.family.id },
    data: { name: trimmed },
  });

  revalidatePath("/settings");
}

/**
 * Owner creates an invite. Returns the invite URL so the client can display it
 * for copy/share. Email is optional — when present it's stored for Phase 3's
 * email dispatch; for now the owner shares the link manually.
 *
 * Requires `owner.isPremium` — the freemium gate.
 */
export async function createInvite(
  email: string | null
): Promise<{ inviteId: string; url: string }> {
  const session = await requireSession();
  assertOwner(session);

  if (!session.user.isPremium) {
    throw new Error("Premium required to invite family members");
  }

  const normalizedEmail = email?.trim().toLowerCase() || null;
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invite = await prisma.familyInvite.create({
    data: {
      familyId: session.family.id,
      email: normalizedEmail,
      token,
      invitedByUserId: session.user.id,
      expiresAt,
    },
  });

  revalidatePath("/settings");

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ||
    "";
  const url = `${baseUrl}/invite/${token}`;

  return { inviteId: invite.id, url };
}

/** Owner revokes a pending invite. */
export async function revokeInvite(inviteId: string) {
  const session = await requireSession();
  assertOwner(session);

  const invite = await prisma.familyInvite.findFirst({
    where: { id: inviteId, familyId: session.family.id },
  });
  if (!invite) throw new Error("Invite not found");

  await prisma.familyInvite.update({
    where: { id: inviteId },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/settings");
}

/**
 * Owner removes a member. The removed user's `familyId` is nulled; their next
 * authenticated request will bootstrap a fresh solo family. Owners cannot
 * remove themselves — they must transfer ownership or delete the family.
 */
export async function removeMember(userId: string) {
  const session = await requireSession();
  assertOwner(session);

  if (userId === session.user.id) {
    throw new Error("Owner cannot remove themselves");
  }

  const member = await prisma.familyMember.findFirst({
    where: { familyId: session.family.id, userId },
  });
  if (!member) throw new Error("Member not found");
  if (member.role === "owner") throw new Error("Cannot remove the owner");

  await prisma.$transaction([
    prisma.familyMember.delete({ where: { id: member.id } }),
    prisma.user.update({
      where: { id: userId },
      data: { familyId: null },
    }),
  ]);

  revalidatePath("/settings");
}

/**
 * Member leaves the family. Owners cannot leave — they must transfer ownership
 * or delete the family (Phase 4).
 */
export async function leaveFamily() {
  const session = await requireSession();
  if (session.member.role === "owner") {
    throw new Error("Owners must transfer ownership before leaving");
  }

  await prisma.$transaction([
    prisma.familyMember.delete({ where: { id: session.member.id } }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { familyId: null },
    }),
  ]);

  // The user's next visit will bootstrap a fresh solo family.
  redirect("/");
}
