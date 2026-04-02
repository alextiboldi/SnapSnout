import type { Species, Lifestage } from "@/lib/generated/prisma/client";

interface MilestonePreset {
  title: string;
  description: string;
  emoji: string;
  anchorType: "dob" | "gotcha";
  offsetDays: number | null; // null = "anytime" milestone
  isShareable: boolean;
}

const puppyMilestones: MilestonePreset[] = [
  { title: "presets.gotchaDay", description: "presets.gotchaDayDesc", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.firstCarRide", description: "presets.firstCarRideDesc", emoji: "🚗", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.firstVetVisit", description: "presets.firstVetVisitDesc", emoji: "🏥", anchorType: "gotcha", offsetDays: 5, isShareable: true },
  { title: "presets.firstBath", description: "presets.firstBathDesc", emoji: "🛁", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "presets.firstToyDestroyed", description: "presets.firstToyDestroyedDesc", emoji: "🧸", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "presets.firstWalkOutside", description: "presets.firstWalkOutsideDesc", emoji: "🐾", anchorType: "dob", offsetDays: 112, isShareable: true },
  { title: "presets.secondVaccinations", description: "presets.secondVaccinationsDesc", emoji: "💉", anchorType: "dob", offsetDays: 84, isShareable: false },
  { title: "presets.firstPuppyClass", description: "presets.firstPuppyClassDesc", emoji: "🎓", anchorType: "dob", offsetDays: 98, isShareable: true },
  { title: "presets.fourMonthsOld", description: "presets.fourMonthsOldDesc", emoji: "🎂", anchorType: "dob", offsetDays: 122, isShareable: true },
  { title: "presets.lostFirstBabyTooth", description: "presets.lostFirstBabyToothDesc", emoji: "🦷", anchorType: "dob", offsetDays: 135, isShareable: true },
  { title: "presets.firstDogPark", description: "presets.firstDogParkDesc", emoji: "🐕", anchorType: "dob", offsetDays: 150, isShareable: true },
  { title: "presets.halfBirthday", description: "presets.halfBirthdayDesc", emoji: "🎂", anchorType: "dob", offsetDays: 183, isShareable: true },
  { title: "presets.allAdultTeeth", description: "presets.allAdultTeethDesc", emoji: "😁", anchorType: "dob", offsetDays: 210, isShareable: true },
  { title: "presets.reachedFullHeight", description: "presets.reachedFullHeightDesc", emoji: "📏", anchorType: "dob", offsetDays: 365, isShareable: true },
  { title: "presets.firstBirthday", description: "presets.firstBirthdayDesc", emoji: "🎉", anchorType: "dob", offsetDays: 365, isShareable: true },
  { title: "presets.switchedToAdultFood", description: "presets.switchedToAdultFoodDesc", emoji: "🍖", anchorType: "dob", offsetDays: 395, isShareable: false },
  { title: "presets.fullyMature", description: "presets.fullyMatureDesc", emoji: "🌟", anchorType: "dob", offsetDays: 548, isShareable: true },
];

const adultDogMilestones: MilestonePreset[] = [
  { title: "presets.gotchaDay", description: "presets.gotchaDayDesc", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.firstCarRideHome", description: "presets.firstCarRideHomeDesc", emoji: "🚗", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.firstNapInNewBed", description: "presets.firstNapInNewBedDesc", emoji: "😴", anchorType: "gotcha", offsetDays: 1, isShareable: true },
  { title: "presets.oneWeekHome", description: "presets.oneWeekHomeDesc", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "presets.firstTailWag", description: "presets.firstTailWagDesc", emoji: "💛", anchorType: "gotcha", offsetDays: 10, isShareable: true },
  { title: "presets.threeWeeks", description: "presets.threeWeeksDesc", emoji: "✨", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "presets.oneMonthHome", description: "presets.oneMonthHomeDesc", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "presets.threeMonths", description: "presets.threeMonthsDesc", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "presets.halfYearAdoptiversary", description: "presets.halfYearAdoptiversaryDesc", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "presets.oneYearAdoptiversary", description: "presets.oneYearAdoptiversaryDesc", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
];

const seniorDogMilestones: MilestonePreset[] = [
  { title: "presets.gotchaDay", description: "presets.gotchaDayDesc", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.oneWeekHome", description: "presets.oneWeekHomeDesc", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "presets.oneMonthHome", description: "presets.oneMonthHomeDesc", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "presets.threeMonths", description: "presets.threeMonthsDesc", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "presets.halfYearAdoptiversary", description: "presets.halfYearAdoptiversaryDesc", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "presets.grayMuzzlePhotoshoot", description: "presets.grayMuzzlePhotoshootDesc", emoji: "📸", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "presets.stillGotIt", description: "presets.stillGotItDesc", emoji: "💪", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "presets.bestNapEver", description: "presets.bestNapEverDesc", emoji: "😴", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "presets.oneYearAdoptiversary", description: "presets.oneYearAdoptiversaryDesc", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
  { title: "presets.birthdayCelebration", description: "presets.birthdayCelebrationDesc", emoji: "🥳", anchorType: "gotcha", offsetDays: null, isShareable: true },
];

const kittenMilestones: MilestonePreset[] = [
  { title: "presets.gotchaDay", description: "presets.gotchaDayDesc", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.firstPurr", description: "presets.firstPurrDesc", emoji: "😻", anchorType: "gotcha", offsetDays: 3, isShareable: true },
  { title: "presets.firstVetVisit", description: "presets.firstVetVisitDesc", emoji: "🏥", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "presets.firstZoomies", description: "presets.firstZoomiesDesc", emoji: "💨", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "presets.litterBoxPro", description: "presets.litterBoxProDesc", emoji: "✅", anchorType: "gotcha", offsetDays: 7, isShareable: false },
  { title: "presets.lostFirstBabyTooth", description: "presets.lostFirstBabyToothDesc", emoji: "🦷", anchorType: "dob", offsetDays: 105, isShareable: true },
  { title: "presets.halfBirthday", description: "presets.halfBirthdayDesc", emoji: "🎂", anchorType: "dob", offsetDays: 183, isShareable: true },
  { title: "presets.firstBirthday", description: "presets.firstBirthdayDesc", emoji: "🎉", anchorType: "dob", offsetDays: 365, isShareable: true },
];

const adultCatMilestones: MilestonePreset[] = [
  { title: "presets.gotchaDay", description: "presets.gotchaDayDesc", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "presets.cameOutOfHiding", description: "presets.cameOutOfHidingDesc", emoji: "👀", anchorType: "gotcha", offsetDays: 3, isShareable: true },
  { title: "presets.oneWeekHome", description: "presets.oneWeekHomeDesc", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "presets.firstHeadBump", description: "presets.firstHeadBumpDesc", emoji: "💛", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "presets.threeWeeks", description: "presets.threeWeeksDesc", emoji: "✨", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "presets.oneMonthHome", description: "presets.oneMonthHomeDesc", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "presets.threeMonths", description: "presets.threeMonthsDesc", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "presets.halfYearAdoptiversary", description: "presets.halfYearAdoptiversaryDesc", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "presets.oneYearAdoptiversary", description: "presets.oneYearAdoptiversaryDesc", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
];

export function getPresetsForPet(
  species: Species,
  lifestage: Lifestage
): MilestonePreset[] {
  if (species === "dog") {
    if (lifestage === "puppy") return puppyMilestones;
    if (lifestage === "senior") return seniorDogMilestones;
    return adultDogMilestones;
  }
  if (species === "cat") {
    if (lifestage === "kitten") return kittenMilestones;
    return adultCatMilestones;
  }
  // Horse/other — use adult dog milestones as a reasonable default
  return adultDogMilestones;
}
