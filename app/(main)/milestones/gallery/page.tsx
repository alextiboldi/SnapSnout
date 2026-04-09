import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icon";
import { requireSession } from "@/lib/auth/session";
import { getActivePetForMember } from "@/lib/queries/pets";
import { getPhotosForPet } from "@/lib/queries/photos";
import { formatDate } from "@/lib/utils";

export default async function MilestoneGalleryPage() {
  const session = await requireSession();

  const [activePet, t] = await Promise.all([
    getActivePetForMember(session.family.id, session.member.id),
    getTranslations("milestones"),
  ]);

  if (!activePet) {
    return (
      <div className="animate-fade-up mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
        <Icon name="photo_library" filled className="text-6xl text-primary/40" />
        <h1 className="mt-4 font-headline text-2xl font-bold text-on-surface">
          {t("noActivePet")}
        </h1>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          {t("noActivePetDesc")}
        </p>
      </div>
    );
  }

  const photos = await getPhotosForPet(activePet.id);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between animate-fade-up">
        <div className="min-w-0">
          <Link
            href="/milestones"
            className="inline-flex items-center gap-1.5 font-label text-[11px] font-medium tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-base" />
            {t("title")}
          </Link>
          <h1 className="mt-1 font-headline text-2xl md:text-3xl font-bold text-on-surface">
            {t("galleryTitle")}
          </h1>
          <p className="mt-0.5 font-body text-sm text-on-surface-variant">
            {t("galleryCount", { count: photos.length, name: activePet.name })}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 via-secondary-fixed/30 to-tertiary/20 overflow-hidden shadow-ambient">
          {activePet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activePet.photoUrl}
              alt={activePet.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon name="pets" filled className="text-2xl text-primary/70" />
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <div
          className="irregular-border bg-surface-container-low p-10 text-center shadow-ambient animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon name="photo_camera" filled className="text-4xl text-primary/70" />
          </div>
          <h2 className="mt-4 font-headline text-lg font-bold text-on-surface">
            {t("galleryEmpty")}
          </h2>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            {t("galleryEmptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <figure
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low shadow-ambient animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? activePet.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="truncate font-body text-xs text-white/90">
                  {photo.caption || formatDate(photo.capturedDate)}
                </span>
                {photo.isMonthlyPhoto && (
                  <span className="shrink-0 rounded-full bg-secondary-fixed px-2 py-0.5 font-label text-[10px] font-bold text-on-secondary-fixed">
                    {photo.monthNumber ? `M${photo.monthNumber}` : "M"}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
