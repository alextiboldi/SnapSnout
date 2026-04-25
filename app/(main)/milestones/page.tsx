import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icon";
import { requireSession } from "@/lib/auth/session";
import { getActivePetForMember, getPetsForFamily } from "@/lib/queries/pets";
import { PetSwitcher } from "@/app/(main)/pet-switcher";
import { MilestonesList } from "./milestones-list";
import { MilestoneOpener } from "./milestone-opener";
import { TagFilter } from "./tag-filter";
import {
  formatDate,
  getMilestoneStatus,
  isTranslationKey,
} from "@/lib/utils";
import type { Milestone } from "@/lib/generated/prisma/client";
import type { MilestoneStatus } from "@/lib/utils";

type MilestoneWithStatus = Milestone & { status: MilestoneStatus };

function FeaturedMilestone({
  completedMilestones,
  allMilestones,
  petName,
  t,
}: {
  completedMilestones: MilestoneWithStatus[];
  allMilestones: MilestoneWithStatus[];
  petName: string;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  const featured =
    completedMilestones[completedMilestones.length - 1] ?? allMilestones[0];

  if (!featured) return null;

  return (
    <div className="col-span-1 md:col-span-8 group animate-fade-up">
      <MilestoneOpener
        milestone={{
          id: featured.id,
          emoji: featured.emoji,
          title: featured.title,
          description: featured.description,
          notes: featured.notes,
          photoUrl: featured.photoUrl,
          completedDate: featured.completedDate,
          targetDate: featured.targetDate,
        }}
        petName={petName}
        className="relative block w-full text-left overflow-hidden irregular-border shadow-ambient-lg bg-surface-container-lowest h-full min-h-[340px] md:min-h-[400px] spring-active cursor-pointer transition-transform duration-300 hover:-translate-y-1"
      >
        {/* Hero photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/milestone-bath.jpg"
          alt="Featured milestone moment"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Rotated badge */}
        <div className="absolute top-6 -left-8 z-10">
          <div className="bg-secondary-fixed text-on-secondary-fixed font-label text-xs font-bold tracking-widest uppercase px-10 py-1.5 -rotate-45 shadow-ambient">
            {t("majorMilestone")}
          </div>
        </div>

        {/* Share affordance */}
        <div className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white shadow-ambient group-hover:bg-white/30 transition-colors">
          <Icon name="share" className="text-lg" />
        </div>

        {/* Emoji floating */}
        <div className="absolute top-20 right-6 text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
          {featured.emoji}
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <p className="font-label text-xs tracking-wider text-white/70 uppercase mb-1">
            {featured.completedDate
              ? formatDate(featured.completedDate)
              : featured.targetDate
                ? formatDate(featured.targetDate)
                : ""}
          </p>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">
            {featured.title}
          </h2>
          <p className="font-body text-sm md:text-base text-white/85 leading-relaxed max-w-lg mb-4">
            {featured.description}
          </p>

          {/* Tags */}
          {featured.tags && featured.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="font-label text-[11px] tracking-wider bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </MilestoneOpener>
    </div>
  );
}

function PhotoCollageCard() {
  const tiles = [
    { src: "/assets/milestone-park.jpg", alt: "Two dogs running in a sunlit park", corner: "rounded-tl-[18px]" },
    { src: "/assets/milestone-pet.jpg", alt: "Golden retriever puppy", corner: "" },
    { src: "/assets/milestone-nap.jpg", alt: "Small dog napping on a blanket", corner: "rounded-bl-[18px]" },
  ];

  return (
    <Link
      href="/milestones/gallery"
      className="col-span-1 md:col-span-8 animate-fade-up spring-active block"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="irregular-border-sm overflow-hidden shadow-ambient h-full">
        <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-full min-h-[240px] md:min-h-[280px]">
          {tiles.map((tile) => (
            <div key={tile.src} className={`relative overflow-hidden ${tile.corner}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.src} alt={tile.alt} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-tertiary/10 mix-blend-multiply" />
            </div>
          ))}

          {/* Special accent cell */}
          <div className="relative bg-secondary-fixed flex flex-col items-center justify-center rounded-br-[18px] p-4">
            <Icon
              name="photo_library"
              filled
              className="text-on-secondary-fixed text-2xl mb-1"
            />
            <p className="font-headline text-sm font-bold text-on-secondary-fixed text-center">
              Weekend Vibes
            </p>
            <p className="font-label text-[11px] text-on-secondary-fixed-variant">
              View gallery
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LocationCard() {
  return (
    <div
      className="col-span-1 md:col-span-4 animate-fade-up"
      style={{ animationDelay: "0.25s" }}
    >
      <div className="relative overflow-hidden irregular-border-sm shadow-ambient bg-surface-container-lowest h-full spring-active cursor-pointer hover:-translate-y-0.5 transition-transform duration-300">
        <div className="p-5 md:p-6 flex flex-col justify-between h-full">
          <div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
              <Icon
                name="location_on"
                filled
                className="text-primary text-xl"
              />
            </div>
            <h3 className="font-headline text-base font-bold text-on-surface mb-1">
              Brooklyn, NY
            </h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Prospect Park area
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-outline-variant/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/milestone-owner.jpg"
              alt="Owner"
              className="h-6 w-6 rounded-full object-cover"
            />
            <p className="font-label text-[10px] text-outline tracking-wider">
              40.6602 N, 73.9690 W
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: activeTag } = await searchParams;
  const session = await requireSession();

  const [activePet, pets, t, tHome, tPresets] = await Promise.all([
    getActivePetForMember(session.family.id, session.member.id),
    getPetsForFamily(session.family.id),
    getTranslations("milestones"),
    getTranslations("home"),
    getTranslations("presets"),
  ]);

  // Empty state: no active pet
  if (!activePet) {
    return (
      <div className="animate-fade-up mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
        <Icon name="flag" filled className="text-6xl text-primary/40" />
        <h1 className="mt-4 font-headline text-2xl font-bold text-on-surface">
          {t("noActivePet")}
        </h1>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          {t("noActivePetDesc")}
        </p>
        <Link
          href="/create-pet"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-sm font-medium text-on-primary shadow-ambient transition-shadow hover:shadow-ambient-lg"
        >
          <Icon name="add" className="text-lg" />
          {tHome("addFirst")}
        </Link>
      </div>
    );
  }

  // Compute milestone statuses and resolve translation keys
  const allMilestones: MilestoneWithStatus[] = activePet.milestones.map(
    (m: Milestone) => ({
      ...m,
      title: isTranslationKey(m.title) ? tPresets(m.title.replace("presets.", "")) : m.title,
      description: isTranslationKey(m.description) ? tPresets(m.description.replace("presets.", "")) : m.description,
      status: getMilestoneStatus(m),
    })
  );

  const allTags = [...new Set(allMilestones.flatMap((m) => m.tags))].sort();

  const filtered = activeTag
    ? allMilestones.filter((m) => m.tags.includes(activeTag))
    : allMilestones;

  const completedMilestones = filtered.filter(
    (m) => m.status === "completed"
  );
  const todayMilestones = filtered.filter((m) => m.status === "today");
  const upcomingMilestones = filtered.filter(
    (m) => m.status === "upcoming"
  );

  return (
    <div className="px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase">
            {activePet.isDeceased
              ? t("lifeStory", { name: activePet.name })
              : t("journey", { name: activePet.name })}
          </p>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mt-1">
            {t("title")}
          </h1>
        </div>

        <PetSwitcher pets={pets} activePetId={activePet.id} />
      </div>

      {/* Summary bar */}
      <div
        className="flex items-center gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: "0.03s" }}
      >
        <div className="flex items-center gap-1.5">
          <Icon
            name="check_circle"
            filled
            className="text-primary text-base"
          />
          <span className="font-label text-sm text-on-surface-variant">
            {t("completed", { count: completedMilestones.length })}
          </span>
        </div>
        {!activePet.isDeceased && (
          <>
            <div className="w-px h-4 bg-outline-variant/40" />
            <div className="flex items-center gap-1.5">
              <Icon name="today" className="text-secondary text-base" />
              <span className="font-label text-sm text-on-surface-variant">
                {t("today", { count: todayMilestones.length })}
              </span>
            </div>
            <div className="w-px h-4 bg-outline-variant/40" />
            <div className="flex items-center gap-1.5">
              <Icon name="upcoming" className="text-tertiary text-base" />
              <span className="font-label text-sm text-on-surface-variant">
                {t("upcoming", { count: upcomingMilestones.length })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div
          className="mb-4 animate-fade-up"
          style={{ animationDelay: "0.06s" }}
        >
          <Suspense>
            <TagFilter tags={allTags} />
          </Suspense>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        <FeaturedMilestone
          completedMilestones={completedMilestones}
          allMilestones={allMilestones}
          petName={activePet.name}
          t={t}
        />
        <PhotoCollageCard />
        <LocationCard />
      </div>

      {/* Upcoming milestones list */}
      {!activePet.isDeceased && upcomingMilestones.length > 0 && (
        <div className="mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">
            {t("comingUp")}
          </h2>
          <MilestonesList
            milestones={upcomingMilestones.map((m) => ({
              id: m.id,
              emoji: m.emoji,
              title: m.title,
              description: m.description,
              notes: m.notes,
              photoUrl: m.photoUrl,
              completedDate: m.completedDate,
              targetDate: m.targetDate,
            }))}
            petName={activePet.name}
          />
        </div>
      )}

      {/* Floating Action Button */}
      {!activePet.isDeceased && (
        <Link
          href="/studio/generate"
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full btn-sculpted text-on-primary flex items-center justify-center shadow-ambient-lg spring-active hover:scale-105 transition-transform duration-300"
          aria-label={t("createCard")}
        >
          <Icon name="auto_awesome" filled className="text-2xl" />
        </Link>
      )}
    </div>
  );
}
