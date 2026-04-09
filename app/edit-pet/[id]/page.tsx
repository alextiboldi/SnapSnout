import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getPetByIdForFamily } from "@/lib/queries/pets";
import EditPetClient from "./edit-pet-client";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const pet = await getPetByIdForFamily(id, session.family.id);
  if (!pet) redirect("/settings");

  return <EditPetClient pet={pet} />;
}
