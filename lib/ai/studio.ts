import Anthropic from "@anthropic-ai/sdk";
import { STYLE_THEMES, type StyleKey, buildPrompt } from "./prompts";

const anthropic = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

export async function generateCardText(
  style: StyleKey,
  petName: string,
  petBreed: string | null,
  customPrompt?: string
): Promise<{ title: string; description: string; tags: string[] }> {
  const prompt = buildPrompt(style, petName, petBreed, customPrompt);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nRespond in JSON format only, no markdown: { "title": "short catchy title (3-5 words)", "description": "2-3 fun sentences", "tags": ["tag1", "tag2", "tag3"] }`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // Fall through to default
  }

  return {
    title: `${petName}'s ${STYLE_THEMES[style].label} Card`,
    description: text.slice(0, 200),
    tags: [style.toLowerCase().replace(/\s+/g, ""), "snapsnout"],
  };
}
