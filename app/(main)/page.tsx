import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPetsForFamily, getActivePetForMember } from "@/lib/queries/pets";
import { requireSession } from "@/lib/auth/session";
import { getAge, daysUntil, formatDate, getMilestoneStatus, isTranslationKey } from "@/lib/utils";
import type { Pet, Milestone } from "@/lib/generated/prisma/client";
import type { MilestoneStatus } from "@/lib/utils";
import { PetSwitcher } from "./pet-switcher";
import { Icon } from "@/components/icon";
import { AppShell } from "@/components/home/app-shell";

type MilestoneWithStatus = Milestone & { status: MilestoneStatus };

function PetProfileHero({ pet, t }: { pet: Pet; t: (key: string, values?: Record<string, string | number | Date>) => string }) {
  const age = pet.dateOfBirth ? getAge(pet.dateOfBirth) : null;
  const monthsHome = Math.abs(
    Math.round(
      (new Date().getTime() - new Date(pet.gotchaDay).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    )
  );

  return (
    <div className="flex flex-col items-center px-5 pt-2 pb-4">
      <div className="relative h-[120px] w-[120px] md:h-[160px] md:w-[160px]">
        <div className="irregular-border h-full w-full rounded-full bg-gradient-to-br from-primary/20 via-secondary-fixed/30 to-tertiary/20 shadow-ambient-lg overflow-hidden">
          {pet.photoUrl ? (
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
                className="text-5xl text-primary/70 md:text-6xl"
              />
            </div>
          )}
        </div>
      </div>

      <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
        {pet.name}
      </h1>

      {age && (
        <p className="mt-1 font-label text-sm tracking-wide text-on-surface-variant md:text-base">
          {t("old", { age })}
        </p>
      )}

      <p className="mt-0.5 font-body text-xs text-on-surface-variant/70 md:text-sm">
        {t("homeFor", { months: monthsHome })}
        {pet.breed && (
          <>
            {" "}
            &middot; {pet.breed}
          </>
        )}
      </p>
    </div>
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
        className={`spring-active irregular-border-sm relative block w-full overflow-hidden rounded-2xl p-5 text-left transition-shadow hover:shadow-ambient-lg ${
          isToday
            ? "bg-secondary-fixed shadow-ambient-lg"
            : "bg-surface-container-low shadow-ambient"
        }`}
      >
        {isToday && (
          <span className="absolute top-3 right-4 rounded-full bg-on-secondary-fixed/90 px-2.5 py-0.5 font-label text-[11px] font-bold tracking-wider text-secondary-fixed">
            TODAY!
          </span>
        )}

        <div className="flex items-start gap-4">
          <span className="text-4xl leading-none" role="img" aria-hidden="true">
            {milestone.emoji}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={`font-label text-[11px] font-medium tracking-wider uppercase ${
                isToday ? "text-on-secondary-fixed/60" : "text-primary"
              }`}
            >
              {isToday ? t("happeningNow") : t("upNext")}
            </p>

            <h2
              className={`mt-0.5 font-headline text-lg font-bold tracking-tight ${
                isToday ? "text-on-secondary-fixed" : "text-on-surface"
              }`}
            >
              {milestone.title}
            </h2>

            <p
              className={`mt-1 font-body text-sm leading-snug ${
                isToday
                  ? "text-on-secondary-fixed/70"
                  : "text-on-surface-variant"
              }`}
            >
              {milestone.description}
            </p>

            {!isToday && days > 0 && (
              <p className="mt-2 font-label text-xs font-medium text-tertiary">
                {t("inDays", { days })}
              </p>
            )}
          </div>
        </div>

        <div className="absolute right-4 bottom-5">
          <Icon
            name="chevron_right"
            className={`text-xl ${
              isToday ? "text-on-secondary-fixed/40" : "text-outline-variant"
            }`}
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
  const recent = milestones.slice(-3).reverse();
  if (recent.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="px-5 font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("recentMemories")}
      </h3>

      <div className="mt-2.5 flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
        {recent.map((milestone) => (
          <Link
            key={milestone.id}
            href="/milestones"
            className="spring-active irregular-border-sm flex w-[150px] shrink-0 flex-col rounded-xl bg-surface-container-low p-3 shadow-ambient transition-shadow hover:shadow-ambient-lg"
          >
            {milestone.photoUrl ? (
              <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-tertiary/10">
                <Icon
                  name="photo"
                  filled
                  className="text-2xl text-primary/40"
                />
              </div>
            ) : (
              <span className="mb-2 text-2xl leading-none" role="img" aria-hidden="true">
                {milestone.emoji}
              </span>
            )}

            <p className="font-headline text-sm font-semibold leading-tight text-on-surface">
              {milestone.title}
            </p>

            <p className="mt-1 font-body text-[11px] text-on-surface-variant/60">
              {milestone.completedDate ? formatDate(milestone.completedDate) : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ t }: { t: (key: string, values?: Record<string, string | number | Date>) => string }) {
  const actions = [
    {
      label: t("addPhoto"),
      icon: "photo_camera",
      description: t("snapMemory"),
      href: "/milestones",
    },
    {
      label: t("newMilestone"),
      icon: "flag",
      description: t("markMoment"),
      href: "/milestones",
    },
    {
      label: t("createCard"),
      icon: "auto_awesome",
      description: t("aiMagic"),
      href: "/studio/generate",
    },
    {
      label: t("share"),
      icon: "share",
      description: t("showWorld"),
      href: "/studio",
    },
  ];

  return (
    <div className="mt-6 px-5">
      <h3 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("quickActions")}
      </h3>

      <div className="mt-2.5 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="spring-active irregular-border-sm flex flex-col items-center gap-2 rounded-2xl bg-surface-container-low p-4 shadow-ambient transition-shadow hover:shadow-ambient-lg md:flex-row md:items-center md:gap-3 md:px-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon
                name={action.icon}
                filled
                className="text-2xl text-primary"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="font-headline text-sm font-semibold text-on-surface">
                {action.label}
              </p>
              <p className="hidden font-body text-xs text-on-surface-variant/60 md:block">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
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
        <div className="animate-fade-up mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
          <Icon name="pets" filled className="text-6xl text-primary/40" />
          <h1 className="mt-4 font-headline text-2xl font-bold text-on-surface">
            {t("noPets")}
          </h1>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            {t("noPetsDesc")}
          </p>
          <Link
            href="/create-pet"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-sm font-medium text-on-primary shadow-ambient transition-shadow hover:shadow-ambient-lg"
          >
            <Icon name="add" className="text-lg" />
            {t("addFirst")}
          </Link>
        </div>
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
        title: isTranslationKey(m.title) ? tPresets(m.title.replace("presets.", "")) : m.title,
        description: isTranslationKey(m.description) ? tPresets(m.description.replace("presets.", "")) : m.description,
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
      <div className="animate-fade-up mx-auto max-w-lg pb-6">
        <PetSwitcher pets={pets} activePetId={activePet?.id ?? pets[0].id} />
        {activePet && <PetProfileHero pet={activePet} t={t} />}
        {nextMilestone && <NextMilestoneCard milestone={nextMilestone} t={t} />}
        <RecentMilestones milestones={completedMilestones} t={t} />
        <QuickActions t={t} />
      </div>
    </AppShell>
  );
}
