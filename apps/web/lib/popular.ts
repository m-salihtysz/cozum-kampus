import type { MapReport } from "./campus";

export type CategoryTrend = { category: string; open: number; delta: number };

const DAY_MS = 86_400_000;

// Open count per category and the change in new reports, this week against the week before (percent).
export function categoryTrends(reports: Pick<MapReport, "category" | "status" | "createdAt">[], now: number, limit = 8): CategoryTrend[] {
  const byCategory = new Map<string, { open: number; recent: number; before: number }>();
  for (const r of reports) {
    const row = byCategory.get(r.category) ?? { open: 0, recent: 0, before: 0 };
    if (r.status !== "cozuldu" && r.status !== "geri_cekildi") row.open++;
    const age = (now - Date.parse(r.createdAt)) / DAY_MS;
    if (age <= 7) row.recent++;
    else if (age <= 14) row.before++;
    byCategory.set(r.category, row);
  }
  return [...byCategory]
    .filter(([, v]) => v.open > 0)
    .map(([category, v]) => ({
      category,
      open: v.open,
      delta: v.before ? Math.round(((v.recent - v.before) / v.before) * 100) : v.recent ? 100 : 0,
    }))
    .sort((a, b) => b.open - a.open)
    .slice(0, limit);
}
