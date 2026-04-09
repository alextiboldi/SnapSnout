"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icon";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const t = useTranslations("auth.login");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase returns a generic "Invalid login credentials" for both
      // wrong-password and unknown-user. Treat it as "probably unknown"
      // and bounce to signup with the fields prefilled — signup will
      // surface "user already exists" if it was actually a wrong password.
      if (/invalid login credentials/i.test(error.message)) {
        const params = new URLSearchParams({ email, password });
        if (inviteToken) params.set("invite", inviteToken);
        router.push(`/signup?${params.toString()}`);
        return;
      }
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(inviteToken ? `/invite/${inviteToken}` : "/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm z-10">
      {/* Header — compact on mobile, dramatic on desktop */}
      <div className="mb-6 md:mb-10 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 md:hidden mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/login-sketch.jpg"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-full object-cover grayscale opacity-80 shadow-ambient"
          />
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
        <h2 className="font-headline text-[2.25rem] md:text-5xl font-black text-on-surface tracking-tighter leading-[0.95] md:mb-4">
          {t("title")} <span className="md:hidden text-primary italic">{t("titleAccent")}</span>
          <span className="hidden md:inline"><br /><span className="text-primary italic">{t("titleAccent")}</span></span>
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-[2px] w-12 bg-secondary-container" />
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Email */}
        <div className="space-y-1.5 md:space-y-2 group">
          <label className="font-label text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant ml-2">
            {t("email")}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border-2 border-outline/20 py-3.5 md:py-5 px-5 md:px-6 focus:ring-0 focus:border-tertiary transition-colors font-body text-on-surface placeholder:text-outline/40"
              placeholder={t("emailPlaceholder")}
            />
            <Icon
              name="alternate_email"
              className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-tertiary/30"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 md:space-y-2 group">
          <div className="flex justify-between items-center px-2">
            <label className="font-label text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">
              {t("password")}
            </label>
            <Link
              href="/forgot-password"
              className="font-label text-[10px] uppercase tracking-tighter text-tertiary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border-2 border-outline/20 py-3.5 md:py-5 px-5 md:px-6 focus:ring-0 focus:border-tertiary transition-colors font-body text-on-surface placeholder:text-outline/40"
              placeholder={t("passwordPlaceholder")}
            />
            <Icon
              name="key"
              className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-tertiary/30"
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-error">{error}</p>
        )}

        {/* Tactile Button */}
        <div className="pt-1 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-fixed py-4 md:py-5 rounded-xl font-headline text-lg md:text-xl font-black text-on-secondary-fixed shadow-[0px_6px_0px_#6d5a00,0px_10px_16px_rgba(119,99,0,0.2)] md:shadow-[0px_8px_0px_#6d5a00,0px_12px_20px_rgba(119,99,0,0.2)] active:translate-y-1 active:shadow-[0px_4px_0px_#6d5a00] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span>{loading ? t("submitting") : t("submit")}</span>
            <Icon name="arrow_forward" />
          </button>
        </div>
      </form>

      {/* Decorative Sketch — desktop only */}
      <div className="mt-16 hidden md:flex flex-col items-center">
        <div className="relative p-6 bg-surface-container-low irregular-border overflow-hidden">
          <div className="absolute inset-0 blueprint-grid opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/login-sketch.jpg"
              alt="Golden retriever sketch on blueprint parchment"
              className="h-28 w-28 rounded-full object-cover mix-blend-multiply grayscale opacity-90 shadow-ambient"
            />
            <p className="font-body text-sm text-on-surface-variant text-center max-w-[200px] italic">
              &ldquo;{t("quote")}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer — desktop only */}
      <div className="mt-12 hidden md:flex items-center gap-4 opacity-30">
        <div className="h-px flex-grow bg-outline-variant" />
        <span className="font-label text-[10px] uppercase tracking-widest">
          {tc("appName")}
        </span>
        <div className="h-px flex-grow bg-outline-variant" />
      </div>
    </div>
  );
}
