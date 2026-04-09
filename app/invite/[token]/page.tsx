import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/server";
import { validateInvite, previewAcceptInvite } from "@/lib/actions/family";
import { AcceptInviteButton } from "./accept-invite-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("inviteAccept");

  const validation = await validateInvite(token);

  if (validation.status !== "valid") {
    return (
      <Shell>
        <ErrorState status={validation.status} t={t} />
      </Shell>
    );
  }

  // Check auth state.
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    // Logged out — punt to signup with the token + email prefill.
    const params = new URLSearchParams({ invite: token });
    if (validation.invite.email) params.set("email", validation.invite.email);
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon name="diversity_3" filled className="text-4xl text-primary" />
          </div>
          <h1 className="mt-5 font-headline text-3xl font-bold tracking-tight text-on-surface">
            {t("invitedTitle", { family: validation.familyName })}
          </h1>
          <p className="mt-3 font-body text-sm text-on-surface-variant">
            {t("invitedDescLoggedOut")}
          </p>
          <Link
            href={`/signup?${params.toString()}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-headline text-sm font-bold text-on-primary shadow-ambient hover:shadow-ambient-lg transition-shadow"
          >
            <Icon name="arrow_forward" className="text-base" />
            {t("createAccountToJoin")}
          </Link>
          <p className="mt-4 font-body text-xs text-on-surface-variant/70">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`/login?invite=${token}`}
              className="font-bold text-tertiary hover:underline"
            >
              {t("logIn")}
            </Link>
          </p>
        </div>
      </Shell>
    );
  }

  // Logged in — preview what will happen and show a confirmation card.
  let preview;
  try {
    preview = await previewAcceptInvite(token);
  } catch {
    return (
      <Shell>
        <ErrorState status="not_found" t={t} />
      </Shell>
    );
  }

  if (preview.status === "already_member") {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary/10">
            <Icon name="check_circle" filled className="text-4xl text-tertiary" />
          </div>
          <h1 className="mt-5 font-headline text-2xl font-bold text-on-surface">
            {t("alreadyMemberTitle", { family: validation.familyName })}
          </h1>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            {t("alreadyMemberDesc")}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary shadow-ambient"
          >
            {t("goHome")}
          </Link>
        </div>
      </Shell>
    );
  }

  if (preview.status === "blocked_owner") {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <Icon name="block" className="text-4xl text-error" />
          </div>
          <h1 className="mt-5 font-headline text-2xl font-bold text-on-surface">
            {t("blockedOwnerTitle")}
          </h1>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            {t("blockedOwnerDesc")}
          </p>
          <Link
            href="/settings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-6 py-3 font-headline text-sm font-bold text-on-surface"
          >
            {t("goSettings")}
          </Link>
        </div>
      </Shell>
    );
  }

  // status === "ready"
  return (
    <Shell>
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Icon name="diversity_3" filled className="text-4xl text-primary" />
        </div>
        <h1 className="mt-5 font-headline text-3xl font-bold tracking-tight text-on-surface">
          {t("joinTitle", { family: validation.familyName })}
        </h1>
        <p className="mt-3 font-body text-sm text-on-surface-variant">
          {t("joinDesc")}
        </p>

        {preview.destructive && (
          <div className="mt-5 rounded-2xl border-2 border-dashed border-error/30 bg-error/5 p-4 text-left">
            <div className="flex items-start gap-3">
              <Icon name="warning" filled className="text-xl text-error shrink-0 mt-0.5" />
              <div>
                <p className="font-headline text-sm font-bold text-error">
                  {t("warningTitle")}
                </p>
                <p className="mt-1 font-body text-xs text-on-surface-variant leading-relaxed">
                  {t("warningBody", {
                    current: preview.currentFamilyName,
                    pets: preview.currentFamilyPetCount,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <AcceptInviteButton
          token={token}
          confirmLabel={t("joinButton")}
          loadingLabel={t("joining")}
          cancelLabel={t("cancel")}
          destructive={preview.destructive}
        />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-clay blueprint-grid flex items-center justify-center p-6">
      <div className="w-full max-w-md irregular-border bg-surface-container-lowest p-8 md:p-10 shadow-ambient-lg animate-fade-up">
        {children}
      </div>
    </div>
  );
}

function ErrorState({
  status,
  t,
}: {
  status: "expired" | "revoked" | "accepted" | "not_found";
  t: (key: string) => string;
}) {
  const titleKey = `error_${status}_title`;
  const bodyKey = `error_${status}_body`;
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <Icon name="error" filled className="text-4xl text-error" />
      </div>
      <h1 className="mt-5 font-headline text-2xl font-bold text-on-surface">
        {t(titleKey)}
      </h1>
      <p className="mt-2 font-body text-sm text-on-surface-variant">
        {t(bodyKey)}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-6 py-3 font-headline text-sm font-bold text-on-surface"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
