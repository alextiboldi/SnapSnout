"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@/components/icon";
import Link from "next/link";
import { switchActivePet, deletePet } from "@/lib/actions/pets";
import { signOut, deleteAccount } from "@/lib/actions/auth";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Pet } from "@/lib/generated/prisma/client";

/* ─── Toggle Switch ─── */

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
        checked ? "bg-primary" : "bg-outline-variant/30"
      }`}
    >
      <span
        className={`toggle-thumb pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Notification Row ─── */

function NotificationRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon name={icon} filled className="text-xl text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-headline text-sm font-semibold text-on-surface">
          {label}
        </p>
        <p className="font-body text-xs leading-snug text-on-surface-variant/70">
          {description}
        </p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

/* ─── About Link Row ─── */

function AboutRow({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="spring-active flex w-full items-center gap-4 py-3 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary/10">
        <Icon name={icon} className="text-xl text-tertiary" />
      </div>
      <p className="min-w-0 flex-1 font-body text-sm font-medium text-on-surface">
        {label}
      </p>
      <Icon name="chevron_right" className="text-xl text-outline-variant" />
    </Link>
  );
}

/* ─── Sections ─── */

function DeleteDialog({
  pet,
  onCancel,
  onConfirm,
  isDeleting,
  t,
}: {
  pet: Pet;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  t: ReturnType<typeof useTranslations<"settings">>;
}) {
  const tCommon = useTranslations("common");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-surface-container-lowest irregular-border p-6 shadow-ambient-lg animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <Icon name="delete_forever" filled className="text-3xl text-error" />
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {t("deletePet", { name: pet.name })}
          </h3>
          <p className="mt-2 font-body text-sm text-on-surface-variant max-w-[260px]">
            {t("deleteConfirm", { name: pet.name })}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-surface-container-highest font-headline font-bold text-sm text-on-surface spring-active hover:shadow-ambient transition-shadow"
          >
            {t("keep")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-error text-on-error font-headline font-bold text-sm spring-active disabled:opacity-50 transition-all"
          >
            {isDeleting ? t("deleting") : tCommon("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PetManagementSection({ pets, t }: { pets: Pet[]; t: ReturnType<typeof useTranslations<"settings">> }) {
  const [isPending, startTransition] = useTransition();
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!deletingPet) return;
    setIsDeleting(true);
    startTransition(async () => {
      await deletePet(deletingPet.id);
      setDeletingPet(null);
      setIsDeleting(false);
    });
  };

  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.05s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("yourPets")}
      </h2>

      {deletingPet && (
        <DeleteDialog
          pet={deletingPet}
          onCancel={() => { setDeletingPet(null); setIsDeleting(false); }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          t={t}
        />
      )}

      <div className="mt-3 space-y-2">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className={`rounded-2xl bg-surface-container/60 p-3 transition-shadow hover:shadow-ambient ${isPending ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-4">
              <button
                disabled={isPending}
                onClick={() => {
                  if (pet.id !== pets.find((p) => p.isActive)?.id) {
                    startTransition(() => switchActivePet(pet.id));
                  }
                }}
                className="flex flex-1 items-center gap-4 text-left spring-active min-w-0"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 via-secondary-fixed/30 to-tertiary/20 overflow-hidden">
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
                      className="text-2xl text-primary/70"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-headline text-sm font-bold text-on-surface truncate">
                      {pet.name}
                    </p>
                    {pet.isActive && (
                      <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-label font-bold rounded-full">
                        {t("active")}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-on-surface-variant/70">
                    {pet.breed || pet.species}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/edit-pet/${pet.id}`}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors spring-active"
                  aria-label={`Edit ${pet.name}`}
                >
                  <Icon name="edit" className="text-lg text-primary" />
                </Link>
                <button
                  onClick={() => setDeletingPet(pet)}
                  className="p-2 rounded-full hover:bg-error/10 transition-colors spring-active"
                  aria-label={`Delete ${pet.name}`}
                >
                  <Icon name="delete" className="text-lg text-error/60 hover:text-error" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/create-pet"
        className="spring-active mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/40 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <Icon name="add" className="text-xl text-primary" />
        <span className="font-headline text-sm font-semibold text-primary">
          {t("addAnother")}
        </span>
      </Link>
    </section>
  );
}

function NotificationsSection({
  milestoneReminders,
  setMilestoneReminders,
  photoReminders,
  setPhotoReminders,
  birthdayCountdown,
  setBirthdayCountdown,
  t,
}: {
  milestoneReminders: boolean;
  setMilestoneReminders: (v: boolean) => void;
  photoReminders: boolean;
  setPhotoReminders: (v: boolean) => void;
  birthdayCountdown: boolean;
  setBirthdayCountdown: (v: boolean) => void;
  t: ReturnType<typeof useTranslations<"settings">>;
}) {
  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.1s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("notifications")}
      </h2>

      <div className="mt-2 divide-y divide-outline-variant/15">
        <NotificationRow
          icon="flag"
          label={t("milestoneReminders")}
          description={t("milestoneRemindersDesc")}
          checked={milestoneReminders}
          onChange={setMilestoneReminders}
        />
        <NotificationRow
          icon="photo_camera"
          label={t("photoReminders")}
          description={t("photoRemindersDesc")}
          checked={photoReminders}
          onChange={setPhotoReminders}
        />
        <NotificationRow
          icon="cake"
          label={t("birthdayCountdown")}
          description={t("birthdayCountdownDesc")}
          checked={birthdayCountdown}
          onChange={setBirthdayCountdown}
        />
      </div>
    </section>
  );
}

function LanguageSection() {
  const t = useTranslations("settings");
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (locale: string) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      const { setLocale } = await import("@/lib/actions/locale");
      await setLocale(locale);
    });
  };

  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.12s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("language")}
      </h2>
      <div className="relative mt-3">
        <select
          value={currentLocale}
          disabled={isPending}
          onChange={(e) => handleLocaleChange(e.target.value)}
          className={`spring-active w-full appearance-none rounded-2xl bg-surface-container/60 px-4 py-3.5 pr-12 font-body text-sm font-medium text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40 transition-opacity ${
            isPending ? "opacity-50" : ""
          }`}
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {localeNames[locale]}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant"
        />
      </div>
    </section>
  );
}

function AccountActionsSection({
  t,
}: {
  t: ReturnType<typeof useTranslations<"settings">>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.22s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("account")}
      </h2>

      <div className="mt-3 space-y-2">
        <button
          onClick={() => startSignOut(() => signOut())}
          disabled={isSigningOut}
          className="spring-active flex w-full items-center gap-4 rounded-2xl bg-surface-container/60 p-3 text-left transition-shadow hover:shadow-ambient disabled:opacity-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="logout" className="text-xl text-primary" />
          </div>
          <span className="flex-1 font-headline text-sm font-semibold text-on-surface">
            {isSigningOut ? t("signingOut") : t("signOut")}
          </span>
          <Icon name="chevron_right" className="text-xl text-outline-variant" />
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          className="spring-active flex w-full items-center gap-4 rounded-2xl bg-error/5 p-3 text-left transition-colors hover:bg-error/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10">
            <Icon name="delete_forever" filled className="text-xl text-error" />
          </div>
          <span className="flex-1 font-headline text-sm font-semibold text-error">
            {t("deleteAccount")}
          </span>
          <Icon name="chevron_right" className="text-xl text-error/50" />
        </button>
      </div>

      {confirmDelete && (
        <DeleteAccountDialog
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => startDeleting(() => deleteAccount())}
          isDeleting={isDeleting}
          t={t}
        />
      )}
    </section>
  );
}

function DeleteAccountDialog({
  onCancel,
  onConfirm,
  isDeleting,
  t,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  t: ReturnType<typeof useTranslations<"settings">>;
}) {
  const tCommon = useTranslations("common");
  const [typed, setTyped] = useState("");
  const confirmWord = t("deleteAccountConfirmWord");
  const canDelete = typed.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-surface-container-lowest irregular-border p-6 shadow-ambient-lg animate-fade-up"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <Icon name="warning" filled className="text-3xl text-error" />
          </div>
          <h3 className="mt-4 font-headline text-lg font-bold text-on-surface">
            {t("deleteAccountTitle")}
          </h3>
          <p className="mt-2 max-w-[280px] font-body text-sm text-on-surface-variant">
            {t("deleteAccountWarning")}
          </p>
          <ul className="mt-3 w-full space-y-1.5 rounded-xl bg-error/5 p-3 text-left">
            {["lossPets", "lossPhotos", "lossMilestones", "lossIrreversible"].map(
              (key) => (
                <li
                  key={key}
                  className="flex items-start gap-2 font-body text-xs text-error/90"
                >
                  <Icon name="close" className="text-sm mt-0.5 shrink-0" />
                  <span>{t(`deleteAccount_${key}`)}</span>
                </li>
              )
            )}
          </ul>
          <p className="mt-4 font-body text-xs text-on-surface-variant">
            {t("deleteAccountTypePrompt", { word: confirmWord })}
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={isDeleting}
            placeholder={confirmWord}
            className="mt-2 w-full rounded-xl border-2 border-error/20 bg-surface-container-low px-4 py-2.5 text-center font-headline text-sm font-bold tracking-widest text-on-surface uppercase focus:border-error focus:outline-none"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-surface-container-highest py-3 font-headline text-sm font-bold text-on-surface spring-active transition-shadow hover:shadow-ambient disabled:opacity-50"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || isDeleting}
            className="flex-1 rounded-xl bg-error py-3 font-headline text-sm font-bold text-on-error spring-active transition-all disabled:opacity-40"
          >
            {isDeleting ? t("deleting") : t("deleteAccountConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSection() {
  const t = useTranslations("settings");
  const features = [
    t("unlimitedPets"),
    t("allTemplates"),
    t("noWatermarks"),
    t("growthComparisons"),
  ];

  return (
    <section
      className="irregular-border overflow-hidden shadow-ambient-lg"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="bg-gradient-to-br from-primary to-primary-dim p-6">
        <div className="flex items-start gap-3">
          <Icon name="auto_awesome" filled className="text-3xl text-white/90" />
          <div>
            <h2 className="font-headline text-lg font-bold text-white">
              {t("premium")}
            </h2>
            <p className="mt-0.5 font-body text-sm text-white/70">
              {t("premiumDesc")}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <Icon name="check_circle" filled className="text-lg text-secondary-fixed" />
              <span className="font-body text-sm text-white/90">{feature}</span>
            </li>
          ))}
        </ul>

        <button className="spring-active mt-5 w-full rounded-2xl bg-secondary-fixed px-5 py-3 font-headline text-sm font-bold text-on-secondary-fixed shadow-ambient transition-shadow hover:shadow-ambient-lg">
          {t("upgradeNow")}
        </button>

        <p className="mt-2.5 text-center font-label text-xs text-white/50">
          {t("priceMonthly")}
        </p>
      </div>
    </section>
  );
}

function AboutSection() {
  const t = useTranslations("settings");
  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.2s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        {t("about")}
      </h2>

      <div className="mt-2 divide-y divide-outline-variant/15">
        <AboutRow icon="shield" label={t("privacyPolicy")} href="#privacy" />
        <AboutRow icon="description" label={t("termsOfService")} href="#terms" />
        <AboutRow icon="star" label={t("rateApp")} href="#rate" />
        <AboutRow icon="mail" label={t("contactSupport")} href="#support" />
      </div>

      <p className="mt-4 text-center font-label text-xs text-on-surface-variant/40">
        {t("version")}
      </p>
    </section>
  );
}

/* ─── Client Shell ─── */

export default function SettingsClient({ pets }: { pets: Pet[] }) {
  const t = useTranslations("settings");
  const [milestoneReminders, setMilestoneReminders] = useState(true);
  const [photoReminders, setPhotoReminders] = useState(true);
  const [birthdayCountdown, setBirthdayCountdown] = useState(true);

  return (
    <div className="animate-fade-up mx-auto max-w-lg px-5 pb-8">
      <h1 className="pt-2 font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
        {t("title")}
      </h1>

      <div className="mt-5 space-y-5">
        <PetManagementSection pets={pets} t={t} />

        <NotificationsSection
          milestoneReminders={milestoneReminders}
          setMilestoneReminders={setMilestoneReminders}
          photoReminders={photoReminders}
          setPhotoReminders={setPhotoReminders}
          birthdayCountdown={birthdayCountdown}
          setBirthdayCountdown={setBirthdayCountdown}
          t={t}
        />

        <LanguageSection />

        <SubscriptionSection />

        <AboutSection />

        <AccountActionsSection t={t} />
      </div>
    </div>
  );
}
