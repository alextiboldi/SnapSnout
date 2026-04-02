"use client";

import { useTransition } from "react";
import { switchActivePet } from "@/lib/actions/pets";
import { Icon } from "@/components/icon";
import type { Pet } from "@/lib/generated/prisma/client";

export function PetSwitcher({
  pets,
  activePetId,
}: {
  pets: Pet[];
  activePetId: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (pets.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {pets.map((pet) => (
        <button
          key={pet.id}
          disabled={isPending}
          onClick={() => {
            if (pet.id !== activePetId) {
              startTransition(() => switchActivePet(pet.id));
            }
          }}
          className={`relative h-10 w-10 shrink-0 rounded-full bg-surface-container-low transition-all ${
            pet.id === activePetId
              ? "ring-[2.5px] ring-primary ring-offset-2 ring-offset-surface"
              : "opacity-60 hover:opacity-90"
          } ${isPending ? "pointer-events-none opacity-40" : ""}`}
          aria-label={`Switch to ${pet.name}`}
          aria-current={pet.id === activePetId ? "true" : undefined}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-outline-variant/20 overflow-hidden">
            {pet.photoUrl ? (
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon
                name="pets"
                filled
                className="text-lg text-on-surface-variant"
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
