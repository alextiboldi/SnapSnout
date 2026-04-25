import { prisma } from "@/lib/prisma";

export type NotificationPreferences = {
  milestoneReminders: boolean;
  photoReminders: boolean;
  birthdayCountdown: boolean;
};

const DEFAULTS: NotificationPreferences = {
  milestoneReminders: true,
  photoReminders: true,
  birthdayCountdown: true,
};

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
    select: { milestoneReminders: true, photoReminders: true, birthdayCountdown: true },
  });
  return prefs ?? DEFAULTS;
}
