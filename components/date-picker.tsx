"use client";

import { useEffect, useState } from "react";

/**
 * Custom day/month/year date picker. Works around the native `<input type="date">`
 * quirk where selecting month/year before a day can lock the day field on some
 * browsers. Emits ISO `yyyy-mm-dd` strings via `onChange`, or "" when incomplete.
 */
export function DatePicker({
  value,
  onChange,
  disabled = false,
  maxYear,
  minYear,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxYear?: number;
  minYear?: number;
}) {
  const parse = (v: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return { year: "", month: "", day: "" };
    return { year: m[1], month: m[2], day: m[3] };
  };

  const [{ year, month, day }, setParts] = useState(parse(value));

  useEffect(() => {
    setParts(parse(value));
  }, [value]);

  const currentYear = new Date().getFullYear();
  const top = maxYear ?? currentYear;
  const bottom = minYear ?? currentYear - 40;
  const years: number[] = [];
  for (let y = top; y >= bottom; y--) years.push(y);

  // Day count for the currently-selected month/year. Falls back to 31 when
  // month or year is missing so every day is always selectable.
  const daysInMonth = (() => {
    if (!month) return 31;
    const y = year ? Number(year) : 2000; // leap-safe default
    return new Date(y, Number(month), 0).getDate();
  })();
  const days: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const emit = (next: { year: string; month: string; day: string }) => {
    setParts(next);
    if (next.year && next.month && next.day) {
      // Clamp day to the month's max (handles Feb 30 → Feb 28/29 etc.).
      const maxDay = new Date(Number(next.year), Number(next.month), 0).getDate();
      const clamped = Math.min(Number(next.day), maxDay);
      const dd = String(clamped).padStart(2, "0");
      onChange(`${next.year}-${next.month}-${dd}`);
    } else {
      onChange("");
    }
  };

  const selectClass = `w-full bg-surface-container-lowest irregular-border border border-outline/20 focus:border-primary font-body p-3 md:p-4 transition-all hover:shadow-ambient appearance-none ${
    disabled ? "opacity-50 pointer-events-none" : ""
  }`;

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Day"
        value={day}
        disabled={disabled}
        onChange={(e) => emit({ year, month, day: e.target.value })}
        className={selectClass}
      >
        <option value="">—</option>
        {days.map((d) => (
          <option key={d} value={String(d).padStart(2, "0")}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label="Month"
        value={month}
        disabled={disabled}
        onChange={(e) => emit({ year, month: e.target.value, day })}
        className={selectClass}
      >
        <option value="">—</option>
        {months.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={year}
        disabled={disabled}
        onChange={(e) => emit({ year: e.target.value, month, day })}
        className={selectClass}
      >
        <option value="">—</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
