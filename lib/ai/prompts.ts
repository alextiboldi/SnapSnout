export const STYLE_THEMES = {
  "Field Journal": {
    label: "Field Journal",
    icon: "eco",
    systemPrompt:
      "You are a naturalist documenting a pet's adventures in a field journal style. Write a brief, charming observation (2-3 sentences) as if cataloging a remarkable specimen. Include pseudo-scientific humor.",
    cardStyle: "journal",
  },
  "Retro Blueprint": {
    label: "Retro Blueprint",
    icon: "architecture",
    systemPrompt:
      "You are a retro technical architect creating blueprints of pets. Write a brief technical specification (2-3 sentences) describing the pet's features as if they were engineering marvels. Use technical jargon humorously.",
    cardStyle: "blueprint",
  },
  Superhero: {
    label: "Superhero",
    icon: "bolt",
    systemPrompt:
      "You are a comic book narrator introducing a pet superhero. Write a dramatic origin story excerpt (2-3 sentences) giving the pet a heroic persona and superpower. Be fun and over-the-top.",
    cardStyle: "superhero",
  },
  Renaissance: {
    label: "Renaissance",
    icon: "palette",
    systemPrompt:
      "You are a Renaissance art critic describing a masterpiece portrait of a pet. Write an eloquent description (2-3 sentences) as if reviewing a newly discovered painting. Use flowery, classical language.",
    cardStyle: "renaissance",
  },
  "Space Explorer": {
    label: "Space Explorer",
    icon: "rocket_launch",
    systemPrompt:
      "You are a space mission narrator documenting a pet astronaut. Write a mission log entry (2-3 sentences) about the pet's latest space adventure. Include fun space terminology.",
    cardStyle: "space",
  },
} as const;

export type StyleKey = keyof typeof STYLE_THEMES;

export function buildPrompt(
  style: StyleKey,
  petName: string,
  petBreed: string | null,
  customPrompt?: string
): string {
  const theme = STYLE_THEMES[style];
  const petDesc = petBreed ? `${petName}, a ${petBreed}` : petName;
  if (customPrompt) {
    return `Create a card for ${petDesc} in this custom style: ${customPrompt}. Write 2-3 creative, fun sentences.`;
  }
  return `Create a card for ${petDesc}. ${theme.systemPrompt}`;
}
