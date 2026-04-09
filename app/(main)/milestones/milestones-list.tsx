"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import { formatDate, daysUntil } from "@/lib/utils";
import {
  MilestoneDetailModal,
  type MilestoneDetailData,
} from "./milestone-detail-modal";

export type MilestoneListItem = MilestoneDetailData & {
  // No extra fields needed today; alias for clarity at call sites.
};

export function MilestonesList({
  milestones,
  petName,
}: {
  milestones: MilestoneListItem[];
  petName: string;
}) {
  const t = useTranslations("milestones");
  const tShare = useTranslations("milestoneShare");
  const [openId, setOpenId] = useState<string | null>(null);

  const open = milestones.find((m) => m.id === openId) ?? null;

  return (
    <>
      <div className="space-y-3">
        {milestones.map((milestone) => {
          const days = milestone.targetDate
            ? daysUntil(milestone.targetDate)
            : 0;
          return (
            <div
              key={milestone.id}
              className="group flex items-center gap-3 p-4 bg-surface-container-lowest irregular-border-sm shadow-ambient transition-transform duration-300"
            >
              <button
                onClick={() => setOpenId(milestone.id)}
                className="flex flex-1 items-center gap-4 min-w-0 text-left spring-active hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-2xl shrink-0">{milestone.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-sm font-bold text-on-surface truncate">
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="font-body text-xs text-on-surface-variant truncate">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-label text-xs text-primary font-bold">
                    {days > 0 ? t("daysShort", { days }) : t("todayLabel")}
                  </p>
                  <p className="font-label text-[10px] text-outline">
                    {milestone.targetDate
                      ? formatDate(milestone.targetDate)
                      : ""}
                  </p>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenId(milestone.id);
                }}
                className="shrink-0 rounded-full p-2 text-on-surface-variant/60 hover:bg-primary/10 hover:text-primary transition-colors spring-active"
                aria-label={tShare("shareMilestone")}
                title={tShare("shareMilestone")}
              >
                <Icon name="share" className="text-lg" />
              </button>
            </div>
          );
        })}
      </div>

      {open && (
        <MilestoneDetailModal
          milestone={open}
          petName={petName}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
