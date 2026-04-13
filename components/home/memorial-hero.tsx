import { Icon } from "@/components/icon";
import { formatDate } from "@/lib/utils";
import type { Pet } from "@/lib/generated/prisma/client";

export function MemorialHero({
  pet,
  t,
}: {
  pet: Pet;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  return (
    <section className="relative px-5 pt-4 pb-6">
      {/* Memorial banner */}
      <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-surface-container-highest/60 px-4 py-2">
        <span className="text-lg">🌈</span>
        <p className="font-friendly text-xs font-medium text-on-surface-variant">
          {t("inLovingMemory")}
        </p>
      </div>

      {/* Avatar with muted styling */}
      <div className="relative mx-auto h-[140px] w-[140px] md:h-[180px] md:w-[180px]">
        <div className="irregular-border h-full w-full overflow-hidden bg-gradient-to-br from-surface-container-highest/40 via-outline-variant/20 to-surface-container-high/40 shadow-clay">
          {pet.photoUrl ? (
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="h-full w-full object-cover saturate-[0.7]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon
                name="pets"
                filled
                className="text-6xl text-on-surface-variant/50"
              />
            </div>
          )}
        </div>
        <div className="absolute -bottom-2 -right-1 rounded-full bg-surface-container-highest px-3 py-1.5 shadow-clay">
          <p className="font-display text-[11px] font-bold text-on-surface-variant leading-none">
            🌈 {t("rainbowBridge")}
          </p>
        </div>
      </div>

      <h1 className="mt-6 text-center font-display text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
        {pet.name}
      </h1>

      {/* Life dates */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-friendly text-sm text-on-surface-variant">
        {pet.dateOfBirth && <span>{formatDate(pet.dateOfBirth)}</span>}
        {pet.dateOfBirth && pet.deceasedDate && (
          <span className="text-outline-variant">&mdash;</span>
        )}
        {pet.deceasedDate && <span>{formatDate(pet.deceasedDate)}</span>}
      </div>

      {/* Tribute note */}
      {pet.tributeNote && (
        <div className="mx-auto mt-4 max-w-sm rounded-2xl bg-surface-container-lowest/80 p-4 shadow-clay">
          <p className="text-center font-friendly text-sm italic text-on-surface-variant leading-relaxed">
            &ldquo;{pet.tributeNote}&rdquo;
          </p>
        </div>
      )}
    </section>
  );
}
