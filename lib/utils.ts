// Pure utility functions — usable on both server and client

export type MilestoneStatus = "completed" | "today" | "upcoming";

export function getMilestoneStatus(milestone: {
  targetDate: Date | null;
  completedDate: Date | null;
}): MilestoneStatus {
  if (milestone.completedDate) return "completed";
  if (!milestone.targetDate) return "upcoming";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(milestone.targetDate);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export function getAge(dob: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30.44);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const remainingDays = days - Math.floor(months * 30.44);

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  }
  if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""}, ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
  }
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
