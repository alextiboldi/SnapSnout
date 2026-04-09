"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import { revokeMilestoneShare } from "@/lib/actions/milestone-shares";
import { formatDate, isTranslationKey } from "@/lib/utils";
import type { ActiveShare } from "@/lib/queries/milestone-shares";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  horse: "🐴",
  other: "🐾",
};

export function ActiveSharesSection({ shares }: { shares: ActiveShare[] }) {
  const t = useTranslations("activeShares");
  const tPresets = useTranslations("presets");
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ActiveShare | null>(null);

  const resolveTitle = (raw: string) =>
    isTranslationKey(raw) ? tPresets(raw.replace("presets.", "")) : raw;

  const handleCopy = async (share: ActiveShare) => {
    try {
      await navigator.clipboard.writeText(share.url);
      setCopiedId(share.id);
      setTimeout(() => setCopiedId((curr) => (curr === share.id ? null : curr)), 2000);
    } catch {
      // clipboard blocked
    }
  };

  const handleRevoke = () => {
    if (!confirming) return;
    startTransition(async () => {
      try {
        await revokeMilestoneShare(confirming.milestone.id);
        setConfirming(null);
      } catch {
        // server action revalidates the page on success; on error we keep the dialog open
        setConfirming(null);
      }
    });
  };

  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient animate-fade-up"
      style={{ animationDelay: "0.16s" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
          {t("sectionTitle")}
        </h2>
        {shares.length > 0 && (
          <span className="rounded-full bg-tertiary/10 px-2.5 py-0.5 font-label text-[10px] font-bold text-tertiary">
            {shares.length}
          </span>
        )}
      </div>

      {shares.length === 0 ? (
        <p className="mt-3 font-body text-sm text-on-surface-variant/70">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {shares.map((share) => {
            const date = share.milestone.completedDate ?? share.milestone.targetDate;
            return (
              <div
                key={share.id}
                className="rounded-2xl bg-surface-container/60 p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">
                    {share.milestone.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-headline text-sm font-bold text-on-surface">
                      {resolveTitle(share.milestone.title)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-on-surface-variant/70">
                      <span className="text-xs">
                        {SPECIES_EMOJI[share.milestone.pet.species] ?? "🐾"}
                      </span>
                      <span className="font-body text-xs truncate">
                        {share.milestone.pet.name}
                      </span>
                      {date && (
                        <>
                          <span className="text-on-surface-variant/40">·</span>
                          <span className="font-body text-xs">{formatDate(date)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Icon
                    name="visibility"
                    className="text-base text-on-surface-variant/60 shrink-0"
                  />
                  <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/60">
                    {t("views", { count: share.viewCount })}
                  </span>
                  {share.lastViewedAt && (
                    <span className="font-label text-[10px] text-on-surface-variant/40">
                      · {t("lastViewed", { date: formatDate(share.lastViewedAt) })}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleCopy(share)}
                    className={`flex-1 rounded-xl px-3 py-2 font-label text-[11px] font-bold spring-active transition-colors ${
                      copiedId === share.id
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-surface-container-highest text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Icon
                        name={copiedId === share.id ? "check" : "content_copy"}
                        className="text-base"
                      />
                      {copiedId === share.id ? t("copied") : t("copyLink")}
                    </span>
                  </button>
                  <button
                    onClick={() => setConfirming(share)}
                    disabled={isPending}
                    className="rounded-xl bg-error/10 px-3 py-2 font-label text-[11px] font-bold text-error hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="link_off" className="text-base" />
                      {t("revoke")}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={isPending ? undefined : () => setConfirming(null)}
          />
          <div className="relative w-full max-w-sm irregular-border bg-surface-container-lowest p-6 shadow-ambient-lg animate-fade-up">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <Icon name="link_off" className="text-2xl text-error" />
              </div>
              <h3 className="mt-4 font-headline text-base font-bold text-on-surface">
                {t("revokeConfirmTitle", {
                  title: resolveTitle(confirming.milestone.title),
                })}
              </h3>
              <p className="mt-2 font-body text-xs text-on-surface-variant">
                {t("revokeConfirmBody")}
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                disabled={isPending}
                className="flex-1 rounded-xl bg-surface-container-highest py-2.5 font-headline text-sm font-bold text-on-surface"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleRevoke}
                disabled={isPending}
                className="flex-1 rounded-xl bg-error py-2.5 font-headline text-sm font-bold text-on-error disabled:opacity-50"
              >
                {t("revoke")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
