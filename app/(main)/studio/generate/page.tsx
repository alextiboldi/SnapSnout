"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import Link from "next/link";

const PHOTO_SLOTS = [
  {
    id: 1,
    gradient: "from-primary-container/60 to-tertiary-container/40",
    hasPhoto: true,
  },
  {
    id: 2,
    gradient: "from-tertiary-container/50 to-secondary-fixed/30",
    hasPhoto: true,
  },
];

const STYLE_OPTIONS = [
  "Field Journal",
  "Retro Blueprint",
  "Superhero",
  "Renaissance",
  "Space Explorer",
];

const TAGS = ["#GoldenLife", "#FieldNotes", "#SnapSnout"];

export default function CardGeneratorPage() {
  const t = useTranslations("cardGenerator");
  const [isAssembling, setIsAssembling] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState("Field Journal");
  const [photoCount] = useState(2);

  function handleGenerate() {
    setIsAssembling(true);
    setTimeout(() => setIsAssembling(false), 3000);
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-6 py-6 md:py-8">
      {/* Page Header */}
      <div className="mb-8 md:mb-12 animate-fade-up">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-sm font-label text-primary font-bold uppercase tracking-widest mb-3 hover:text-primary-dim transition-colors spring-active"
        >
          <Icon name="arrow_back" className="text-lg" />
          <span>{t("backToStudio")}</span>
        </Link>
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-primary-fixed-variant leading-none">
          {t("title")}
        </h1>
        <p className="text-on-surface-variant mt-3 text-base md:text-lg max-w-md">
          {t("subtitle")}
        </p>
      </div>

      {/* Two Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ── Left Column: Upload & Controls ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Material Card */}
          <div
            className="bg-surface-container-low irregular-border p-6 md:p-8 relative overflow-hidden group shadow-ambient animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Decorative background icon */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none">
              <Icon name="architecture" className="text-8xl" />
            </div>

            <div className="relative z-10">
              <h3 className="font-headline text-xl font-bold mb-1">
                {t("sourceMaterial")}
              </h3>
              <p className="text-sm text-on-surface-variant mb-5 font-label">
                {t("yourPhotos")}
              </p>

              {/* Photo Slots Row */}
              <div className="flex flex-wrap gap-3 mb-5">
                {/* Add Photo Button */}
                <button className="w-20 h-24 bg-surface-container-highest rounded-lg flex items-center justify-center border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer spring-active">
                  <Icon
                    name="add_a_photo"
                    className="text-on-surface-variant"
                  />
                </button>

                {/* Photo Thumbnails */}
                {PHOTO_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    className="relative w-20 h-24 rounded-lg overflow-hidden shadow-sm"
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${slot.gradient}`}
                    />
                    <div className="absolute inset-0 bg-tertiary/30 mix-blend-overlay" />
                  </div>
                ))}
              </div>

              {/* Status */}
              <p className="text-sm text-on-surface-variant mb-6 font-label">
                <span className="font-bold">{t("status")}:</span> {t("ready")}
                <br />
                <span className="font-bold">{t("photos")}:</span> {t("photosReady", { count: photoCount })}
              </p>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-4 md:py-5 px-6 bg-secondary-fixed text-on-secondary-fixed font-headline font-black text-lg md:text-xl rounded-full shadow-[0px_8px_0px_#6d5a00] active:translate-y-1 active:shadow-[0px_4px_0px_#6d5a00] transition-all flex items-center justify-center gap-3"
              >
                <Icon name="bolt" filled className="text-2xl" />
                {t("generateCard")}
              </button>
            </div>
          </div>

          {/* Style Settings Card */}
          <div
            className="bg-tertiary text-on-tertiary p-5 md:p-6 rounded-xl blueprint-grid relative overflow-hidden shadow-ambient animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-label text-[10px] tracking-[0.2em] opacity-80 uppercase">
                {t("styleSettings")}
              </span>
              <Icon name="settings_ethernet" className="text-sm opacity-80" />
            </div>

            <div className="space-y-3">
              {/* Style Selector */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-label opacity-70">{t("styleInference")}</span>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="bg-white/10 text-white text-xs font-bold font-label border-0 rounded-md px-2 py-1 cursor-pointer focus:ring-1 focus:ring-secondary-fixed appearance-none"
                  style={{ backgroundImage: "none" }}
                >
                  {STYLE_OPTIONS.map((style) => (
                    <option
                      key={style}
                      value={style}
                      className="text-on-surface bg-surface"
                    >
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recognition Status */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-label opacity-70">{t("imageRecognition")}</span>
                <span className="font-bold">{t("activeStatus")}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-secondary-fixed rounded-full transition-all duration-700" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Preview ── */}
        <div
          className="lg:col-span-7 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="bg-surface-container p-4 md:p-10 rounded-xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center shadow-ambient-lg">
            {/* Assembling State Overlay */}
            {isAssembling && (
              <div className="absolute inset-0 bg-surface-container/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div
                  className="relative w-56 h-56 md:w-64 md:h-64"
                  style={{
                    transform: "skewY(-5deg) rotateX(15deg)",
                  }}
                >
                  {/* Blueprint grid background */}
                  <div className="absolute inset-0 blueprint-grid border-2 border-tertiary/30 rounded-lg" />

                  {/* Centered pets icon with bracket decorations */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <Icon
                        name="pets"
                        className="text-8xl text-tertiary/20"
                      />
                      {/* Corner brackets */}
                      <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-tertiary" />
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-tertiary" />
                    </div>
                  </div>

                  {/* Scanning line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-tertiary/50 shadow-[0_0_10px_#286999] animate-pulse-soft" />
                </div>

                <p className="font-label text-tertiary mt-8 tracking-[0.3em] font-bold text-sm">
                  {t("creatingCard")}
                </p>
              </div>
            )}

            {/* Result Card */}
            <div className="w-full max-w-sm bg-surface-container-lowest rounded-lg shadow-xl overflow-hidden relative rotate-1">
              {/* Dog-ear fold */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-secondary-fixed rounded-bl-3xl shadow-md z-10" />

              {/* Header bar */}
              <div className="p-4 bg-tertiary text-white flex justify-between items-center">
                <span className="font-label text-[10px] tracking-widest uppercase">
                  Field Log #8821
                </span>
                <span className="font-label text-[10px]">02.04.2026</span>
              </div>

              {/* Card body */}
              <div className="p-5 md:p-6">
                {/* Image placeholder */}
                <div className="relative rounded-lg overflow-hidden aspect-square mb-5">
                  <div className="w-full h-full bg-gradient-to-br from-primary-container/50 via-tertiary-container/40 to-secondary-fixed/30" />
                  {/* Technical overlay */}
                  <div className="absolute inset-0 border border-tertiary-container/30 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 bg-tertiary/80 text-white font-label text-[8px] px-2 py-1 rounded">
                    COORD: 45.523 N, 122.676 W
                  </div>
                </div>

                <h4 className="font-headline text-2xl font-black text-on-surface mb-2">
                  {t("urbanExplorer")}
                </h4>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-5">
                  &ldquo;{t("urbanExplorerDesc")}&rdquo;
                </p>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-container text-xs font-label rounded-full text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 md:gap-4 mt-8 md:mt-12 w-full max-w-sm">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Check out my pet's card!", text: "Made with SnapSnout" });
                  } else {
                    alert("Card link copied to clipboard!");
                  }
                }}
                className="flex-1 py-3.5 md:py-4 bg-surface-container-highest text-on-surface font-headline font-bold rounded-xl hover:bg-outline-variant/20 transition-all flex items-center justify-center gap-2 spring-active"
              >
                <Icon name="share" className="text-xl" />
                {t("shareBtn")}
              </button>
              <Link
                href="/milestones"
                className="flex-1 py-3.5 md:py-4 bg-primary text-on-primary font-headline font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 spring-active"
              >
                <Icon name="bookmark" filled className="text-xl" />
                {t("saveToTimeline")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
