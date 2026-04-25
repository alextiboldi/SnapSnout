"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { seedMilestonesForPet } from "@/lib/milestones/seed";
import {
  requireSession,
  assertOwner,
  assertPetInFamily,
} from "@/lib/auth/session";
import type { Species, Lifestage } from "@/lib/generated/prisma/client";

export async function createPet(formData: FormData) {
  const session = await requireSession();

  const pet = await prisma.pet.create({
    data: {
      familyId: session.family.id,
      name: formData.get("name") as string,
      species: (formData.get("species") as Species) || "dog",
      breed: (formData.get("breed") as string) || null,
      lifestage: (formData.get("lifestage") as Lifestage) || "puppy",
      dateOfBirth: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : null,
      gotchaDay: formData.get("gotchaDate")
        ? new Date(formData.get("gotchaDate") as string)
        : new Date(),
      photoUrl: (formData.get("photoUrl") as string) || null,
      isDeceased: formData.get("isDeceased") === "true",
      deceasedDate: formData.get("deceasedDate")
        ? new Date(formData.get("deceasedDate") as string)
        : null,
      tributeNote: (formData.get("tributeNote") as string) || null,
    },
  });

  // Auto-seed milestones based on species + lifestage.
  await seedMilestonesForPet(pet);

  // Make this the creating member's active pet.
  await prisma.familyMember.update({
    where: { id: session.member.id },
    data: { activePetId: pet.id },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  revalidatePath("/settings");
}

export async function switchActivePet(petId: string) {
  const session = await requireSession();
  await assertPetInFamily(session, petId);

  await prisma.familyMember.update({
    where: { id: session.member.id },
    data: { activePetId: petId },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
}

export async function updatePet(petId: string, formData: FormData) {
  const session = await requireSession();
  const pet = await assertPetInFamily(session, petId);

  await prisma.pet.update({
    where: { id: petId },
    data: {
      name: formData.get("name") as string,
      species: (formData.get("species") as Species) || pet.species,
      breed: (formData.get("breed") as string) || null,
      lifestage: (formData.get("lifestage") as Lifestage) || pet.lifestage,
      dateOfBirth: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : null,
      gotchaDay: formData.get("gotchaDate")
        ? new Date(formData.get("gotchaDate") as string)
        : pet.gotchaDay,
      photoUrl: (formData.get("photoUrl") as string) || pet.photoUrl,
      isDeceased: formData.get("isDeceased") === "true",
      deceasedDate: formData.get("deceasedDate")
        ? new Date(formData.get("deceasedDate") as string)
        : null,
      tributeNote: (formData.get("tributeNote") as string) || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/milestones");
}

export async function deletePet(petId: string) {
  const session = await requireSession();
  assertOwner(session); // Only owners can delete pets.
  await assertPetInFamily(session, petId);

  const supabase = await createClient();
  const pet = await prisma.pet.findUniqueOrThrow({
    where: { id: petId },
    include: {
      milestones: { select: { photoUrl: true } },
      photos: { select: { url: true } },
    },
  });

  // Clean up storage files under this pet's folder, plus any referenced URLs.
  const foldersToClean = [
    `${session.user.id}/${petId}`,
    `${session.user.id}/profile`,
  ];
  for (const folder of foldersToClean) {
    const { data: files } = await supabase.storage
      .from("pet-photos")
      .list(folder);
    if (files && files.length > 0) {
      await supabase.storage
        .from("pet-photos")
        .remove(files.map((f) => `${folder}/${f.name}`));
    }
  }

  const urls = [
    pet.photoUrl,
    ...pet.milestones.map((m) => m.photoUrl),
    ...pet.photos.map((p) => p.url),
  ].filter(Boolean) as string[];

  const paths = urls
    .map((url) => {
      const marker = "/pet-photos/";
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : null;
    })
    .filter(Boolean) as string[];

  if (paths.length > 0) {
    await supabase.storage.from("pet-photos").remove(paths);
  }

  await prisma.pet.delete({ where: { id: petId } });

  // If any member had this pet active, fall back to the most recent remaining.
  const fallback = await prisma.pet.findFirst({
    where: { familyId: session.family.id },
    orderBy: { createdAt: "desc" },
  });
  await prisma.familyMember.updateMany({
    where: { familyId: session.family.id, activePetId: petId },
    data: { activePetId: fallback?.id ?? null },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/milestones");
}
