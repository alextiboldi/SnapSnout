"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requireSession, assertPetInFamily } from "@/lib/auth/session";

export async function addMonthlyPhoto(
  petId: string,
  monthNumber: number,
  formData: FormData
) {
  const session = await requireSession();
  await assertPetInFamily(session, petId);

  if (monthNumber < 1 || monthNumber > 24) {
    throw new Error("Month number must be between 1 and 24");
  }

  const existing = await prisma.photo.findFirst({
    where: { petId, isMonthlyPhoto: true, monthNumber },
  });
  if (existing) {
    throw new Error("A monthly photo already exists for this month");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${session.family.id}/${petId}/monthly/${monthNumber}.${ext}`;

  const { data, error } = await supabase.storage
    .from("pet-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("pet-photos").getPublicUrl(data.path);

  await prisma.photo.create({
    data: {
      petId,
      uploaderId: session.user.id,
      url: publicUrl,
      isMonthlyPhoto: true,
      monthNumber,
      capturedDate: new Date(),
    },
  });

  revalidatePath("/milestones/monthly");
  revalidatePath("/");
}
