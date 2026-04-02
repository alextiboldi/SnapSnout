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
  { title: "Gotcha Day", description: "The day it all began.", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "First Car Ride", description: "The great adventure begins with four wheels.", emoji: "🚗", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "First Vet Visit", description: "A clean bill of health from the very start.", emoji: "🏥", anchorType: "gotcha", offsetDays: 5, isShareable: true },
  { title: "First Bath", description: "Splashy introduction to grooming.", emoji: "🛁", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "First Toy Destroyed", description: "RIP squeaky duck. You served well.", emoji: "🧸", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "First Walk Outside", description: "Exploring the neighbourhood one sniff at a time.", emoji: "🐾", anchorType: "dob", offsetDays: 112, isShareable: true },
  { title: "2nd Vaccinations", description: "Staying protected and healthy.", emoji: "💉", anchorType: "dob", offsetDays: 84, isShareable: false },
  { title: "First Puppy Class", description: "Learning to be a good boy/girl.", emoji: "🎓", anchorType: "dob", offsetDays: 98, isShareable: true },
  { title: "4 Months Old", description: "Growing up so fast!", emoji: "🎂", anchorType: "dob", offsetDays: 122, isShareable: true },
  { title: "Lost First Baby Tooth", description: "Growing up one tooth at a time.", emoji: "🦷", anchorType: "dob", offsetDays: 135, isShareable: true },
  { title: "First Dog Park", description: "Off-leash and loving it.", emoji: "🐕", anchorType: "dob", offsetDays: 150, isShareable: true },
  { title: "Half Birthday", description: "Six months of pure joy.", emoji: "🎂", anchorType: "dob", offsetDays: 183, isShareable: true },
  { title: "All Adult Teeth", description: "No more teething — the furniture is safe (maybe).", emoji: "😁", anchorType: "dob", offsetDays: 210, isShareable: true },
  { title: "Reached Full Height", description: "All grown up (almost).", emoji: "📏", anchorType: "dob", offsetDays: 365, isShareable: true },
  { title: "First Birthday", description: "One whole year of being the best.", emoji: "🎉", anchorType: "dob", offsetDays: 365, isShareable: true },
  { title: "Switched to Adult Food", description: "Big kid meals from now on.", emoji: "🍖", anchorType: "dob", offsetDays: 395, isShareable: false },
  { title: "Fully Mature", description: "A true adult in every way.", emoji: "🌟", anchorType: "dob", offsetDays: 548, isShareable: true },
];

const adultDogMilestones: MilestonePreset[] = [
  { title: "Gotcha Day", description: "Welcome home, forever.", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "First Car Ride Home", description: "The journey to a new life.", emoji: "🚗", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "First Nap in New Bed", description: "Starting to feel like home.", emoji: "😴", anchorType: "gotcha", offsetDays: 1, isShareable: true },
  { title: "One Week Home", description: "Seven days of new beginnings.", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "First Tail Wag at You", description: "The moment you knew it was real.", emoji: "💛", anchorType: "gotcha", offsetDays: 10, isShareable: true },
  { title: "3-3-3 Rule: 3 Weeks", description: "Starting to show their real personality.", emoji: "✨", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "One Month Home", description: "A whole month of love.", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "3-3-3 Rule: 3 Months", description: "Fully settled in. This is home.", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "Half-Year Adoptiversary", description: "Six months of forever.", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "One Year Adoptiversary", description: "365 days of joy.", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
];

const seniorDogMilestones: MilestonePreset[] = [
  { title: "Gotcha Day", description: "A golden heart finds a golden home.", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "One Week Home", description: "Settling in nicely.", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "One Month Home", description: "Comfortable and content.", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "3-3-3 Rule: 3 Months", description: "Truly at home.", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "Half-Year Adoptiversary", description: "Six months of golden years.", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "Gray Muzzle Photoshoot", description: "Distinguished and beautiful.", emoji: "📸", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "Still Got It!", description: "Age is just a number.", emoji: "💪", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "Best Nap Ever", description: "Professional napper status achieved.", emoji: "😴", anchorType: "gotcha", offsetDays: null, isShareable: true },
  { title: "One Year Adoptiversary", description: "A year of love.", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
  { title: "Birthday Celebration", description: "Celebrating another trip around the sun.", emoji: "🥳", anchorType: "gotcha", offsetDays: null, isShareable: true },
];

const kittenMilestones: MilestonePreset[] = [
  { title: "Gotcha Day", description: "A tiny ball of fur arrives.", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "First Purr", description: "The sweetest sound in the world.", emoji: "😻", anchorType: "gotcha", offsetDays: 3, isShareable: true },
  { title: "First Vet Visit", description: "Healthy and curious.", emoji: "🏥", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "First Zoomies", description: "Zoom zoom zoom!", emoji: "💨", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "Litter Box Pro", description: "Mastered the essentials.", emoji: "✅", anchorType: "gotcha", offsetDays: 7, isShareable: false },
  { title: "First Lost Baby Tooth", description: "Growing up fast.", emoji: "🦷", anchorType: "dob", offsetDays: 105, isShareable: true },
  { title: "Half Birthday", description: "Six months of mischief.", emoji: "🎂", anchorType: "dob", offsetDays: 183, isShareable: true },
  { title: "First Birthday", description: "One year of cattitude.", emoji: "🎉", anchorType: "dob", offsetDays: 365, isShareable: true },
];

const adultCatMilestones: MilestonePreset[] = [
  { title: "Gotcha Day", description: "Chosen by a cat. What an honour.", emoji: "🏠", anchorType: "gotcha", offsetDays: 0, isShareable: true },
  { title: "Came Out of Hiding", description: "The bravest step.", emoji: "👀", anchorType: "gotcha", offsetDays: 3, isShareable: true },
  { title: "One Week Home", description: "Starting to explore.", emoji: "📅", anchorType: "gotcha", offsetDays: 7, isShareable: true },
  { title: "First Head Bump", description: "You've been accepted.", emoji: "💛", anchorType: "gotcha", offsetDays: 14, isShareable: true },
  { title: "3-3-3 Rule: 3 Weeks", description: "Getting comfortable.", emoji: "✨", anchorType: "gotcha", offsetDays: 21, isShareable: true },
  { title: "One Month Home", description: "This is their kingdom now.", emoji: "🗓️", anchorType: "gotcha", offsetDays: 30, isShareable: true },
  { title: "3-3-3 Rule: 3 Months", description: "Fully settled. Rules the house.", emoji: "🧡", anchorType: "gotcha", offsetDays: 90, isShareable: true },
  { title: "Half-Year Adoptiversary", description: "Six months of purring.", emoji: "🎉", anchorType: "gotcha", offsetDays: 183, isShareable: true },
  { title: "One Year Adoptiversary", description: "A whole year together.", emoji: "🎂", anchorType: "gotcha", offsetDays: 365, isShareable: true },
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
