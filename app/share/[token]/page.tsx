import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icon";
import { prisma } from "@/lib/prisma";
import { formatDate, isTranslationKey } from "@/lib/utils";

type SharedMilestone = NonNullable<
  Awaited<ReturnType<typeof loadShare>>
>;

async function loadShare(token: string) {
  const share = await prisma.milestoneShare.findUnique({
    where: { token },
    include: {
      milestone: {
        include: {
          pet: { select: { name: true, species: true, photoUrl: true } },
        },
      },
    },
  });
  if (!share || share.revokedAt) return null;
  return share;
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  horse: "🐴",
  other: "🐾",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await loadShare(token);
  if (!share) {
    return {
      title: "SnapSnout",
      description: "A pet milestone keeper.",
    };
  }

  const { milestone } = share;
  const petName = milestone.pet.name;
  const title = `${milestone.title} — ${petName}`;
  const description =
    milestone.description?.slice(0, 200) ||
    `${petName}'s milestone on SnapSnout`;
  const image = milestone.photoUrl || milestone.pet.photoUrl || "/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "article",
      siteName: "SnapSnout",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await loadShare(token);
  const t = await getTranslations("share");
  const tPresets = await getTranslations("presets");

  if (!share) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <Icon name="link_off" className="text-3xl text-error" />
          </div>
          <h1 className="mt-5 font-headline text-2xl font-bold text-on-surface">
            {t("unavailableTitle")}
          </h1>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            {t("unavailableBody")}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary"
          >
            {t("goHome")}
          </Link>
          <Footer t={t} />
        </div>
      </Shell>
    );
  }

  return <SharedMilestoneCard share={share} t={t} tPresets={tPresets} />;
}

function SharedMilestoneCard({
  share,
  t,
  tPresets,
}: {
  share: SharedMilestone;
  t: Awaited<ReturnType<typeof getTranslations<"share">>>;
  tPresets: Awaited<ReturnType<typeof getTranslations<"presets">>>;
}) {
  const { milestone } = share;
  const pet = milestone.pet;
  const date = milestone.completedDate ?? milestone.targetDate;

  // Resolve preset translation keys to localized strings
  const title = isTranslationKey(milestone.title)
    ? tPresets(milestone.title.replace("presets.", ""))
    : milestone.title;
  const description =
    milestone.description && isTranslationKey(milestone.description)
      ? tPresets(milestone.description.replace("presets.", ""))
      : milestone.description;

  return (
    <Shell>
      {/* Pet chip */}
      <div className="mb-5 flex items-center justify-center gap-2">
        <span className="text-base">{SPECIES_EMOJI[pet.species] ?? "🐾"}</span>
        <span className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          {pet.name}
        </span>
      </div>

      {/* Hero photo */}
      {milestone.photoUrl ? (
        <div className="-mx-8 -mt-10 mb-6 md:-mx-10 md:-mt-12 overflow-hidden rounded-t-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={milestone.photoUrl}
            alt={title}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : (
        <div className="-mx-8 -mt-10 mb-6 md:-mx-10 md:-mt-12 flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary-container via-secondary-fixed-dim to-tertiary-container rounded-t-[18px]">
          <span className="text-7xl">{milestone.emoji}</span>
        </div>
      )}

      {/* Title + emoji */}
      <div className="text-center">
        <span className="text-4xl">{milestone.emoji}</span>
        <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          {title}
        </h1>
        {date && (
          <p className="mt-2 font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {formatDate(date)}
          </p>
        )}
      </div>

      {/* Description + notes */}
      {(description || milestone.notes) && (
        <div className="mt-6 space-y-3">
          {description && (
            <p className="font-body text-sm leading-relaxed text-on-surface md:text-base">
              {description}
            </p>
          )}
          {milestone.notes && (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container/40 p-4">
              <p className="font-body text-sm italic leading-relaxed text-on-surface-variant">
                &ldquo;{milestone.notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      <Footer t={t} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <article className="w-full max-w-md irregular-border bg-surface-container-lowest p-8 md:p-10 shadow-ambient-lg animate-fade-up">
        {children}
      </article>
    </div>
  );
}

function Footer({ t }: { t: Awaited<ReturnType<typeof getTranslations<"share">>> }) {
  return (
    <div className="mt-10 border-t border-outline-variant/20 pt-5 text-center">
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
        {t("madeWith")}
      </p>
      <Link
        href="/signup"
        className="mt-2 inline-flex items-center gap-1.5 font-headline text-sm font-bold text-primary hover:underline"
      >
        {t("signUpCta")}
        <Icon name="arrow_forward" className="text-sm" />
      </Link>
    </div>
  );
}
