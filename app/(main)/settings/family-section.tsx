"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import {
  renameFamily,
  createInvite,
  revokeInvite,
  removeMember,
  leaveFamily,
  transferOwnership,
} from "@/lib/actions/family";
import type {
  FamilyDetails,
  FamilyMemberWithUser,
  FamilyInviteRow,
} from "@/lib/queries/family";

export function FamilySection({
  details,
  currentUserId,
  isOwner,
  isPremium,
}: {
  details: FamilyDetails;
  currentUserId: string;
  isOwner: boolean;
  isPremium: boolean;
}) {
  const t = useTranslations("family");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Rename state
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(details.family.name);

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteEmailStatus, setInviteEmailStatus] = useState<
    "sent" | "user_exists" | "failed" | "skipped" | null
  >(null);
  const [copied, setCopied] = useState(false);

  // Confirmation state
  const [removingMember, setRemovingMember] = useState<FamilyMemberWithUser | null>(null);
  const [transferringTo, setTransferringTo] = useState<FamilyMemberWithUser | null>(null);
  const [leavingFamily, setLeavingFamily] = useState(false);

  const handleRename = () => {
    setError(null);
    startTransition(async () => {
      try {
        await renameFamily(nameDraft);
        setEditingName(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleInvite = (withEmail: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        const emailToSend = withEmail ? inviteEmail.trim() || null : null;
        const { url, emailStatus } = await createInvite(emailToSend);
        setInviteUrl(url);
        setInviteEmailStatus(emailStatus);
        setCopied(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; select-for-copy fallback lives in the input.
    }
  };

  const handleRevoke = (invite: FamilyInviteRow) => {
    setError(null);
    startTransition(async () => {
      try {
        await revokeInvite(invite.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleRemoveMember = () => {
    if (!removingMember) return;
    setError(null);
    startTransition(async () => {
      try {
        await removeMember(removingMember.userId);
        setRemovingMember(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleTransfer = () => {
    if (!transferringTo) return;
    setError(null);
    startTransition(async () => {
      try {
        await transferOwnership(transferringTo.userId);
        setTransferringTo(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const handleLeave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await leaveFamily();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorGeneric"));
      }
    });
  };

  const closeInviteModal = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteUrl(null);
    setInviteEmailStatus(null);
    setCopied(false);
    setError(null);
  };

  const memberName = (m: FamilyMemberWithUser) =>
    m.user.name?.trim() || m.user.email;

  return (
    <section
      className="irregular-border bg-surface-container-low p-5 shadow-ambient animate-fade-up"
      style={{ animationDelay: "0.08s" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-label text-[11px] font-medium tracking-wider text-on-surface-variant/70 uppercase">
          {t("sectionTitle")}
        </h2>
        {isOwner && !editingName && (
          <button
            onClick={() => {
              setNameDraft(details.family.name);
              setEditingName(true);
            }}
            className="rounded-full p-1.5 hover:bg-primary/10 transition-colors spring-active"
            aria-label={t("renameFamily")}
          >
            <Icon name="edit" className="text-base text-primary" />
          </button>
        )}
      </div>

      {/* Family name (read or edit) */}
      {editingName ? (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={60}
            disabled={isPending}
            autoFocus
            className="flex-1 rounded-xl bg-surface-container-lowest border border-outline/20 px-4 py-2.5 font-headline text-base font-bold text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleRename}
            disabled={isPending || !nameDraft.trim()}
            className="rounded-xl bg-primary px-4 py-2 font-label text-xs font-bold text-on-primary spring-active disabled:opacity-50"
          >
            {t("save")}
          </button>
          <button
            onClick={() => {
              setEditingName(false);
              setNameDraft(details.family.name);
            }}
            disabled={isPending}
            className="rounded-xl bg-surface-container-highest px-4 py-2 font-label text-xs font-bold text-on-surface spring-active"
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <p className="mt-2 font-headline text-xl font-bold text-on-surface">
          {details.family.name}
        </p>
      )}

      {/* Members list */}
      <div className="mt-5 space-y-2">
        {details.members.map((m) => {
          const isSelf = m.userId === currentUserId;
          const canRemove = isOwner && !isSelf && m.role !== "owner";
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl bg-surface-container/60 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 via-secondary-fixed/30 to-tertiary/20 overflow-hidden">
                {m.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.user.avatarUrl}
                    alt={memberName(m)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-headline text-sm font-bold text-primary">
                    {memberName(m)[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-headline text-sm font-semibold text-on-surface">
                  {memberName(m)} {isSelf && <span className="text-on-surface-variant/60">({t("you")})</span>}
                </p>
                <p className="truncate font-body text-xs text-on-surface-variant/70">
                  {m.user.email}
                </p>
              </div>
              {m.role === "owner" && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-label text-[10px] font-bold text-primary">
                  {t("roleOwner")}
                </span>
              )}
              {canRemove && (
                <>
                  <button
                    onClick={() => setTransferringTo(m)}
                    disabled={isPending}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors spring-active"
                    aria-label={t("transferOwnership")}
                    title={t("transferOwnership")}
                  >
                    <Icon name="workspace_premium" className="text-lg text-primary/70" />
                  </button>
                  <button
                    onClick={() => setRemovingMember(m)}
                    disabled={isPending}
                    className="p-2 rounded-full hover:bg-error/10 transition-colors spring-active"
                    aria-label={t("removeMember")}
                  >
                    <Icon name="person_remove" className="text-lg text-error/60" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending invites (owner only) */}
      {isOwner && details.invites.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 font-label text-[10px] font-bold tracking-wider uppercase text-on-surface-variant/60">
            {t("pendingInvites")}
          </p>
          <div className="space-y-2">
            {details.invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container/30 p-3"
              >
                <Icon name="mail" className="text-base text-on-surface-variant/70 shrink-0" />
                <p className="min-w-0 flex-1 truncate font-body text-sm text-on-surface-variant">
                  {inv.email || t("linkOnlyInvite")}
                </p>
                <button
                  onClick={() => {
                    const base =
                      typeof window !== "undefined" ? window.location.origin : "";
                    navigator.clipboard
                      .writeText(`${base}/invite/${inv.token}`)
                      .catch(() => {});
                  }}
                  className="rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase text-tertiary hover:bg-tertiary/10 transition-colors"
                >
                  {t("copyLink")}
                </button>
                <button
                  onClick={() => handleRevoke(inv)}
                  disabled={isPending}
                  className="p-1.5 rounded-full hover:bg-error/10 transition-colors"
                  aria-label={t("revoke")}
                >
                  <Icon name="close" className="text-base text-error/60" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        {isOwner && (
          <button
            onClick={() => {
              if (!isPremium) {
                setError(t("premiumRequired"));
                return;
              }
              setInviteOpen(true);
            }}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-full px-5 py-3 font-label text-xs font-bold shadow-ambient spring-active transition-all ${
              isPremium
                ? "bg-primary text-on-primary hover:shadow-ambient-lg"
                : "bg-surface-container-highest text-on-surface-variant/60 cursor-not-allowed"
            }`}
          >
            <Icon name="person_add" className="text-base" />
            {isPremium ? t("inviteMember") : t("inviteMemberLocked")}
          </button>
        )}
        {!isOwner && (
          <button
            onClick={() => setLeavingFamily(true)}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-error/10 px-5 py-3 font-label text-xs font-bold text-error spring-active transition-colors hover:bg-error/20"
          >
            <Icon name="logout" className="text-base" />
            {t("leaveFamily")}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 font-body text-sm text-error">{error}</p>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={isPending ? undefined : closeInviteModal}
          />
          <div className="relative w-full max-w-sm irregular-border bg-surface-container-lowest p-6 shadow-ambient-lg animate-fade-up">
            <button
              onClick={closeInviteModal}
              className="absolute top-3 right-3 rounded-full p-1.5 hover:bg-surface-container transition-colors"
              aria-label={t("close")}
            >
              <Icon name="close" className="text-lg text-on-surface-variant" />
            </button>

            {inviteUrl ? (
              <InviteResult
                emailStatus={inviteEmailStatus}
                email={inviteEmail}
                inviteUrl={inviteUrl}
                onCopy={handleCopy}
                copied={copied}
                onClose={closeInviteModal}
                t={t}
              />
            ) : (
              <InviteForm
                email={inviteEmail}
                setEmail={setInviteEmail}
                onSendEmail={() => handleInvite(true)}
                onGenerateLink={() => handleInvite(false)}
                isPending={isPending}
                error={error}
                t={t}
              />
            )}
          </div>
        </div>
      )}

      {/* Remove-member confirmation */}
      {removingMember && (
        <ConfirmDialog
          title={t("removeMemberTitle", { name: memberName(removingMember) })}
          body={t("removeMemberBody")}
          confirmLabel={t("removeConfirm")}
          cancelLabel={t("cancel")}
          danger
          isPending={isPending}
          onCancel={() => setRemovingMember(null)}
          onConfirm={handleRemoveMember}
        />
      )}

      {/* Transfer-ownership confirmation */}
      {transferringTo && (
        <ConfirmDialog
          title={t("transferTitle", { name: memberName(transferringTo) })}
          body={t("transferBody")}
          confirmLabel={t("transferConfirm")}
          cancelLabel={t("cancel")}
          isPending={isPending}
          onCancel={() => setTransferringTo(null)}
          onConfirm={handleTransfer}
        />
      )}

      {/* Leave-family confirmation */}
      {leavingFamily && (
        <ConfirmDialog
          title={t("leaveTitle", { family: details.family.name })}
          body={t("leaveBody")}
          confirmLabel={t("leaveConfirm")}
          cancelLabel={t("cancel")}
          danger
          isPending={isPending}
          onCancel={() => setLeavingFamily(false)}
          onConfirm={handleLeave}
        />
      )}
    </section>
  );
}

function InviteForm({
  email,
  setEmail,
  onSendEmail,
  onGenerateLink,
  isPending,
  error,
  t,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSendEmail: () => void;
  onGenerateLink: () => void;
  isPending: boolean;
  error: string | null;
  t: ReturnType<typeof useTranslations<"family">>;
}) {
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Icon name="diversity_3" filled className="text-2xl text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {t("inviteTitle")}
          </h3>
          <p className="font-body text-xs text-on-surface-variant">
            {t("inviteSubtitle")}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          {t("emailLabelOptional")}
        </label>
        <div className="mt-2 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            autoFocus
            className="w-full rounded-xl bg-surface-container border border-outline/20 pl-10 pr-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
          />
          <Icon
            name="alternate_email"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant/60"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 font-body text-xs text-error">{error}</p>
      )}

      {/* Primary: send email (only when a valid address is in the field) */}
      <button
        onClick={onSendEmail}
        disabled={isPending || !hasValidEmail}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary spring-active shadow-ambient hover:shadow-ambient-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        <Icon name="send" className="text-base" />
        {isPending ? t("creating") : t("sendInvitation")}
      </button>

      {/* Divider */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
          {t("or")}
        </span>
        <div className="h-px flex-1 bg-outline-variant/30" />
      </div>

      {/* Secondary: copy link without email */}
      <button
        onClick={onGenerateLink}
        disabled={isPending}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container/30 px-4 py-3 font-headline text-sm font-bold text-on-surface spring-active hover:bg-surface-container/60 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Icon name="link" className="text-base text-primary" />
        {t("generateLink")}
      </button>
      <p className="mt-2 text-center font-body text-[11px] text-on-surface-variant/70">
        {t("generateLinkHint")}
      </p>
    </div>
  );
}

function InviteResult({
  emailStatus,
  email,
  inviteUrl,
  onCopy,
  copied,
  onClose,
  t,
}: {
  emailStatus: "sent" | "user_exists" | "failed" | "skipped" | null;
  email: string;
  inviteUrl: string;
  onCopy: () => void;
  copied: boolean;
  onClose: () => void;
  t: ReturnType<typeof useTranslations<"family">>;
}) {
  // Choose hero card based on email status
  const variant: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    body: string;
    showLinkAsPrimary: boolean;
  } =
    emailStatus === "sent"
      ? {
          icon: "mark_email_read",
          iconBg: "bg-tertiary/15",
          iconColor: "text-tertiary",
          title: t("resultSentTitle"),
          body: t("resultSentBody", { email }),
          showLinkAsPrimary: false,
        }
      : emailStatus === "user_exists"
        ? {
            icon: "info",
            iconBg: "bg-secondary-fixed/30",
            iconColor: "text-on-secondary-fixed",
            title: t("resultUserExistsTitle"),
            body: t("resultUserExistsBody"),
            showLinkAsPrimary: true,
          }
        : emailStatus === "failed"
          ? {
              icon: "error",
              iconBg: "bg-error/10",
              iconColor: "text-error",
              title: t("resultFailedTitle"),
              body: t("resultFailedBody"),
              showLinkAsPrimary: true,
            }
          : {
              // skipped — link-only flow
              icon: "link",
              iconBg: "bg-primary/10",
              iconColor: "text-primary",
              title: t("resultLinkTitle"),
              body: t("resultLinkBody"),
              showLinkAsPrimary: true,
            };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${variant.iconBg}`}
        >
          <Icon name={variant.icon} filled className={`text-2xl ${variant.iconColor}`} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {variant.title}
          </h3>
          <p className="font-body text-xs text-on-surface-variant">
            {variant.body}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          {variant.showLinkAsPrimary ? t("shareLink") : t("shareLinkAlt")}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-xl bg-surface-container border border-outline/20 px-3 py-2.5 font-body text-xs text-on-surface min-w-0 truncate"
          />
          <button
            onClick={onCopy}
            className={`shrink-0 rounded-xl px-4 py-2 font-label text-xs font-bold spring-active transition-colors ${
              copied
                ? "bg-tertiary text-on-tertiary"
                : "bg-primary text-on-primary"
            }`}
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="mt-2 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/60">
          {t("expiresInDays", { days: 7 })}
        </p>
      </div>

      <button
        onClick={onClose}
        className="mt-5 w-full rounded-xl bg-surface-container-highest px-4 py-2.5 font-headline text-sm font-bold text-on-surface spring-active hover:shadow-ambient transition-shadow"
      >
        {t("done")}
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger = false,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={isPending ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm irregular-border bg-surface-container-lowest p-6 shadow-ambient-lg animate-fade-up">
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
        <p className="mt-2 font-body text-sm text-on-surface-variant">{body}</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-xl bg-surface-container-highest py-3 font-headline text-sm font-bold text-on-surface spring-active"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 rounded-xl py-3 font-headline text-sm font-bold spring-active disabled:opacity-50 ${
              danger ? "bg-error text-on-error" : "bg-primary text-on-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
