import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import { getActivePetForMember } from "@/lib/queries/pets";
import { getMonthlyPhotosForPet } from "@/lib/queries/photos";
import { Icon } from "@/components/icon";
import { MonthlyTimeline } from "@/components/milestones/monthly-timeline";

export default async function MonthlyPhotosPage() {
  const session = await requireSession();
  const t = await getTranslations("monthlyPhotos");
  const activePet = await getActivePetForMember(
    session.family.id,
    session.member.id
  );

  if (!activePet) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <Icon name="pets" filled className="text-5xl text-primary/40" />
        <p className="mt-4 font-body text-sm text-on-surface-variant">
          {t("noPhotosYet")}
        </p>
      </div>
    );
  }

  const photos = await getMonthlyPhotosForPet(activePet.id);
  const monthsHome =
    Math.floor(
      (Date.now() - new Date(activePet.gotchaDay).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    ) + 1;
  const currentMonth = Math.min(Math.max(monthsHome, 1), 24);

  return (
    <div className="mx-auto max-w-lg pb-10">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <Link
          href="/milestones"
          className="spring-active flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low shadow-ambient transition-shadow hover:shadow-ambient-lg"
        >
          <Icon name="arrow_back" className="text-lg text-on-surface" />
        </Link>
        <div>
          <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {t("title")}
          </h1>
          <p className="font-body text-xs text-on-surface-variant">
            {t("subtitle", { name: activePet.name })}
          </p>
        </div>
      </div>

      <div className="mt-4 px-5">
        <MonthlyTimeline
          photos={photos}
          petId={activePet.id}
          petName={activePet.name}
          currentMonth={currentMonth}
        />
      </div>
    </div>
  );
}
