"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import Link from "next/link";

export default function StudioPage() {
  const t = useTranslations("studio");

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-5 pt-6 pb-6 md:px-6 md:pt-12">
      {/* Page Header */}
      <header className="relative mb-8 md:mb-12">
        <div className="absolute -top-6 -left-4 h-24 w-24 rounded-full bg-tertiary-container/20 blur-3xl" />
        <h1 className="relative z-10 font-headline text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-none tracking-tighter text-primary">
          {t("title")}
        </h1>
        <div className="mt-4 flex items-center gap-2 font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          <span className="h-px w-8 bg-outline-variant/30" />
          <span>{t("subtitle")}</span>
        </div>
      </header>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-8">
        {/* Christmas Cards */}
        <div className="md:col-span-8">
          <Link
            href="/studio/generate"
            className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden bg-surface-container-low shadow-ambient transition-shadow hover:shadow-ambient-lg md:flex-row"
          >
            <div className="z-10 flex flex-col justify-between p-6 md:w-1/2 md:p-8">
              <div>
                <span className="mb-2 block font-label text-[10px] uppercase tracking-widest text-tertiary">
                  {t("seasonals")}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary-dim md:text-4xl">
                  {t("christmas")}
                </h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant md:mt-4 md:text-base">
                  {t("christmasDesc")}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-secondary-fixed to-secondary-container px-8 py-4 font-headline font-bold text-on-secondary-fixed shadow-[0px_4px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.4)] md:w-fit">
                <span>{t("startCreating")}</span>
                <Icon name="magic_button" className="text-xl" />
              </div>
            </div>
            <div className="relative min-h-[240px] md:min-h-[300px] md:w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/studio-christmas.jpg"
                alt="French bulldog in festive Christmas scene"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-transparent to-transparent" />
              <div className="absolute top-4 right-4 rotate-3 rounded-lg border border-outline-variant/10 bg-surface-container-lowest/80 p-2 shadow-ambient glass">
                <Icon name="ac_unit" filled className="text-secondary" />
              </div>
            </div>
          </Link>
        </div>

        {/* Superhero */}
        <div className="md:col-span-4">
          <Link
            href="/studio/generate"
            className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden border border-tertiary/5 bg-tertiary-container/10 shadow-ambient transition-shadow hover:shadow-ambient-lg"
          >
            <div className="p-6 pb-0 md:p-8 md:pb-0">
              <span className="mb-2 block font-label text-[10px] uppercase tracking-widest text-tertiary">
                {t("identity")}
              </span>
              <h2 className="font-headline text-2xl font-extrabold text-tertiary md:text-3xl">
                {t("superhero")}
              </h2>
            </div>
            <div className="relative flex flex-grow flex-col justify-end px-6 pb-6 md:px-8 md:pb-8">
              <div className="relative mb-6">
                <div className="h-48 w-full -rotate-2 overflow-hidden rounded-2xl shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/studio-superhero.jpg"
                    alt="Cat in superhero armor with glowing cape"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -right-2 -bottom-4 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold text-on-secondary-fixed shadow-md">
                  {t("newTheme")}
                </div>
              </div>
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-white px-6 py-4 font-headline font-bold text-primary shadow-ambient transition-colors hover:bg-surface-container-lowest">
                <span>{t("startCreating")}</span>
                <Icon name="bolt" className="text-xl" />
              </div>
            </div>
          </Link>
        </div>

        {/* Blueprint */}
        <div className="md:col-span-6">
          <Link
            href="/studio/generate"
            className="spring-active irregular-border group relative flex h-full flex-col overflow-hidden bg-tertiary text-white shadow-xl"
          >
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
                    {t("retroBlueprint")}
                  </h2>
                  <Icon name="architecture" className="text-3xl opacity-50 md:text-4xl" />
                </div>
                <p className="mt-4 max-w-xs font-body text-sm text-tertiary-fixed md:text-base">
                  {t("retroBlueprintDesc")}
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div className="flex items-center gap-2 rounded-xl bg-secondary-fixed px-8 py-4 font-headline font-bold text-on-secondary-fixed shadow-lg">
                  <span>{t("draftNow")}</span>
                  <Icon name="straighten" className="text-xl" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Space Explorer */}
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
                {t("spaceExplorer")}
              </h3>
              <p className="mt-2 font-body text-xs text-on-surface-variant">
                {t("spaceExplorerDesc")}
              </p>
            </div>
            <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors group-hover:bg-primary-dim">
              <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        {/* Renaissance */}
        <div className="md:col-span-3">
          <Link
            href="/studio/generate"
            className="spring-active irregular-border group relative flex h-full flex-col justify-between overflow-hidden border border-outline-variant/10 bg-surface-container-high p-6 shadow-ambient transition-shadow hover:shadow-ambient-lg md:p-8"
          >
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-secondary-fixed/20 blur-2xl" />
            <div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface md:text-xl">
                {t("renaissance")}
              </h3>
              <p className="mt-2 font-body text-xs text-on-surface-variant">
                {t("renaissanceDesc")}
              </p>
            </div>
            <div className="mt-6 w-full rounded-xl border border-outline-variant/20 bg-white py-3 text-center font-headline text-sm font-bold text-on-surface shadow-ambient transition-shadow hover:shadow-ambient-lg">
              {t("exploreArt")}
            </div>
          </Link>
        </div>
      </div>

      {/* Custom Prompt Section */}
      <section className="mt-12 md:mt-20">
        <div className="relative overflow-hidden rounded-xl border border-outline-variant/5 bg-surface-container-low p-6 md:p-8">
          <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-3xl bg-secondary-fixed shadow-sm">
            <div className="absolute top-4 right-4">
              <Icon name="push_pin" filled className="text-on-secondary-fixed" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
            <div className="hidden md:block shrink-0 -rotate-2">
              <div className="bg-surface-container-lowest p-1.5 shadow-ambient">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/studio-owner.jpg"
                  alt="Pet owner in sunlit garden"
                  className="h-24 w-24 object-cover"
                />
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-headline text-xl font-bold text-primary md:text-2xl">
                {t("customPrompt")}
              </h4>
              <p className="mt-2 max-w-xl font-body text-sm text-on-surface-variant md:text-base">
                {t("customPromptDesc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 font-label text-[10px] uppercase md:mt-6">
                <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">#watercolor</span>
                <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">#cyberpunk</span>
                <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">#pixelart</span>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Link
                href="/studio/generate"
                className="spring-active block w-full rounded-2xl border-b-4 border-primary-dim bg-primary-fixed-dim px-10 py-5 text-center font-headline text-base font-black uppercase tracking-tighter text-on-primary-fixed shadow-xl transition-all active:translate-y-1 active:border-b-0 md:w-auto md:text-lg"
              >
                {t("openPrompt")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
