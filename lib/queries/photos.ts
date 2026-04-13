import { prisma } from "@/lib/prisma";

export async function getPhotosForPet(petId: string) {
  return prisma.photo.findMany({
    where: { petId },
    orderBy: { capturedDate: "desc" },
    include: { uploader: { select: { id: true, name: true, email: true } } },
  });
}

export async function getMonthlyPhotosForPet(petId: string) {
  return prisma.photo.findMany({
    where: { petId, isMonthlyPhoto: true },
    orderBy: { monthNumber: "asc" },
    select: {
      id: true,
      url: true,
      monthNumber: true,
      capturedDate: true,
      caption: true,
      uploader: { select: { name: true } },
    },
  });
}

export async function isMonthlyPhotoDue(
  petId: string,
  gotchaDay: Date
): Promise<{ isDue: boolean; monthNumber: number }> {
  const months =
    Math.floor(
      (Date.now() - new Date(gotchaDay).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    ) + 1;
  const currentMonth = Math.min(Math.max(months, 1), 24);
  const existing = await prisma.photo.findFirst({
    where: { petId, isMonthlyPhoto: true, monthNumber: currentMonth },
  });
  return { isDue: !existing, monthNumber: currentMonth };
}
