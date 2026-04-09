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

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Delete app data first (cascades to pets, milestones, photos via Prisma schema).
  // If the user row doesn't exist yet we don't care — proceed.
  await prisma.user.deleteMany({ where: { id: user.id } });

  // Delete the Supabase auth user via admin API.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }

  // Clear local session.
  await supabase.auth.signOut();
  redirect("/login");
}
