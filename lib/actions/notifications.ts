"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export async function updateNotificationPreference(
  key: "milestoneReminders" | "photoReminders" | "birthdayCountdown",
  value: boolean
) {
  const session = await requireSession();
  await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: { [key]: value },
    create: { userId: session.user.id, [key]: value },
  });
  revalidatePath("/settings");
}
