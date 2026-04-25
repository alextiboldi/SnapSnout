"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { addMonthlyPhoto } from "@/lib/actions/photos";
import { Icon } from "@/components/icon";

type MonthlyPhoto = {
  id: string;
  url: string;
  monthNumber: number | null;
  capturedDate: Date;
  caption: string | null;
  uploader: { name: string | null } | null;
};

type Props = {
  photos: MonthlyPhoto[];
  petId: string;
  petName: string;
  currentMonth: number;
};

export function MonthlyTimeline({
  photos,
  petId,
  petName,
  currentMonth,
}: Props) {
  const t = useTranslations("monthlyPhotos");
  const [isPending, startTransition] = useTransition();

  const photoMap = new Map(
    photos.map((p) => [p.monthNumber, p])
  );

  function handleFileSelect(monthNumber: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      await addMonthlyPhoto(petId, monthNumber, formData);
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: currentMonth }, (_, i) => i + 1).map(
        (monthNum) => {
          const photo = photoMap.get(monthNum);
          const isFuture = monthNum > currentMonth;

          if (photo) {
            return (
              <div
                key={monthNum}
                className="relative aspect-square overflow-hidden rounded-[20px] bg-surface-container-lowest shadow-clay"
              >
                <img
                  src={photo.url}
                  alt={`${petName} ${t("month", { n: monthNum })}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 font-label text-[10px] font-bold text-on-primary">
                  M{monthNum}
                </span>
                {photo.uploader?.name && (
                  <span className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-0.5 font-label text-[10px] text-white">
                    {t("by", { name: photo.uploader.name })}
                  </span>
                )}
              </div>
            );
          }

          if (isFuture) {
            return (
              <div
                key={monthNum}
                className="flex aspect-square flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/50"
              >
                <span className="font-label text-xs font-medium text-on-surface-variant/40">
                  M{monthNum}
                </span>
                <p className="mt-1 font-body text-[10px] text-on-surface-variant/30">
                  {t("future")}
                </p>
              </div>
            );
          }

          return (
            <label
              key={monthNum}
              className={`spring-active group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-primary/30 bg-surface-container-lowest shadow-clay transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-ambient-lg ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(monthNum, file);
                }}
              />
              <span className="rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                <Icon
                  name="photo_camera"
                  filled
                  className="text-xl text-primary"
                />
              </span>
              <span className="mt-2 font-label text-xs font-bold text-primary">
                M{monthNum}
              </span>
              <span className="mt-0.5 font-body text-[10px] text-on-surface-variant">
                {t("addPhoto")}
              </span>
            </label>
          );
        }
      )}
    </div>
  );
}
