"use client";

import { useState } from "react";
import {
  MilestoneDetailModal,
  type MilestoneDetailData,
} from "./milestone-detail-modal";

/**
 * Wrapper that turns its children into a clickable trigger that opens the
 * milestone detail modal. Use this for one-off milestone displays
 * (FeaturedMilestone, etc.); for lists of rows, use `MilestonesList` which
 * shares a single modal across many rows.
 */
export function MilestoneOpener({
  milestone,
  petName,
  className,
  children,
}: {
  milestone: MilestoneDetailData;
  petName: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      {open && (
        <MilestoneDetailModal
          milestone={milestone}
          petName={petName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
