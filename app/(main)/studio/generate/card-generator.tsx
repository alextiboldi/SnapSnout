"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import Link from "next/link";
import { uploadStudioPhoto, saveGeneratedCard } from "@/lib/actions/studio";
import { STYLE_THEMES, type StyleKey } from "@/lib/ai/prompts";

const STYLE_OPTIONS = Object.keys(STYLE_THEMES) as StyleKey[];

type GeneratedCard = {
  title: string;
  description: string;
  tags: string[];
};

type UploadedPhoto = {
  id: string;
  url: string;
  file?: File;
};

export function CardGenerator({
  petId,
  petName,
  petBreed,
  petPhotoUrl,
}: {
  petId: string;
  petName: string;
  petBreed: string | null;
  petPhotoUrl: string | null;
}) {
  const t = useTranslations("cardGenerator");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("Field Journal");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // The photo to display on the card: first uploaded photo, or pet's profile photo
  const cardPhotoUrl = photos[0]?.url ?? petPhotoUrl;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const newPhotos: UploadedPhoto[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const url = await uploadStudioPhoto(petId, formData);
        newPhotos.push({
          id: `${Date.now()}-${Math.random()}`,
          url,
          file,
        });
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch {
      setError(t("error"));
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleGenerate() {
    if (!cardPhotoUrl) {
      setError(t("noPhotos"));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCard(null);
    setSaved(false);

    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          petId,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Generation failed");
      }

      const data: GeneratedCard = await res.json();
      setGeneratedCard(data);
    } catch {
      setError(t("error"));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    if (!generatedCard || !cardPhotoUrl) return;

    startSaveTransition(async () => {
      try {
        await saveGeneratedCard(petId, {
          title: generatedCard.title,
          description: generatedCard.description,
          tags: generatedCard.tags,
          photoUrl: cardPhotoUrl,
          style: selectedStyle,
        });
        setSaved(true);
      } catch {
        setError(t("error"));
      }
    });
  }

  const theme = STYLE_THEMES[selectedStyle];

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
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Material Card */}
          <div
            className="bg-surface-container-low irregular-border p-6 md:p-8 relative overflow-hidden group shadow-ambient animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Decorative background icon */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none">
              <Icon name={theme.icon} className="text-8xl" />
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-20 h-24 bg-surface-container-highest rounded-lg flex flex-col items-center justify-center gap-1 border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer spring-active disabled:opacity-50"
                >
                  {isUploading ? (
                    <Icon
                      name="hourglass_empty"
                      className="text-on-surface-variant animate-spin"
                    />
                  ) : (
                    <Icon
                      name="add_a_photo"
                      className="text-on-surface-variant"
                    />
                  )}
                  <span className="text-[10px] font-label text-on-surface-variant">
                    {photos.length > 0 ? t("uploadMore") : t("uploadPhoto")}
                  </span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {/* Uploaded Photo Thumbnails */}
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative w-20 h-24 rounded-lg overflow-hidden shadow-sm group/photo"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Uploaded photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-tertiary/20 mix-blend-overlay" />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                    >
                      <Icon name="close" className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Status */}
              <p className="text-sm text-on-surface-variant mb-6 font-label">
                <span className="font-bold">{t("status")}:</span>{" "}
                {photos.length > 0 || petPhotoUrl ? t("ready") : t("noPhotos")}
                <br />
                <span className="font-bold">{t("photos")}:</span>{" "}
                {t("photosReady", { count: photos.length })}
              </p>

              {/* Error */}
              {error && (
                <p className="text-sm text-error mb-4 font-label">{error}</p>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!cardPhotoUrl && photos.length === 0)}
                className="w-full py-4 md:py-5 px-6 bg-secondary-fixed text-on-secondary-fixed font-headline font-black text-lg md:text-xl rounded-full shadow-[0px_8px_0px_#6d5a00] active:translate-y-1 active:shadow-[0px_4px_0px_#6d5a00] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:translate-y-0"
              >
                <Icon name="bolt" filled className="text-2xl" />
                {isGenerating
                  ? t("generating")
                  : generatedCard
                    ? t("regenerate")
                    : t("generateCard")}
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
                <span className="font-label opacity-70">
                  {t("styleInference")}
                </span>
                <select
                  value={selectedStyle}
                  onChange={(e) =>
                    setSelectedStyle(e.target.value as StyleKey)
                  }
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
                <span className="font-label opacity-70">
                  {t("imageRecognition")}
                </span>
                <span className="font-bold">{t("activeStatus")}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-secondary-fixed rounded-full transition-all duration-700 ${isGenerating ? "w-full animate-pulse" : "w-3/4"}`}
                />
              </div>

              {/* Custom Prompt */}
              <div className="mt-3">
                <label className="font-label text-[10px] tracking-[0.15em] opacity-70 uppercase block mb-1.5">
                  {t("customPromptLabel")}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t("customPromptPlaceholder")}
                  rows={2}
                  className="w-full bg-white/10 text-white text-xs font-label border-0 rounded-md px-3 py-2 placeholder:text-white/40 focus:ring-1 focus:ring-secondary-fixed resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div
          className="lg:col-span-7 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="bg-surface-container p-4 md:p-10 rounded-xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center shadow-ambient-lg">
            {/* Assembling State Overlay */}
            {isGenerating && (
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
                  {generatedCard
                    ? `${theme.label} Card`
                    : `${theme.label} Preview`}
                </span>
                <span className="font-label text-[10px]">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Card body */}
              <div className="p-5 md:p-6">
                {/* Photo or placeholder */}
                <div className="relative rounded-lg overflow-hidden aspect-square mb-5">
                  {cardPhotoUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardPhotoUrl}
                        alt={`${petName}'s studio photo`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border border-tertiary-container/30 pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                      <Icon
                        name="add_a_photo"
                        className="text-4xl text-on-surface-variant/30"
                      />
                    </div>
                  )}
                </div>

                <h4 className="font-headline text-2xl font-black text-on-surface mb-2">
                  {generatedCard?.title ?? petName}
                </h4>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-5">
                  {generatedCard ? (
                    <>&ldquo;{generatedCard.description}&rdquo;</>
                  ) : (
                    <span className="italic opacity-50">
                      {t("selectStyle")}
                    </span>
                  )}
                </p>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-2">
                  {(generatedCard?.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-container text-xs font-label rounded-full text-on-surface-variant"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {generatedCard && (
              <div className="flex gap-3 md:gap-4 mt-8 md:mt-12 w-full max-w-sm animate-fade-up">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: generatedCard.title,
                        text: generatedCard.description,
                      });
                    }
                  }}
                  className="flex-1 py-3.5 md:py-4 bg-surface-container-highest text-on-surface font-headline font-bold rounded-xl hover:bg-outline-variant/20 transition-all flex items-center justify-center gap-2 spring-active"
                >
                  <Icon name="share" className="text-xl" />
                  {t("shareBtn")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="flex-1 py-3.5 md:py-4 bg-primary text-on-primary font-headline font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 spring-active disabled:opacity-70"
                >
                  <Icon
                    name={saved ? "check" : "bookmark"}
                    filled
                    className="text-xl"
                  />
                  {saved
                    ? t("saved")
                    : isSaving
                      ? t("saving")
                      : t("saveToTimeline")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
