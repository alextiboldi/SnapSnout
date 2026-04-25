"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@/components/icon";
import { DatePicker } from "@/components/date-picker";
import { uploadPhotoClient } from "@/lib/upload-client";
import { getBreedsFor } from "@/lib/breeds";
import type { Locale } from "@/i18n/config";

type Species = "dog" | "cat" | "horse" | "other" | null;
type Lifestage = "puppy" | "kitten" | "adult" | "senior" | "memorial";

function getLifestageOptions(
  species: Species,
  t: (key: string) => string
): { id: Lifestage; label: string }[] {
  const memorial = { id: "memorial" as const, label: t("inLovingMemory") };
  switch (species) {
    case "dog":
      return [
        { id: "puppy", label: t("puppy") },
        { id: "adult", label: t("adult") },
        { id: "senior", label: t("senior") },
        memorial,
      ];
    case "cat":
      return [
        { id: "kitten", label: t("kitten") },
        { id: "adult", label: t("adult") },
        { id: "senior", label: t("senior") },
        memorial,
      ];
    case "horse":
    case "other":
      return [
        { id: "adult", label: t("adult") },
        memorial,
      ];
    default:
      return [];
  }
}

function getDefaultLifestage(species: Species): Lifestage {
  switch (species) {
    case "dog":
      return "puppy";
    case "cat":
      return "kitten";
    default:
      return "adult";
  }
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export interface PetFormData {
  id?: string;
  name: string;
  species: Species;
  lifestage: Lifestage;
  breed: string;
  dateOfBirth: Date | null;
  gotchaDay: Date;
  photoUrl: string | null;
  isDeceased: boolean;
  deceasedDate: Date | null;
}

interface PetFormProps {
  initialData?: PetFormData;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
}

export function PetForm({
  initialData,
  onSubmit,
  submitLabel,
  submittingLabel,
}: PetFormProps) {
  const t = useTranslations("petForm");
  const locale = useLocale() as Locale;
  const [petName, setPetName] = useState(initialData?.name ?? "");
  const [species, setSpecies] = useState<Species>(
    initialData?.species ?? null
  );
  const [lifestage, setLifestage] = useState<Lifestage>(
    initialData?.isDeceased ? "memorial" : initialData?.lifestage ?? "puppy"
  );
  const [breed, setBreed] = useState(initialData?.breed ?? "");
  const [birthDate, setBirthDate] = useState(
    formatDateForInput(initialData?.dateOfBirth)
  );
  const [gotchaDate, setGotchaDate] = useState(
    formatDateForInput(initialData?.gotchaDay)
  );
  const [deceasedDate, setDeceasedDate] = useState(
    formatDateForInput(initialData?.deceasedDate)
  );
  const isDeceased = lifestage === "memorial";
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.photoUrl ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    if (!initialData) {
      setLifestage(getDefaultLifestage(newSpecies));
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!species) {
      setError(t("speciesRequired"));
      return;
    }

    // Date validation — use midnight-UTC comparisons and ignore empty values.
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    hundredYearsAgo.setHours(0, 0, 0, 0);

    const birth = birthDate ? new Date(birthDate) : null;
    const gotcha = gotchaDate ? new Date(gotchaDate) : null;
    const deceased = isDeceased && deceasedDate ? new Date(deceasedDate) : null;

    if (birth && birth > today) {
      setError(t("dateBirthFuture"));
      return;
    }
    if (birth && birth < hundredYearsAgo) {
      setError(t("dateBirthTooOld"));
      return;
    }
    if (gotcha && gotcha > today) {
      setError(t("dateGotchaFuture"));
      return;
    }
    if (birth && gotcha && gotcha < birth) {
      setError(t("dateGotchaBeforeBirth"));
      return;
    }
    if (isDeceased && !deceasedDate) {
      setError(t("dateDeceasedRequired"));
      return;
    }
    if (deceased && deceased > today) {
      setError(t("dateDeceasedFuture"));
      return;
    }
    if (deceased && birth && deceased < birth) {
      setError(t("dateDeceasedBeforeBirth"));
      return;
    }
    if (deceased && gotcha && deceased < gotcha) {
      setError(t("dateDeceasedBeforeGotcha"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let photoUrl: string | null = initialData?.photoUrl ?? null;
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      try {
        photoUrl = await uploadPhotoClient(file, `uploads/${Date.now()}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("photoUploadFailed"));
        setIsSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.set("name", petName.trim());
    formData.set("species", species);
    formData.set("lifestage", lifestage);
    formData.set("breed", breed);
    formData.set("birthDate", birthDate);
    formData.set("gotchaDate", gotchaDate);
    formData.set("isDeceased", String(isDeceased));
    formData.set("deceasedDate", isDeceased ? deceasedDate : "");
    if (photoUrl) {
      formData.set("photoUrl", photoUrl);
    }

    try {
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Form submit error:", err);
      setError(err instanceof Error ? err.message : t("error"));
      setIsSubmitting(false);
    }
  };

  const speciesOptions: { id: Species; label: string; icon: string }[] = [
    { id: "dog", label: t("dog"), icon: "sound_detection_dog_barking" },
    { id: "cat", label: t("cat"), icon: "pets" },
    { id: "horse", label: t("horse"), icon: "kebab_dining" },
    { id: "other", label: t("other"), icon: "emoji_nature" },
  ];

  const lifestageOptions = getLifestageOptions(species, t);
  const breedSuggestions = getBreedsFor(species, locale);

  return (
    <form className="space-y-8 md:space-y-12" onSubmit={handleSubmit}>
      {/* Avatar Section */}
      <section
        className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8 bg-surface-container-low p-6 md:p-8 irregular-border animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-dashed border-outline-variant group-hover:border-primary transition-all cursor-pointer relative"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Pet avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon
                name="add_a_photo"
                className="text-outline-variant text-4xl md:text-5xl group-hover:text-primary transition-colors"
              />
            )}
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon name="photo_camera" className="text-white text-3xl" />
            </div>
          </button>
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="font-headline font-[800] text-lg md:text-xl text-primary">
            {t("petPhoto")}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {t("petPhotoDesc")}
          </p>
        </div>
        {!avatarPreview && (
          <div className="hidden md:block shrink-0 -rotate-3">
            <div className="bg-surface-container-lowest p-1.5 shadow-ambient rotate-[2deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/createpet-puppy.jpg"
                alt="Example pet portrait"
                className="h-24 w-24 object-cover opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
              />
              <p className="mt-1 text-center font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                Example
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Main Form */}
      <div
        className="space-y-6 animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Name */}
        <div className="group">
          <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-2 ml-3 md:ml-4">
            {t("petName")}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("petNamePlaceholder")}
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border border-outline/20 focus:border-primary text-lg md:text-xl font-body p-4 md:p-6 transition-all group-hover:shadow-ambient input-glow"
            />
            <Icon
              name="edit_note"
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-outline-variant"
            />
          </div>
        </div>

        {/* Species */}
        <div>
          <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-3 ml-3 md:ml-4">
            {t("whatKind")}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {speciesOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSpeciesChange(opt.id)}
                className={`flex flex-col items-center gap-2 p-4 md:p-5 irregular-border-sm transition-all spring-active ${
                  species === opt.id
                    ? "bg-primary text-on-primary shadow-ambient-lg scale-[1.02]"
                    : "bg-surface-container-lowest border border-outline/20 text-on-surface-variant hover:bg-surface-container-low hover:shadow-ambient"
                }`}
              >
                <Icon
                  name={opt.icon}
                  filled={species === opt.id}
                  className={`text-2xl md:text-3xl ${
                    species === opt.id ? "text-on-primary" : "text-primary"
                  }`}
                />
                <span
                  className={`font-label text-xs font-bold tracking-wide ${
                    species === opt.id ? "text-on-primary" : ""
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lifestage */}
        {species && lifestageOptions.length > 0 && (
          <div>
            <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-3 ml-3 md:ml-4">
              {t("lifeStage")}
            </label>
            <div className="inline-flex rounded-2xl bg-surface-container-lowest border border-outline/20 p-1 gap-1">
              {lifestageOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLifestage(opt.id)}
                  className={`px-5 py-2.5 rounded-xl font-label text-xs font-bold tracking-wide transition-all spring-active ${
                    lifestage === opt.id
                      ? "bg-primary text-on-primary shadow-ambient"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Breed & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-2 ml-3 md:ml-4">
              {t("breed")}
            </label>
            <input
              type="text"
              list={breedSuggestions.length > 0 ? "breed-suggestions" : undefined}
              placeholder={t("breedPlaceholder")}
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border border-outline/20 focus:border-primary font-body p-4 md:p-5 transition-all hover:shadow-ambient input-glow"
              autoComplete="off"
            />
            {breedSuggestions.length > 0 && (
              <datalist id="breed-suggestions">
                {breedSuggestions.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            )}
          </div>
          <div>
            <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-2 ml-3 md:ml-4">
              {t("dateOfBirth")}
            </label>
            <DatePicker value={birthDate} onChange={setBirthDate} />
          </div>
        </div>

        <div className="md:w-1/2">
          <label className="block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-2 ml-3 md:ml-4">
            {t("gotchaDay")}
          </label>
          <DatePicker value={gotchaDate} onChange={setGotchaDate} />
        </div>

        {lifestage === "memorial" && (
          <div
            className="p-6 md:p-8 bg-surface-container-highest/50 irregular-border border-2 border-dashed border-outline-variant/30 animate-fade-up"
          >
            <h4 className="font-headline font-bold text-primary text-sm md:text-base">
              {t("inLovingMemory")}
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t("inLovingMemoryDesc")}
            </p>
            <label className="mt-5 block font-label uppercase text-[10px] tracking-widest text-on-surface-variant mb-2 ml-3 md:ml-4">
              {t("datePassed")}
            </label>
            <DatePicker value={deceasedDate} onChange={setDeceasedDate} />
          </div>
        )}

      </div>

      {error && (
        <p className="text-center font-body text-sm text-error">{error}</p>
      )}

      {/* Submit Button */}
      <div
        className="pt-4 md:pt-8 text-center animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full md:w-auto px-10 md:px-12 py-5 md:py-6 btn-butter text-on-secondary-fixed font-headline font-[800] text-xl md:text-2xl italic tracking-tight rounded-xl shadow-[0px_8px_0px_#6d5a00,0px_12px_24px_rgba(109,90,0,0.3)] transition-all active:translate-y-[4px] active:shadow-[0px_4px_0px_#6d5a00] hover:scale-[1.02] spring-active overflow-hidden disabled:opacity-60 disabled:pointer-events-none"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isSubmitting ? submittingLabel : submitLabel}
            <Icon name="ink_pen" className="text-2xl md:text-3xl" />
          </span>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/30 blur-2xl rounded-full" />
        </button>

        <p className="mt-5 md:mt-6 font-label text-[10px] text-tertiary uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="w-6 md:w-8 h-[1px] bg-tertiary/20" />
          {t("everyMomentMatters")}
          <span className="w-6 md:w-8 h-[1px] bg-tertiary/20" />
        </p>
      </div>
    </form>
  );
}
