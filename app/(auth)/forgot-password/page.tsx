"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="relative w-48 h-48 bg-surface-container-high irregular-border flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 blueprint-grid" />
          <Icon name="mark_email_read" filled className="text-6xl text-primary/60 relative z-10" />
          <div className="absolute -top-2 -right-2 bg-secondary-fixed p-3 rounded-full shadow-lg">
            <Icon name="check" className="text-on-secondary-fixed" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
            Check Your Email
          </h1>
          <p className="font-body text-on-surface-variant text-lg max-w-[300px] mx-auto">
            We sent a reset link to <strong className="text-on-surface">{email}</strong>. Click the link to set a new password.
          </p>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors font-bold group"
        >
          <Icon name="arrow_back" className="text-sm group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-12">
      {/* Illustration */}
      <div className="relative w-48 h-48 bg-surface-container-high irregular-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 blueprint-grid" />
        <Icon name="lock_reset" className="text-7xl text-primary/40 relative z-10" />
        <div className="absolute -top-2 -right-2 bg-secondary-fixed p-3 rounded-full shadow-lg">
          <Icon name="key" className="text-on-secondary-fixed" />
        </div>
      </div>

      {/* Typography */}
      <div className="text-center space-y-3">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight leading-tight">
          Forgot Your Password?
        </h1>
        <p className="font-body text-on-surface-variant text-lg max-w-[280px] mx-auto">
          No worries, we&apos;ll send you a link to reset it.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="space-y-2">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold px-4">
            Email
          </label>
          <div className="relative group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest irregular-border border-2 border-outline/20 px-6 py-5 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-tertiary transition-all duration-300 font-body"
              placeholder="Enter your email"
            />
            <Icon
              name="alternate_email"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-tertiary transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-secondary-fixed to-secondary-fixed-dim py-5 rounded-xl font-headline font-bold text-on-secondary-fixed text-xl shadow-[0px_4px_0px_#6d5a00,0px_8px_16px_rgba(154,81,30,0.15)] active:shadow-[0px_1px_0px_#6d5a00] active:translate-y-[3px] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
          <Icon name="rocket_launch" className="font-bold" />
        </button>
      </form>

      {/* Back to login */}
      <footer>
        <Link
          href="/login"
          className="flex items-center gap-2 font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors font-bold group"
        >
          <Icon name="arrow_back" className="text-sm group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
      </footer>

      {/* Background blurs */}
      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-secondary-container/10 blur-[100px] rounded-full -z-10" />
      <div className="fixed bottom-20 left-[-100px] w-80 h-80 bg-tertiary-container/10 blur-[120px] rounded-full -z-10" />
    </div>
  );
}
