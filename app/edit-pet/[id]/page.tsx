import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPetById } from "@/lib/queries/pets";
import EditPetClient from "./edit-pet-client";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pet = await getPetById(id, user.id);
  if (!pet) redirect("/settings");

  return <EditPetClient pet={pet} />;
}
