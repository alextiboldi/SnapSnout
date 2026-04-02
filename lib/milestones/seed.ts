import { prisma } from "@/lib/prisma";
import { getPresetsForPet } from "./presets";
import type { Pet } from "@/lib/generated/prisma/client";

export async function seedMilestonesForPet(pet: Pet) {
  const presets = getPresetsForPet(pet.species, pet.lifestage);

  const milestones = presets.map((preset, index) => {
    const anchorDate =
      preset.anchorType === "dob" && pet.dateOfBirth
        ? pet.dateOfBirth
        : pet.gotchaDay;

    const targetDate =
      preset.offsetDays !== null
        ? new Date(anchorDate.getTime() + preset.offsetDays * 86_400_000)
        : null;

    // If targetDate is in the past and it's a "day 0" milestone, auto-complete it
    const isAutoCompleted =
      preset.offsetDays === 0 && preset.anchorType === "gotcha";

    return {
      petId: pet.id,
      title: preset.title,
      description: preset.description,
      emoji: preset.emoji,
      targetDate,
      completedDate: isAutoCompleted ? pet.gotchaDay : null,
      isShareable: preset.isShareable,
      isCustom: false,
      sortOrder: index,
    };
  });

  await prisma.milestone.createMany({ data: milestones });
}
