import { requireSession } from "@/lib/auth/session";
import { getPetsForFamily } from "@/lib/queries/pets";
import { getFamilyDetails } from "@/lib/queries/family";
import { getNotificationPreferences } from "@/lib/queries/notifications";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await requireSession();
  const [pets, familyDetails, notifPrefs] = await Promise.all([
    getPetsForFamily(session.family.id),
    getFamilyDetails(session.family.id),
    getNotificationPreferences(session.user.id),
  ]);

  return (
    <SettingsClient
      pets={pets}
      activePetId={session.member.activePetId}
      isOwner={session.member.role === "owner"}
      isPremium={session.user.isPremium}
      currentUserId={session.user.id}
      familyDetails={familyDetails}
      notificationPreferences={notifPrefs}
    />
  );
}
