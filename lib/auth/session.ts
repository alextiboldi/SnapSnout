import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { User, Family, FamilyMember } from "@/lib/generated/prisma/client";

export type FamilySession = {
  user: User;
  family: Family;
  member: FamilyMember;
};

/**
 * Returns the authenticated session with the user, their current family, and
 * their membership row. If the user exists in Supabase auth but has no Prisma
 * User row yet (first login), lazily creates the User + a solo Family + an
 * owner membership.
 *
 * Returns `null` if there is no Supabase session.
 */
export async function getSession(): Promise<FamilySession | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Fast path: user row exists and has a family.
  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      family: {
        include: {
          members: { where: { userId: authUser.id } },
        },
      },
    },
  });

  if (existing?.family && existing.family.members.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { family, ...userRest } = existing;
    const { members, ...familyRest } = family;
    return {
      user: { ...userRest, familyId: existing.familyId } as User,
      family: familyRest,
      member: members[0],
    };
  }

  // Slow path: bootstrap the user + solo family.
  return bootstrapSoloFamily(authUser.id, authUser.email ?? "");
}

/**
 * Like `getSession` but redirects to /login if unauthenticated. Use in pages
 * and server actions that require auth.
 */
export async function requireSession(): Promise<FamilySession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Creates the User row (if missing), a solo Family, and an owner membership. */
async function bootstrapSoloFamily(
  userId: string,
  email: string
): Promise<FamilySession> {
  return prisma.$transaction(async (tx) => {
    // Ensure user exists — may have been created lazily before the family
    // schema landed, or may not exist at all.
    const user = await tx.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email,
        // isPremium defaults to true in schema during testing phase.
      },
    });

    // Does a family already exist (e.g. partial bootstrap)? Prefer it.
    let family = user.familyId
      ? await tx.family.findUnique({ where: { id: user.familyId } })
      : null;

    if (!family) {
      family = await tx.family.create({
        data: {
          name: familyDefaultName(user.name, email),
          ownerId: userId,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { familyId: family.id },
      });
    }

    const member = await tx.familyMember.upsert({
      where: { familyId_userId: { familyId: family.id, userId } },
      update: {},
      create: {
        familyId: family.id,
        userId,
        role: "owner",
      },
    });

    return {
      user: { ...user, familyId: family.id },
      family,
      member,
    };
  });
}

function familyDefaultName(name: string | null, email: string): string {
  const base = name?.trim() || email.split("@")[0] || "My";
  return `${base}'s Family`;
}

/** True if the session's user is the owner of their current family. */
export function isOwner(session: FamilySession): boolean {
  return session.member.role === "owner";
}

/** Throws if the session user is not the owner. */
export function assertOwner(session: FamilySession) {
  if (!isOwner(session)) {
    throw new Error("Owner role required");
  }
}

/**
 * Verifies a pet belongs to the session's family. Throws on mismatch.
 * Returns the pet for convenience.
 */
export async function assertPetInFamily(session: FamilySession, petId: string) {
  const pet = await prisma.pet.findFirst({
    where: { id: petId, familyId: session.family.id },
  });
  if (!pet) throw new Error("Pet not found");
  return pet;
}
