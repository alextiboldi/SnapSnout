"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icon";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tc = useTranslations("common");
  const router = useRouter();
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
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm z-10">
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h2 className="font-headline text-5xl font-black text-on-surface tracking-tighter leading-none mb-4">
          {t("title")} <br /> <span className="text-primary italic">{t("titleAccent")}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-12 bg-secondary-container" />
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2 group">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant ml-2">
            {t("email")}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border-2 border-outline/20 py-5 px-6 focus:ring-0 focus:border-tertiary transition-colors font-body text-on-surface placeholder:text-outline/40"
              placeholder={t("emailPlaceholder")}
            />
            <Icon
              name="alternate_email"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-tertiary/30"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2 group">
          <div className="flex justify-between items-center px-2">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
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
              className="w-full bg-surface-container-lowest irregular-border border-2 border-outline/20 py-5 px-6 focus:ring-0 focus:border-tertiary transition-colors font-body text-on-surface placeholder:text-outline/40"
              placeholder={t("passwordPlaceholder")}
            />
            <Icon
              name="key"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-tertiary/30"
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-error">{error}</p>
        )}

        {/* Tactile Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary-fixed py-5 rounded-xl font-headline text-xl font-black text-on-secondary-fixed shadow-[0px_8px_0px_#6d5a00,0px_12px_20px_rgba(119,99,0,0.2)] active:translate-y-1 active:shadow-[0px_4px_0px_#6d5a00] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span>{loading ? t("submitting") : t("submit")}</span>
            <Icon name="arrow_forward" />
          </button>
        </div>
      </form>

      {/* Decorative Sketch Area */}
      <div className="mt-16 flex flex-col items-center">
        <div className="relative p-6 bg-surface-container-low irregular-border mb-8 overflow-hidden">
          <div className="absolute inset-0 blueprint-grid opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="flex items-end gap-1 mb-2">
              <Icon name="pets" filled className="text-primary text-4xl" />
              <div className="mb-1 w-8 h-[1px] bg-tertiary-fixed border-dashed border-t border-tertiary opacity-40" />
            </div>
            <p className="font-body text-sm text-on-surface-variant text-center max-w-[180px] italic">
              &ldquo;{t("quote")}&rdquo;
            </p>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="text-center space-y-4">
          <p className="font-body text-on-surface-variant text-sm">
            {t("noAccount")}
          </p>
          <Link
            href="/signup"
            className="inline-block font-label text-xs uppercase tracking-[0.25em] text-primary font-bold hover:opacity-70 transition-opacity"
          >
            {t("createAccount")}
          </Link>
        </div>
      </div>

      {/* Footer Decorative Detail */}
      <div className="mt-12 flex items-center gap-4 opacity-30">
        <div className="h-px flex-grow bg-outline-variant" />
        <span className="font-label text-[10px] uppercase tracking-widest">
          {tc("appName")}
        </span>
        <div className="h-px flex-grow bg-outline-variant" />
      </div>
    </div>
  );
}
