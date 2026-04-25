"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import { updateProfile } from "@/lib/actions/user";

export function ProfileForm({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}) {
  const t = useTranslations("profile");
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (formData: FormData) => {
    setSaved(false);
    startTransition(async () => {
      await updateProfile(formData);
      setSaved(true);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <section className="irregular-border bg-surface-container-low p-5 shadow-ambient">
        <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
          {t("avatar")}
        </h2>

        <div className="mt-3 flex items-center gap-5">
          <div className="relative h-[140px] w-[140px] shrink-0 overflow-hidden irregular-border">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-secondary-fixed/30 to-tertiary/20">
                <Icon
                  name="person"
                  filled
                  className="text-5xl text-primary/70"
                />
              </div>
            )}
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-primary/10 px-5 py-2.5 font-headline text-sm font-semibold text-primary spring-active transition-colors hover:bg-primary/20"
            >
              {t("avatarChange")}
            </button>
          </div>
        </div>
      </section>

      {/* Name & Email */}
      <section className="irregular-border bg-surface-container-low p-5 shadow-ambient">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase"
            >
              {t("name")}
            </label>
            <input
              id="profile-name"
              type="text"
              name="name"
              defaultValue={name ?? ""}
              placeholder={t("namePlaceholder")}
              required
              className="mt-1.5 block w-full rounded-2xl bg-surface-container/60 px-4 py-3.5 font-body text-sm text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase"
            >
              {t("email")}
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className="mt-1.5 block w-full rounded-2xl bg-surface-container/60 px-4 py-3.5 font-body text-sm text-on-surface/50 shadow-inner"
            />
            <p className="mt-1.5 font-body text-xs text-on-surface-variant/50">
              {t("emailReadOnly")}
            </p>
          </div>
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-primary px-7 py-4 font-display font-bold text-on-primary shadow-clay spring-active transition-opacity disabled:opacity-50"
      >
        {isPending ? t("saving") : t("save")}
      </button>

      {saved && !isPending && (
        <p className="text-center font-body text-sm font-medium text-primary animate-fade-up">
          {t("saved")}
        </p>
      )}
    </form>
  );
}
