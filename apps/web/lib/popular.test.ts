import { describe, expect, it } from "vitest";
import { categoryTrends } from "./popular";

const NOW = Date.parse("2026-10-28T12:00:00Z");
const ago = (days: number) => new Date(NOW - days * 86_400_000).toISOString();
const r = (category: string, createdDays: number, status: "alindi" | "cozuldu" = "alindi") => ({ category, status, createdAt: ago(createdDays) });

describe("categoryTrends", () => {
  it("counts open reports and compares this week with the previous one", () => {
    const trends = categoryTrends([r("aydinlatma", 1), r("aydinlatma", 2), r("aydinlatma", 9), r("temizlik", 3), r("temizlik", 4, "cozuldu")], NOW);
    expect(trends).toEqual([
      { category: "aydinlatma", open: 3, delta: 100 },
      { category: "temizlik", open: 1, delta: 100 },
    ]);
  });

  it("reports a drop and skips categories with nothing open", () => {
    const trends = categoryTrends([r("mobilya", 1), r("mobilya", 8), r("mobilya", 9), r("guvenlik", 2, "cozuldu")], NOW);
    expect(trends).toEqual([{ category: "mobilya", open: 3, delta: -50 }]);
  });
});
