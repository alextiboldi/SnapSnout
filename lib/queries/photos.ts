import { prisma } from "@/lib/prisma";

export async function getPhotosForPet(petId: string) {
  return prisma.photo.findMany({
    where: { petId },
    orderBy: { capturedDate: "desc" },
    include: { uploader: { select: { id: true, name: true, email: true } } },
  });
}
