"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import {
  getMilestoneShareStatus,
  getOrCreateMilestoneShare,
  revokeMilestoneShare,
} from "@/lib/actions/milestone-shares";
import { formatDate } from "@/lib/utils";

export type MilestoneDetailData = {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  notes: string | null;
  photoUrl: string | null;
  completedDate: Date | null;
  targetDate: Date | null;
};

export function MilestoneDetailModal({
  milestone,
  petName,
  onClose,
}: {
  milestone: MilestoneDetailData;
  petName: string;
  onClose: () => void;
}) {
  const t = useTranslations("milestoneShare");
  const tCommon = useTranslations("common");

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load existing share state on open
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getMilestoneShareStatus(milestone.id);
        if (cancelled) return;
        setShareUrl(status.shared ? status.url : null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [milestone.id, t]);

  const handleShare = () => {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await getOrCreateMilestoneShare(milestone.id);
        setShareUrl(url);
        setCopied(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: milestone.title,
        text: `${petName}: ${milestone.title}`,
        url: shareUrl,
      });
    } catch {
      // user cancelled or unsupported
    }
  };

  const handleRevoke = () => {
    setError(null);
    startTransition(async () => {
      try {
        await revokeMilestoneShare(milestone.id);
        setShareUrl(null);
        setConfirmRevoke(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;
  const date = milestone.completedDate ?? milestone.targetDate;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={isPending ? undefined : onClose}
      />
      <div className="relative w-full max-w-md irregular-border bg-surface-container-lowest shadow-ambient-lg animate-fade-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-surface-container-lowest/80 p-1.5 backdrop-blur-sm hover:bg-surface-container transition-colors"
          aria-label={tCommon("back")}
        >
          <Icon name="close" className="text-lg text-on-surface-variant" />
        </button>

        {/* Hero */}
        {milestone.photoUrl ? (
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={milestone.photoUrl}
              alt={milestone.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary-container via-secondary-fixed-dim to-tertiary-container">
            <span className="text-7xl">{milestone.emoji}</span>
          </div>
        )}

        <div className="p-6">
          {/* Title + date */}
          <div className="text-center">
            {milestone.photoUrl && (
              <span className="text-3xl">{milestone.emoji}</span>
            )}
            <h2 className="mt-1 font-headline text-2xl font-bold text-on-surface">
              {milestone.title}
            </h2>
            {date && (
              <p className="mt-1 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
                {formatDate(date)}
              </p>
            )}
          </div>

          {/* Description + notes */}
          {(milestone.description || milestone.notes) && (
            <div className="mt-4 space-y-3 text-center">
              {milestone.description && (
                <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                  {milestone.description}
                </p>
              )}
              {milestone.notes && (
                <p className="font-body text-xs italic text-on-surface-variant/80">
                  &ldquo;{milestone.notes}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Share section */}
          <div className="mt-6 border-t border-outline-variant/20 pt-5">
            {loadingStatus ? (
              <div className="flex items-center justify-center py-4">
                <Icon
                  name="progress_activity"
                  className="animate-spin text-2xl text-on-surface-variant/40"
                />
              </div>
            ) : shareUrl ? (
              <div>
                <div className="flex items-center gap-2">
                  <Icon
                    name="link"
                    filled
                    className="text-base text-tertiary"
                  />
                  <p className="font-label text-[11px] font-bold uppercase tracking-widest text-tertiary">
                    {t("linkReady")}
                  </p>
                </div>
                <p className="mt-1 font-body text-xs text-on-surface-variant">
                  {t("linkReadyBody")}
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 rounded-xl bg-surface-container border border-outline/20 px-3 py-2.5 font-body text-xs text-on-surface min-w-0 truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 rounded-xl px-4 py-2 font-label text-xs font-bold spring-active transition-colors ${
                      copied
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-primary text-on-primary"
                    }`}
                  >
                    {copied ? t("copied") : t("copy")}
                  </button>
                </div>

                {canNativeShare && (
                  <button
                    onClick={handleNativeShare}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-tertiary/10 px-4 py-2.5 font-headline text-sm font-bold text-tertiary hover:bg-tertiary/20 transition-colors"
                  >
                    <Icon name="ios_share" className="text-base" />
                    {t("openShareSheet")}
                  </button>
                )}

                <button
                  onClick={() => setConfirmRevoke(true)}
                  disabled={isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-error/5 px-4 py-2.5 font-label text-xs font-bold text-error/80 hover:bg-error/10 transition-colors disabled:opacity-50"
                >
                  <Icon name="link_off" className="text-base" />
                  {t("revokeShare")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleShare}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary spring-active shadow-ambient hover:shadow-ambient-lg disabled:opacity-50"
              >
                <Icon name="share" className="text-base" />
                {isPending ? t("creating") : t("shareMilestone")}
              </button>
            )}

            {error && (
              <p className="mt-3 text-center font-body text-xs text-error">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Revoke confirmation */}
        {confirmRevoke && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/95 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <Icon name="link_off" className="text-2xl text-error" />
              </div>
              <h3 className="mt-4 font-headline text-base font-bold text-on-surface">
                {t("revokeConfirmTitle")}
              </h3>
              <p className="mt-2 font-body text-xs text-on-surface-variant">
                {t("revokeConfirmBody")}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setConfirmRevoke(false)}
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
      </div>
    </div>
  );
}
