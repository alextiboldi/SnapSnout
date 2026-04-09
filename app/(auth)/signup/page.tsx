"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icon";
import { useTranslations, useLocale } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;
  const [localePending, startLocaleTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState(searchParams.get("password") ?? "");
  const [confirmPassword, setConfirmPassword] = useState(
    searchParams.get("password") ?? ""
  );

  const handleLocaleChange = (next: string) => {
    if (next === currentLocale) return;
    startLocaleTransition(async () => {
      const { setLocale } = await import("@/lib/actions/locale");
      await setLocale(next);
    });
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);

    const inviteToken = searchParams.get("invite");
    const nextPath = inviteToken
      ? `/invite/${encodeURIComponent(inviteToken)}`
      : "/create-pet";
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-surface-container-low irregular-border p-6 md:p-8 shadow-ambient-lg text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
            {t("checkEmail")}
          </h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">
            {t.rich("checkEmailDesc", {
              email,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-8 btn-sculpted text-on-primary font-headline font-bold rounded-xl shadow-ambient spring-active"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-xl relative">
      {/* Background "Paper" Layers */}
      <div className="absolute -inset-4 bg-surface-container-low rounded-xl -rotate-1" />
      <div className="absolute -inset-2 bg-surface-container rounded-xl rotate-1" />

      {/* Content Card */}
      <div className="relative bg-surface-container-lowest p-8 sm:p-12 rounded-xl shadow-lg border border-outline-variant/10">
        {/* Language selector */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <select
              value={currentLocale}
              disabled={localePending}
              onChange={(e) => handleLocaleChange(e.target.value)}
              aria-label={t("language")}
              className="appearance-none rounded-full bg-surface-container/70 pl-4 pr-9 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface shadow-inner focus:outline-none focus:ring-2 focus:ring-tertiary/40 cursor-pointer"
            >
              {locales.map((loc) => (
                <option key={loc} value={loc}>
                  {localeNames[loc]}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-on-surface-variant"
            />
          </div>
        </div>

        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="font-headline text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-md">
            {t("subtitle")}
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2 group">
            <label className="font-label text-[11px] uppercase tracking-widest text-tertiary ml-4">
              {t("name")}
            </label>
            <div className="irregular-border bg-surface-container-low px-6 py-4 flex items-center gap-4 border-2 border-outline/20 focus-within:border-tertiary focus-within:shadow-[0_0_0_4px_rgba(132,190,243,0.2)] transition-all">
              <Icon name="person" className="text-outline-variant" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-outline-variant/50 p-0"
                placeholder={t("namePlaceholder")}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2 group">
            <label className="font-label text-[11px] uppercase tracking-widest text-tertiary ml-4">
              {t("email")}
            </label>
            <div className="irregular-border bg-surface-container-low px-6 py-4 flex items-center gap-4 border-2 border-outline/20 focus-within:border-tertiary focus-within:shadow-[0_0_0_4px_rgba(132,190,243,0.2)] transition-all">
              <Icon name="alternate_email" className="text-outline-variant" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-outline-variant/50 p-0"
                placeholder={t("emailPlaceholder")}
              />
            </div>
          </div>

          {/* Password Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label text-[11px] uppercase tracking-widest text-tertiary ml-4">
                {t("password")}
              </label>
              <div className="irregular-border bg-surface-container-low px-6 py-4 flex items-center gap-4 border-2 border-outline/20 focus-within:border-tertiary focus-within:shadow-[0_0_0_4px_rgba(132,190,243,0.2)] transition-all">
                <Icon name="key" className="text-outline-variant" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-outline-variant/50 p-0"
                  placeholder={t("passwordPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-[11px] uppercase tracking-widest text-tertiary ml-4">
                {t("confirm")}
              </label>
              <div className="irregular-border bg-surface-container-low px-6 py-4 flex items-center gap-4 border-2 border-outline/20 focus-within:border-tertiary focus-within:shadow-[0_0_0_4px_rgba(132,190,243,0.2)] transition-all">
                <Icon name="verified_user" className="text-outline-variant" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-outline-variant/50 p-0"
                  placeholder={t("passwordPlaceholder")}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="font-body text-sm text-error">{error}</p>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-b from-secondary-fixed to-secondary-fixed-dim hover:from-secondary-fixed-dim hover:to-secondary-fixed py-5 px-8 rounded-full flex items-center justify-center gap-3 transition-all shadow-[0px_4px_12px_rgba(55,56,49,0.05),0px_2px_4px_rgba(139,69,19,0.1),inset_0px_2px_0px_rgba(154,81,30,0.3)] active:scale-95 disabled:opacity-50"
            >
              <span className="font-headline font-extrabold text-on-secondary-fixed text-xl">
                {loading ? t("submitting") : t("submit")}
              </span>
              <Icon name="arrow_forward" className="font-bold text-on-secondary-fixed" />
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <footer className="mt-12 text-center">
          <Link
            href="/login"
            className="group flex items-center justify-center gap-2 font-label text-[12px] uppercase tracking-widest text-tertiary-dim hover:text-primary transition-colors"
          >
            <Icon name="login" className="text-sm" />
            {t("hasAccount")}
          </Link>
        </footer>

        {/* Decorative Archive Sketch */}
        <div className="absolute -top-10 -right-10 hidden lg:block rotate-[4deg] pointer-events-none">
          <div className="bg-surface-container-lowest p-2 shadow-ambient-lg rotate-[2deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/signup-sketch.jpg"
              alt="Puppy resting on a blueprint drafting table"
              className="h-36 w-36 object-cover grayscale mix-blend-multiply opacity-90"
            />
            <p className="mt-1 text-center font-label text-[9px] uppercase tracking-widest text-tertiary/70">
              Archive · Pet 01
            </p>
          </div>
        </div>
        <div className="absolute -bottom-8 -left-8 hidden lg:block opacity-20 -rotate-12 pointer-events-none">
          <Icon name="ink_pen" className="text-[100px] text-primary" />
        </div>
      </div>
    </main>
  );
}
