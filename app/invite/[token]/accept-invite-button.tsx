"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { acceptInvite } from "@/lib/actions/family";

export function AcceptInviteButton({
  token,
  confirmLabel,
  loadingLabel,
  cancelLabel,
  destructive,
}: {
  token: string;
  confirmLabel: string;
  loadingLabel: string;
  cancelLabel: string;
  destructive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      try {
        await acceptInvite(token);
      } catch (e) {
        // Server actions throw NEXT_REDIRECT to navigate; rethrow it.
        if (
          e &&
          typeof e === "object" &&
          "digest" in e &&
          String(e.digest).startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={handleAccept}
        disabled={isPending}
        className={`w-full rounded-full px-7 py-4 font-headline text-base font-bold shadow-ambient transition-all spring-active disabled:opacity-50 ${
          destructive
            ? "bg-error text-on-error hover:shadow-ambient-lg"
            : "bg-primary text-on-primary hover:shadow-ambient-lg"
        }`}
      >
        {isPending ? loadingLabel : confirmLabel}
      </button>
      <Link
        href="/"
        className="block w-full rounded-full bg-surface-container-highest px-7 py-3 font-headline text-sm font-bold text-on-surface text-center spring-active"
      >
        {cancelLabel}
      </Link>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
