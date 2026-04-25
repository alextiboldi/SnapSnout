"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface TagFilterProps {
  tags: string[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const t = useTranslations("milestones");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTag = searchParams.get("tag");

  function toggleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("tag") === tag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-label text-xs text-on-surface-variant mr-1">
        {t("filterByTag")}
      </span>
      {tags.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={
              isActive
                ? "bg-primary text-on-primary rounded-full px-3 py-1.5 font-label text-xs font-bold"
                : "bg-surface-container-highest text-on-surface-variant rounded-full px-3 py-1.5 font-label text-xs"
            }
          >
            #{tag}
          </button>
        );
      })}
      {activeTag && (
        <button
          type="button"
          onClick={clearFilter}
          className="font-label text-xs text-primary underline underline-offset-2 ml-1"
        >
          {t("clearFilter")}
        </button>
      )}
    </div>
  );
}
