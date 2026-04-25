import { NextRequest, NextResponse } from "next/server";
import { generateCardText } from "@/lib/ai/studio";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { StyleKey } from "@/lib/ai/prompts";
import { STYLE_THEMES } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { style, petId, customPrompt } = body as {
      style: string;
      petId: string;
      customPrompt?: string;
    };

    if (!style || !(style in STYLE_THEMES)) {
      return NextResponse.json({ error: "Invalid style" }, { status: 400 });
    }

    if (!petId) {
      return NextResponse.json({ error: "Pet ID required" }, { status: 400 });
    }

    // Verify pet belongs to family
    const pet = await prisma.pet.findFirst({
      where: { id: petId, familyId: session.family.id },
      select: { name: true, breed: true },
    });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const result = await generateCardText(
      style as StyleKey,
      pet.name,
      pet.breed,
      customPrompt
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
