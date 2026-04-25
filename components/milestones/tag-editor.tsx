"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateMilestoneTags } from "@/lib/actions/milestones";

interface TagEditorProps {
  milestoneId: string;
  tags: string[];
  allTags: string[];
}

export function TagEditor({ milestoneId, tags, allTags }: TagEditorProps) {
  const t = useTranslations("milestones");
  const [currentTags, setCurrentTags] = useState<string[]>(tags);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = input.trim()
    ? allTags
        .filter(
          (tag) =>
            tag.includes(input.trim().toLowerCase()) &&
            !currentTags.includes(tag)
        )
        .slice(0, 5)
    : [];

  function persist(next: string[]) {
    setCurrentTags(next);
    startTransition(() => {
      updateMilestoneTags(milestoneId, next);
    });
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || currentTags.includes(tag)) return;
    const next = [...currentTags, tag];
    setInput("");
    setShowSuggestions(false);
    persist(next);
  }

  function removeTag(tag: string) {
    const next = currentTags.filter((t) => t !== tag);
    persist(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1]);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {currentTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary/10 text-primary px-2.5 py-1 font-label text-xs inline-flex items-center gap-1"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-error transition-colors ml-0.5"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={currentTags.length === 0 ? t("addTag") : ""}
          className="flex-1 min-w-[100px] bg-transparent font-body text-xs text-on-surface placeholder:text-on-surface-variant/50 outline-none py-1"
          disabled={isPending}
        />
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-surface-container rounded-xl shadow-ambient-lg border border-outline-variant/20 overflow-hidden">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(tag);
              }}
              className="w-full text-left px-3 py-2 font-label text-xs text-on-surface hover:bg-surface-container-high transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
