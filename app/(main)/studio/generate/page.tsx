import { requireSession } from "@/lib/auth/session";
import { getActivePetForMember } from "@/lib/queries/pets";
import { redirect } from "next/navigation";
import { CardGenerator } from "./card-generator";

export default async function CardGeneratorPage() {
  const session = await requireSession();
  const pet = await getActivePetForMember(
    session.family.id,
    session.member.id
  );

  if (!pet) redirect("/pets/new");

  return (
    <CardGenerator
      petId={pet.id}
      petName={pet.name}
      petBreed={pet.breed}
      petPhotoUrl={pet.photoUrl}
    />
  );
}
