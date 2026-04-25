import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPetsForFamily, getActivePetForMember } from "@/lib/queries/pets";
import { requireSession } from "@/lib/auth/session";
import {
  getAge,
  daysUntil,
  formatDate,
  getMilestoneStatus,
  isTranslationKey,
} from "@/lib/utils";
import type { Pet, Milestone } from "@/lib/generated/prisma/client";
import type { MilestoneStatus } from "@/lib/utils";
import { PetSwitcher } from "./pet-switcher";
import { Icon } from "@/components/icon";
import { AppShell } from "@/components/home/app-shell";

type MilestoneWithStatus = Milestone & { status: MilestoneStatus };

/* ──────────────────────────────────────────────────────────────────────────
   Pawprint Clay home — playful, family-warm, claymorphism foundations.
   See docs/design-system.md for the full direction.
   ────────────────────────────────────────────────────────────────────────── */

function PetProfileHero({
  pet,
  t,
}: {
  pet: Pet;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  const age = pet.dateOfBirth ? getAge(pet.dateOfBirth) : null;
  const totalMonthsHome = Math.abs(
    Math.round(
      (new Date().getTime() - new Date(pet.gotchaDay).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    )
  );
  const homeYears = Math.floor(totalMonthsHome / 12);
  const homeMonths = totalMonthsHome % 12;

  return (
    <section className="relative px-5 pt-4 pb-6">
      {/* Avatar pillow with playful tilt */}
      <div className="relative mx-auto h-[140px] w-[140px] md:h-[180px] md:w-[180px]">
        <div className="irregular-border h-full w-full overflow-hidden bg-gradient-to-br from-primary-fixed/40 via-secondary-fixed/40 to-pop-container shadow-clay-lg">
          {pet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon
                name="pets"
                filled
                className="text-6xl text-primary/70 md:text-7xl"
              />
            </div>
          )}
        </div>

        {/* "X months home" sticker — pure cuteness */}
        <div className="sticker-tilt absolute -bottom-2 -right-1 rounded-full bg-pop px-3 py-1.5 text-on-pop shadow-clay">
          <p className="font-display text-[11px] font-bold uppercase tracking-wide leading-none">
            🏠 {homeYears >= 1
              ? t("homeForYears", { years: homeYears, months: homeMonths })
              : t("homeFor", { months: totalMonthsHome })}
          </p>
        </div>
      </div>

      {/* Name */}
      <h1 className="mt-6 text-center font-display text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
        {pet.name}
      </h1>

      {/* Meta line */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-friendly text-sm text-on-surface-variant">
        {age && (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="cake" className="text-base text-tertiary" />
            {t("old", { age })}
          </span>
        )}
        {pet.breed && (
          <>
            <span className="text-outline-variant" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pets" className="text-base text-primary" />
              {pet.breed}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

function NextMilestoneCard({
  milestone,
  t,
}: {
  milestone: MilestoneWithStatus;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  const isToday = milestone.status === "today";
  const days = milestone.targetDate ? daysUntil(milestone.targetDate) : 0;

  return (
    <div className="px-5">
      <Link
        href="/milestones"
        className={`spring-active relative block w-full overflow-hidden rounded-[28px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
          isToday
            ? "bg-pop text-on-pop shadow-clay-lg"
            : "bg-surface-container-lowest shadow-clay hover:shadow-clay-lg"
        }`}
      >
        {isToday && (
          <span className="sticker-tilt absolute -top-2 -right-2 rounded-full bg-secondary-fixed px-3 py-1 text-on-secondary-fixed shadow-clay">
            <span className="font-display text-[11px] font-bold uppercase tracking-wider">
              ⚡ TODAY!
            </span>
          </span>
        )}

        <div className="flex items-start gap-4">
          {/* Big emoji on a soft chip */}
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isToday ? "bg-on-pop/20" : "bg-primary/10"
            }`}
          >
            <span className="text-3xl leading-none" role="img" aria-hidden="true">
              {milestone.emoji}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`font-friendly text-[11px] font-bold uppercase tracking-wider ${
                isToday ? "text-on-pop/80" : "text-primary"
              }`}
            >
              {isToday ? t("happeningNow") : t("upNext")}
            </p>

            <h2
              className={`mt-1 font-display text-xl font-bold leading-tight tracking-tight ${
                isToday ? "text-on-pop" : "text-on-surface"
              }`}
            >
              {milestone.title}
            </h2>

            {milestone.description && (
              <p
                className={`mt-1.5 font-friendly text-sm leading-snug ${
                  isToday ? "text-on-pop/85" : "text-on-surface-variant"
                }`}
              >
                {milestone.description}
              </p>
            )}

            {!isToday && days > 0 && (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-tertiary/10 px-2.5 py-1 font-friendly text-xs font-bold text-tertiary">
                <Icon name="schedule" className="text-sm" />
                {t("inDays", { days })}
              </p>
            )}
          </div>

          <Icon
            name="arrow_forward"
            className={`shrink-0 text-xl ${isToday ? "text-on-pop/60" : "text-outline-variant"}`}
          />
        </div>
      </Link>
    </div>
  );
}

function RecentMilestones({
  milestones,
  t,
}: {
  milestones: MilestoneWithStatus[];
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  const recent = milestones.slice(-5).reverse();
  if (recent.length === 0) return null;

  return (
    <div className="mt-7">
      <h3 className="px-5 font-display text-xs font-bold uppercase tracking-widest text-on-surface-variant/80">
        {t("recentMemories")}
      </h3>

      <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-3 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recent.map((milestone, i) => (
          <Link
            key={milestone.id}
            href="/milestones"
            className="spring-active group flex w-[160px] shrink-0 flex-col rounded-[24px] bg-surface-container-lowest p-3 shadow-clay transition-all duration-200 hover:-translate-y-1 hover:shadow-clay-lg animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {milestone.photoUrl ? (
              <div className="mb-3 aspect-square w-full overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={milestone.photoUrl}
                  alt={milestone.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-fixed/30 via-secondary-fixed/40 to-pop-container">
                <span className="text-5xl leading-none" role="img" aria-hidden="true">
                  {milestone.emoji}
                </span>
              </div>
            )}

            <p className="font-display text-sm font-bold leading-tight text-on-surface">
              {milestone.title}
            </p>

            <p className="mt-1 inline-flex items-center gap-1 font-friendly text-[11px] text-sage">
              <Icon name="check_circle" filled className="text-sm" />
              {milestone.completedDate
                ? formatDate(milestone.completedDate)
                : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickActions({
  t,
}: {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  // Each action gets its own playful chip color so the grid feels alive.
  const actions = [
    {
      label: t("addPhoto"),
      icon: "photo_camera",
      description: t("snapMemory"),
      href: "/milestones",
      tint: "bg-primary/12 text-primary",
    },
    {
      label: t("newMilestone"),
      icon: "flag",
      description: t("markMoment"),
      href: "/milestones",
      tint: "bg-pop/15 text-pop",
    },
    {
      label: t("createCard"),
      icon: "auto_awesome",
      description: t("aiMagic"),
      href: "/studio/generate",
      tint: "bg-secondary-fixed/40 text-on-secondary-fixed",
    },
    {
      label: t("share"),
      icon: "share",
      description: t("showWorld"),
      href: "/studio",
      tint: "bg-tertiary/12 text-tertiary",
    },
  ];

  return (
    <div className="mt-7 px-5">
      <h3 className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-variant/80">
        {t("quickActions")}
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <Link
            key={action.label}
            href={action.href}
            className="spring-active group flex flex-col items-start gap-3 rounded-[24px] bg-surface-container-lowest p-4 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-lg animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${action.tint}`}
            >
              <Icon name={action.icon} filled className="text-2xl" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-on-surface">
                {action.label}
              </p>
              <p className="mt-0.5 font-friendly text-[11px] text-on-surface-variant/70">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  t,
}: {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  return (
    <div className="animate-fade-up mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      {/* Big squishy mascot circle */}
      <div className="relative">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed/40 via-pop-container to-secondary-fixed/50 shadow-clay-lg">
          <Icon name="pets" filled className="text-6xl text-primary" />
        </div>
        <span className="sticker-tilt absolute -top-1 -right-2 rounded-full bg-pop px-3 py-1 font-display text-xs font-bold text-on-pop shadow-clay">
          ✨
        </span>
      </div>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-on-surface">
        {t("noPets")}
      </h1>
      <p className="mt-2 max-w-[280px] font-friendly text-sm text-on-surface-variant">
        {t("noPetsDesc")}
      </p>
      <Link
        href="/create-pet"
        className="spring-active mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-display text-base font-bold text-on-primary shadow-clay hover:shadow-clay-lg transition-shadow"
      >
        <Icon name="add" className="text-xl" />
        {t("addFirst")}
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const session = await requireSession();

  const [pets, activePet, t, tPresets] = await Promise.all([
    getPetsForFamily(session.family.id),
    getActivePetForMember(session.family.id, session.member.id),
    getTranslations("home"),
    getTranslations("presets"),
  ]);

  // Empty state: no pets yet
  if (pets.length === 0) {
    return (
      <AppShell showOnboarding={true}>
        <EmptyState t={t} />
      </AppShell>
    );
  }

  // Compute milestone data from activePet
  let completedMilestones: MilestoneWithStatus[] = [];
  let nextMilestone: MilestoneWithStatus | null = null;

  if (activePet) {
    const allWithStatus: MilestoneWithStatus[] = activePet.milestones.map(
      (m: Milestone) => ({
        ...m,
        title: isTranslationKey(m.title)
          ? tPresets(m.title.replace("presets.", ""))
          : m.title,
        description: isTranslationKey(m.description)
          ? tPresets(m.description.replace("presets.", ""))
          : m.description,
        status: getMilestoneStatus(m),
      })
    );

    completedMilestones = allWithStatus.filter((m) => m.status === "completed");
    const todayMilestones = allWithStatus.filter((m) => m.status === "today");
    const upcomingMilestones = allWithStatus.filter(
      (m) => m.status === "upcoming"
    );
    nextMilestone = todayMilestones[0] || upcomingMilestones[0] || null;
  }

  return (
    <AppShell showOnboarding={false}>
      <div className="mx-auto max-w-lg pb-8">
        <PetSwitcher pets={pets} activePetId={activePet?.id ?? pets[0].id} />
        {activePet && <PetProfileHero pet={activePet} t={t} />}
        {nextMilestone && <NextMilestoneCard milestone={nextMilestone} t={t} />}
        <RecentMilestones milestones={completedMilestones} t={t} />
        <QuickActions t={t} />
      </div>
    </AppShell>
  );
}
