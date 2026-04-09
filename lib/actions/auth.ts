"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type DeleteAccountIntent =
  | { kind: "solo" } // sole member of solo family — straightforward delete
  | { kind: "member" } // regular member — drops their FamilyMember, family stays
  | { kind: "owner_with_members"; memberCount: number; familyName: string };

/** Inspect what will happen if the current user runs deleteAccount. */
export async function getDeleteAccountIntent(): Promise<DeleteAccountIntent> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      family: {
        include: {
          members: { select: { id: true } },
        },
      },
    },
  });

  if (!dbUser?.family) return { kind: "solo" };

  const family = dbUser.family;
  const isOwner = family.ownerId === user.id;

  if (!isOwner) return { kind: "member" };
  if (family.members.length === 1) return { kind: "solo" };

  return {
    kind: "owner_with_members",
    memberCount: family.members.length,
    familyName: family.name,
  };
}

/**
 * Delete the current user. Requires `confirmDeleteFamily: true` when the user
 * is the owner of a multi-member family — that path nukes the entire family,
 * its pets, photos, and memberships. Otherwise the family is left untouched
 * (the user's FamilyMember row is removed via cascade).
 */
export async function deleteAccount(
  options: { confirmDeleteFamily?: boolean } = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const intent = await getDeleteAccountIntent();

  if (intent.kind === "owner_with_members" && !options.confirmDeleteFamily) {
    throw new Error(
      "OWNER_TRANSFER_REQUIRED: Transfer ownership or confirm family deletion."
    );
  }

  // Delete the Prisma user. Cascades:
  //   user → ownedFamilies (cascade) → pets → milestones / photos
  //   user → memberships (cascade)
  // For non-owner members, the family stays intact; only their FamilyMember row dies.
  await prisma.user.deleteMany({ where: { id: user.id } });

  // Delete the Supabase auth user via admin API.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
