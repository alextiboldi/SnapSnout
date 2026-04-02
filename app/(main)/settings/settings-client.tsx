"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import Link from "next/link";
import { switchActivePet, deletePet } from "@/lib/actions/pets";
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
}: {
  pet: Pet;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
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
            Delete {pet.name}?
          </h3>
          <p className="mt-2 font-body text-sm text-on-surface-variant max-w-[260px]">
            This will permanently remove {pet.name} and all their milestones
            and photos. This can&apos;t be undone.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-surface-container-highest font-headline font-bold text-sm text-on-surface spring-active hover:shadow-ambient transition-shadow"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-error text-on-error font-headline font-bold text-sm spring-active disabled:opacity-50 transition-all"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PetManagementSection({ pets }: { pets: Pet[] }) {
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
        Your Pets
      </h2>

      {deletingPet && (
        <DeleteDialog
          pet={deletingPet}
          onCancel={() => { setDeletingPet(null); setIsDeleting(false); }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
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
                        Active
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
          Add Another Pet
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
}: {
  milestoneReminders: boolean;
  setMilestoneReminders: (v: boolean) => void;
  photoReminders: boolean;
  setPhotoReminders: (v: boolean) => void;
  birthdayCountdown: boolean;
  setBirthdayCountdown: (v: boolean) => void;
}) {
  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.1s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        Notifications
      </h2>

      <div className="mt-2 divide-y divide-outline-variant/15">
        <NotificationRow
          icon="flag"
          label="Milestone Reminders"
          description="Get notified when milestones are coming up"
          checked={milestoneReminders}
          onChange={setMilestoneReminders}
        />
        <NotificationRow
          icon="photo_camera"
          label="Monthly Photo Reminders"
          description="Never miss a monthly growth photo"
          checked={photoReminders}
          onChange={setPhotoReminders}
        />
        <NotificationRow
          icon="cake"
          label="Birthday Countdown"
          description="Celebrate with a special countdown"
          checked={birthdayCountdown}
          onChange={setBirthdayCountdown}
        />
      </div>
    </section>
  );
}

function SubscriptionSection() {
  return (
    <section
      className="irregular-border overflow-hidden shadow-ambient-lg"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="bg-gradient-to-br from-primary to-primary-dim p-6">
        <div className="flex items-start gap-3">
          <Icon
            name="auto_awesome"
            filled
            className="text-3xl text-white/90"
          />
          <div>
            <h2 className="font-headline text-lg font-bold text-white">
              SnapSnout Premium
            </h2>
            <p className="mt-0.5 font-body text-sm text-white/70">
              Unlock everything for your fur family
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {[
            "Unlimited pets",
            "All card templates",
            "No watermarks",
            "Growth comparisons",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <Icon
                name="check_circle"
                filled
                className="text-lg text-secondary-fixed"
              />
              <span className="font-body text-sm text-white/90">{feature}</span>
            </li>
          ))}
        </ul>

        <button className="spring-active mt-5 w-full rounded-2xl bg-secondary-fixed px-5 py-3 font-headline text-sm font-bold text-on-secondary-fixed shadow-ambient transition-shadow hover:shadow-ambient-lg">
          Upgrade Now
        </button>

        <p className="mt-2.5 text-center font-label text-xs text-white/50">
          $2.99/month &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient"
      style={{ animationDelay: "0.2s" }}
    >
      <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
        About
      </h2>

      <div className="mt-2 divide-y divide-outline-variant/15">
        <AboutRow icon="shield" label="Privacy Policy" href="#privacy" />
        <AboutRow icon="description" label="Terms of Service" href="#terms" />
        <AboutRow icon="star" label="Rate on App Store" href="#rate" />
        <AboutRow icon="mail" label="Contact Support" href="#support" />
      </div>

      <p className="mt-4 text-center font-label text-xs text-on-surface-variant/40">
        SnapSnout v1.0.0
      </p>
    </section>
  );
}

function DangerZone() {
  return (
    <div
      className="flex justify-center"
      style={{ animationDelay: "0.25s" }}
    >
      <button className="spring-active rounded-2xl px-6 py-3 font-headline text-sm font-semibold text-error/70 transition-colors hover:bg-error/5 hover:text-error">
        Delete Account
      </button>
    </div>
  );
}

/* ─── Client Shell ─── */

export default function SettingsClient({ pets }: { pets: Pet[] }) {
  const [milestoneReminders, setMilestoneReminders] = useState(true);
  const [photoReminders, setPhotoReminders] = useState(true);
  const [birthdayCountdown, setBirthdayCountdown] = useState(true);

  return (
    <div className="animate-fade-up mx-auto max-w-lg px-5 pb-8">
      {/* Page title */}
      <h1 className="pt-2 font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
        Settings
      </h1>

      <div className="mt-5 space-y-5">
        <PetManagementSection pets={pets} />

        <NotificationsSection
          milestoneReminders={milestoneReminders}
          setMilestoneReminders={setMilestoneReminders}
          photoReminders={photoReminders}
          setPhotoReminders={setPhotoReminders}
          birthdayCountdown={birthdayCountdown}
          setBirthdayCountdown={setBirthdayCountdown}
        />

        <SubscriptionSection />

        <AboutSection />

        <DangerZone />
      </div>
    </div>
  );
}
