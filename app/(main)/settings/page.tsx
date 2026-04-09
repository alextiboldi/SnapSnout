import { requireSession } from "@/lib/auth/session";
import { getPetsForFamily } from "@/lib/queries/pets";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await requireSession();
  const pets = await getPetsForFamily(session.family.id);

  return (
    <SettingsClient
      pets={pets}
      activePetId={session.member.activePetId}
      isOwner={session.member.role === "owner"}
    />
  );
}
