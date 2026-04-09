import { requireSession } from "@/lib/auth/session";
import { getPetsForFamily } from "@/lib/queries/pets";
import { getFamilyDetails } from "@/lib/queries/family";
import { getActiveSharesForFamily } from "@/lib/queries/milestone-shares";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await requireSession();
  const [pets, familyDetails, activeShares] = await Promise.all([
    getPetsForFamily(session.family.id),
    getFamilyDetails(session.family.id),
    getActiveSharesForFamily(session.family.id),
  ]);

  return (
    <SettingsClient
      pets={pets}
      activePetId={session.member.activePetId}
      isOwner={session.member.role === "owner"}
      isPremium={session.user.isPremium}
      currentUserId={session.user.id}
      familyDetails={familyDetails}
      activeShares={activeShares}
    />
  );
}
