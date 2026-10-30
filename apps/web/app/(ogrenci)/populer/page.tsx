import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PopularComplaints, type PopularReport, type PopularStats } from "@/components/popular/PopularComplaints";
import { GundemView } from "@/components/popular/GundemView";
import { Suggestions } from "../oneriler/Suggestions";
import { categoryTrends } from "@/lib/popular";
import { toMapReport, type ReportRow } from "@/lib/campus";
import { FAKE_POPULAR, previewEnabled } from "@/lib/preview-fixtures";
import { createServerClient, getAuthUser } from "@/lib/supabase/server";

const DAY_MS = 86_400_000;
const COVER_URL_TTL_S = 60 * 60;
const POPULAR_LIMIT = 9;
const nowMs = () => Date.now();
const sinceWeek = () => nowMs() - 7 * DAY_MS;

async function Gundem({ searchParams }: Pick<PageProps<"/populer">, "searchParams">) {
  const { sekme } = await searchParams;
  const supabase = await createServerClient();
  const user = await getAuthUser(supabase);
  if (!user) return null;

  const [reports, buildings] = await Promise.all([
    supabase
      .from("public_reports")
      .select(
        "id, reporter_id, title, description, category, urgency, status, unit_id, building_id, floor, lat, lng, ai_summary, vote_count, created_at, resolved_at, cover_path",
      )
      .neq("status", "geri_cekildi")
      .order("vote_count", { ascending: false })
      .limit(300),
    supabase.from("building_points").select("id, name"),
  ]);

  const rows = reports.data ?? [];
  const paths = rows.map((r) => r.cover_path).filter((p): p is string => !!p);
  const signed = paths.length
    ? ((await supabase.storage.from("report-media").createSignedUrls(paths, COVER_URL_TTL_S)).data ?? [])
    : [];
  const urlByPath = new Map(signed.map((x) => [x.path, x.signedUrl]));
  const buildingName = new Map((buildings.data ?? []).map((b) => [b.id as number, b.name as string]));

  let all: PopularReport[] = rows.map((r) => {
    const m = toMapReport(r as ReportRow, r.cover_path ? (urlByPath.get(r.cover_path) ?? null) : null);
    return { ...m, buildingName: m.buildingId != null ? (buildingName.get(m.buildingId) ?? null) : null };
  });
  if (previewEnabled()) all = [...all, ...FAKE_POPULAR];

  const open = all.filter((r) => r.status !== "cozuldu");
  const resolved = all.filter((r) => r.status === "cozuldu" && r.resolvedAt);
  const weekAgo = sinceWeek();
  const spans = resolved.map((r) => (Date.parse(r.resolvedAt!) - Date.parse(r.createdAt)) / DAY_MS);
  const stats: PopularStats = {
    open: open.length,
    resolvedWeek: resolved.filter((r) => Date.parse(r.resolvedAt!) >= weekAgo).length,
    avgDays: spans.length ? Math.round((spans.reduce((a, b) => a + b, 0) / spans.length) * 10) / 10 : null,
  };

  return (
    <GundemView
      initialTab={sekme === "oneriler" ? "Öneriler" : "Şikayetler"}
      suggestions={<Suggestions embedded />}
      complaints={
    <PopularComplaints
      reports={[...open].sort((a, b) => b.voteCount - a.voteCount).slice(0, POPULAR_LIMIT)}
      recentlyResolved={[...resolved].sort((a, b) => Date.parse(b.resolvedAt!) - Date.parse(a.resolvedAt!)).slice(0, 6)}
      stats={stats}
      trends={categoryTrends(all, nowMs())}
    />
      }
    />
  );
}

export default function PopularPage({ searchParams }: PageProps<"/populer">) {
  return (
    <Suspense fallback={<PageSkeleton label="Gündem yükleniyor" variant="list" standalone />}>
      <Gundem searchParams={searchParams} />
    </Suspense>
  );
}
