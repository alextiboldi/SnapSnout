"use client";

import { Icon } from "@/components/icon";
import Link from "next/link";

function PageHeader() {
  return (
    <header className="relative mb-8 md:mb-12">
      {/* Decorative blur blob */}
      <div className="absolute -top-6 -left-4 h-24 w-24 rounded-full bg-tertiary-container/20 blur-3xl" />

      <h1 className="relative z-10 font-headline text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-none tracking-tighter text-primary">
        AI Magic Studio
      </h1>

      <div className="mt-4 flex items-center gap-2 font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
        <span className="h-px w-8 bg-outline-variant/30" />
        <span>Create beautiful cards and art with your pet&apos;s photos</span>
      </div>
    </header>
  );
}

function ChristmasCard() {
  return (
    <div className="md:col-span-8">
      <Link
        href="/studio/generate"
        className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden bg-surface-container-low shadow-ambient transition-shadow hover:shadow-ambient-lg md:flex-row"
      >
        {/* Text side */}
        <div className="z-10 flex flex-col justify-between p-6 md:w-1/2 md:p-8">
          <div>
            <span className="mb-2 block font-label text-[10px] uppercase tracking-widest text-tertiary">
              Seasonals
            </span>
            <h2 className="font-headline text-3xl font-extrabold text-primary-dim md:text-4xl">
              Christmas Cards
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant md:mt-4 md:text-base">
              Transform your pet into a festive masterpiece for the holidays.
              Santa hats, snowy landscapes, and cozy vibes included.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-secondary-fixed to-secondary-container px-8 py-4 font-headline font-bold text-on-secondary-fixed shadow-[0px_4px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.4)] md:w-fit">
            <span>Start Creating</span>
            <Icon name="magic_button" className="text-xl" />
          </div>
        </div>

        {/* Image placeholder side */}
        <div className="relative min-h-[240px] md:min-h-[300px] md:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary-fixed-dim" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name="ac_unit"
              filled
              className="text-6xl text-white/40"
            />
          </div>
          {/* Gradient fade into text side */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-transparent to-transparent" />
          {/* Snowflake doodle */}
          <div className="absolute top-4 right-4 rotate-3 rounded-lg border border-outline-variant/10 bg-surface-container-lowest/80 p-2 shadow-ambient glass">
            <Icon
              name="ac_unit"
              filled
              className="text-secondary"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

function SuperheroCard() {
  return (
    <div className="md:col-span-4">
      <Link
        href="/studio/generate"
        className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden border border-tertiary/5 bg-tertiary-container/10 shadow-ambient transition-shadow hover:shadow-ambient-lg"
      >
        <div className="p-6 pb-0 md:p-8 md:pb-0">
          <span className="mb-2 block font-label text-[10px] uppercase tracking-widest text-tertiary">
            Identity
          </span>
          <h2 className="font-headline text-2xl font-extrabold text-tertiary md:text-3xl">
            Superhero
          </h2>
          <div className="mt-1 flex items-center gap-2 font-label text-[9px] text-tertiary/60">
            <span>RENDER: NEURAL_GEN_V4</span>
            <span className="h-1 w-1 rounded-full bg-tertiary/30" />
            <span>LATENCY: 400MS</span>
          </div>
        </div>

        <div className="relative flex flex-grow flex-col justify-end px-6 pb-6 md:px-8 md:pb-8">
          {/* Image placeholder with rotated card feel */}
          <div className="relative mb-6">
            <div className="h-48 w-full -rotate-2 rounded-2xl bg-gradient-to-br from-tertiary/30 to-tertiary-container/60 shadow-lg">
              <div className="flex h-full w-full items-center justify-center">
                <Icon
                  name="bolt"
                  filled
                  className="text-5xl text-tertiary/40"
                />
              </div>
            </div>
            {/* NEW THEME badge */}
            <div className="absolute -right-2 -bottom-4 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold text-on-secondary-fixed shadow-md">
              NEW THEME
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-white px-6 py-4 font-headline font-bold text-primary shadow-ambient transition-colors hover:bg-surface-container-lowest">
            <span>Start Creating</span>
            <Icon name="bolt" className="text-xl" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function BlueprintCard() {
  return (
    <div className="md:col-span-6">
      <Link
        href="/studio/generate"
        className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden bg-tertiary text-white shadow-xl"
      >
        {/* Blueprint grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10">
          <div>
            <div className="flex items-start justify-between">
              <h2 className="font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
                Retro Blueprint
              </h2>
              <Icon
                name="architecture"
                className="text-3xl opacity-50 md:text-4xl"
              />
            </div>
            <p className="mt-4 max-w-xs font-body text-sm text-tertiary-fixed md:text-base">
              Technical, architectural drawings of your pet&apos;s anatomy and
              personality traits.
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div className="flex items-center gap-2 rounded-xl bg-secondary-fixed px-8 py-4 font-headline font-bold text-on-secondary-fixed shadow-lg">
              <span>Draft Now</span>
              <Icon name="straighten" className="text-xl" />
            </div>
            <div className="hidden font-label text-[10px] uppercase leading-tight text-tertiary-fixed/40 text-right sm:block">
              ISO_7001_COMPLIANT
              <br />
              DRAFT_MODE: ENABLED
              <br />
              VECTOR_OUTLINE: TRUE
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SpaceExplorerCard() {
  return (
    <div className="md:col-span-3">
      <Link
        href="/studio/generate"
        className="spring-active irregular-border group relative flex h-full flex-col justify-between border border-outline-variant/20 bg-surface-container-highest p-6 shadow-ambient transition-shadow hover:shadow-ambient-lg md:p-8"
      >
        <div className="absolute top-0 right-0 p-4">
          <Icon name="rocket_launch" className="text-primary/30" />
        </div>

        <div>
          <h3 className="font-headline text-lg font-extrabold text-on-surface md:text-xl">
            Space Explorer
          </h3>
          <p className="mt-2 font-body text-xs text-on-surface-variant">
            Astronaut suits and cosmic backdrops for your adventurous pet.
          </p>
        </div>

        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors group-hover:bg-primary-dim">
          <Icon
            name="arrow_forward"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </Link>
    </div>
  );
}

function RenaissanceCard() {
  return (
    <div className="md:col-span-3">
      <Link
        href="/studio/generate"
        className="spring-active irregular-border group relative flex h-full flex-col justify-between overflow-hidden border border-outline-variant/10 bg-surface-container-high p-6 shadow-ambient transition-shadow hover:shadow-ambient-lg md:p-8"
      >
        {/* Decorative blur blob */}
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-secondary-fixed/20 blur-2xl" />

        <div>
          <h3 className="font-headline text-lg font-extrabold text-on-surface md:text-xl">
            Renaissance
          </h3>
          <p className="mt-2 font-body text-xs text-on-surface-variant">
            Classic oil painting portraits in gold frames.
          </p>
        </div>

        <div className="mt-6 w-full rounded-xl border border-outline-variant/20 bg-white py-3 text-center font-headline text-sm font-bold text-on-surface shadow-ambient transition-shadow hover:shadow-ambient-lg">
          Explore Art
        </div>
      </Link>
    </div>
  );
}

function CustomPromptSection() {
  return (
    <section className="mt-12 md:mt-20">
      <div className="relative overflow-hidden rounded-xl border border-outline-variant/5 bg-surface-container-low p-6 md:p-8">
        {/* Dog-ear fold in top-right */}
        <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-3xl bg-secondary-fixed shadow-sm">
          <div className="absolute top-4 right-4">
            <Icon
              name="push_pin"
              filled
              className="text-on-secondary-fixed"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <div className="flex-grow">
            <h4 className="font-headline text-xl font-bold text-primary md:text-2xl">
              Custom Magic Prompt
            </h4>
            <p className="mt-2 max-w-xl font-body text-sm text-on-surface-variant md:text-base">
              Can&apos;t find what you&apos;re looking for? Describe any
              style -- from Pixar animation to Cyberpunk -- and our AI will bring
              it to life.
            </p>

            {/* Tag pills */}
            <div className="mt-4 flex flex-wrap gap-3 font-label text-[10px] uppercase md:mt-6">
              <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">
                #watercolor
              </span>
              <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">
                #cyberpunk
              </span>
              <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">
                #pixelart
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Link
              href="/studio/generate"
              className="spring-active block w-full rounded-2xl border-b-4 border-primary-dim bg-primary-fixed-dim px-10 py-5 text-center font-headline text-base font-black uppercase tracking-tighter text-on-primary-fixed shadow-xl transition-all active:translate-y-1 active:border-b-0 md:w-auto md:text-lg"
            >
              Open Prompt Engineer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StudioPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-5 pt-6 pb-6 md:px-6 md:pt-12">
      <PageHeader />

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-8">
        <ChristmasCard />
        <SuperheroCard />
        <BlueprintCard />
        <SpaceExplorerCard />
        <RenaissanceCard />
      </div>

      <CustomPromptSection />
    </div>
  );
}
