"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { seedMilestonesForPet } from "@/lib/milestones/seed";
import type { Species, Lifestage } from "@/lib/generated/prisma/client";

export async function createPet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Deactivate other pets for this user
  await prisma.pet.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });

  const pet = await prisma.pet.create({
    data: {
      userId: user.id,
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
      isActive: true,
    },
  });

  // Auto-seed milestones based on species + lifestage
  await seedMilestonesForPet(pet);

  revalidatePath("/");
}

export async function switchActivePet(petId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify the pet belongs to this user
  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: user.id },
  });
  if (!pet) throw new Error("Pet not found");

  // Deactivate all, activate selected
  await prisma.pet.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });
  await prisma.pet.update({
    where: { id: petId },
    data: { isActive: true },
  });

  revalidatePath("/");
}

export async function updatePet(petId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: user.id },
  });
  if (!pet) throw new Error("Pet not found");

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
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function deletePet(petId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: user.id },
    include: { milestones: { select: { photoUrl: true } }, photos: { select: { url: true } } },
  });
  if (!pet) throw new Error("Pet not found");

  // Delete all files in the user's storage folder for this pet
  // Pet avatars are stored at {userId}/profile/ and pet-specific at {userId}/{petId}/
  const foldersToClean = [`${user.id}/${petId}`, `${user.id}/profile`];

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

  // Also delete any files referenced by URL that might be in unexpected paths
  const urls = [
    pet.photoUrl,
    ...pet.milestones.map((m) => m.photoUrl),
    ...pet.photos.map((p) => p.url),
  ].filter(Boolean) as string[];

  const paths = urls
    .map((url) => {
      // Handle both /storage/v1/object/public/pet-photos/... and full https:// URLs
      const marker = "/pet-photos/";
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : null;
    })
    .filter(Boolean) as string[];

  if (paths.length > 0) {
    await supabase.storage.from("pet-photos").remove(paths);
  }

  await prisma.pet.delete({ where: { id: petId } });

  // If the deleted pet was active, activate the next one
  if (pet.isActive) {
    const nextPet = await prisma.pet.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (nextPet) {
      await prisma.pet.update({
        where: { id: nextPet.id },
        data: { isActive: true },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/settings");
}
