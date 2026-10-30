"use client";

import { useContext, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  ArmchairIcon,
  ArrowRightIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BroomIcon,
  DropIcon,
  FireIcon,
  LightbulbIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ThermometerIcon,
  UsersThreeIcon,
  WheelchairIcon,
  WifiHighIcon,
  WrenchIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { GundemSearch } from "./GundemView";
import type { CategoryTrend } from "@/lib/popular";
import { Slider } from "@/components/ui/Slider";
import { Glass } from "@/components/ui/Glass";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { floorLabel, relativeTime, type MapReport } from "@/lib/campus";
import { categoryLabel, urgencyLabel } from "@/lib/labels";
import { statusMeta } from "@/lib/status";

export type PopularReport = MapReport & { buildingName: string | null };
export type PopularStats = { open: number; resolvedWeek: number; avgDays: number | null };

const days = (n: number | null) => (n == null ? "–" : `${n.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} gün`);
const lower = (s: string) => s.toLocaleLowerCase("tr");

// Each category gets its own natural-toned gradient and icon, so the cards read like photos without needing any.
const THEMES: Record<string, { gradient: string; icon: ComponentType<IconProps> }> = {
  aydinlatma: { gradient: "from-[#5f6a2a] to-[#3f5128]", icon: LightbulbIcon },
  su_tesisat: { gradient: "from-[#24666d] to-[#1a4a53]", icon: DropIcon },
  asansor_erisilebilirlik: { gradient: "from-[#2d6a45] to-[#1f4a33]", icon: WheelchairIcon },
  internet_ag: { gradient: "from-[#245a68] to-[#1b3f52]", icon: WifiHighIcon },
  temizlik: { gradient: "from-[#4f6f2c] to-[#38501f]", icon: BroomIcon },
  mobilya: { gradient: "from-[#6b5230] to-[#4a3a22]", icon: ArmchairIcon },
  isitma_sogutma: { gradient: "from-[#8a5530] to-[#5e3a22]", icon: ThermometerIcon },
  guvenlik: { gradient: "from-[#2f4d6a] to-[#223a52]", icon: ShieldCheckIcon },
  diger: { gradient: "from-[#45624f] to-[#31483a]", icon: WrenchIcon },
};
const themeOf = (category: string) => THEMES[category] ?? THEMES.diger;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Glass className="flex flex-1 flex-col gap-1 px-3 py-3 sm:px-5 sm:py-4">
      <span className="text-xs text-muted sm:text-sm">{label}</span>
      <span className="text-xl font-semibold tracking-tight sm:text-3xl">{value}</span>
    </Glass>
  );
}

function Card({ report, rank, max, now }: { report: PopularReport; rank: number; max: number; now: Date }) {
  const place = [report.buildingName, floorLabel(report.floor)].filter(Boolean).join(" · ");
  const { gradient } = themeOf(report.category);
  const heat = Math.max(8, Math.round((report.voteCount / max) * 100));
  return (
    <article
      aria-label={`${rank}. ${report.title}`}
      className={`relative flex h-[300px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} p-5 text-white shadow-[0_14px_34px_rgba(31,74,51,0.22)] transition-transform duration-300 motion-safe:hover:-translate-y-1`}
    >
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink">
          <FireIcon size={12} weight="fill" aria-hidden />#{rank}
        </span>
        <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium">{categoryLabel(report.category)}</span>
        {report.urgency === "acil" && <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold">{urgencyLabel(report.urgency)}</span>}
      </div>
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-[22px] leading-7 font-semibold">{report.title}</h3>
          <p className="flex items-center gap-1 text-sm text-white/90">
            <MapPinIcon size={14} aria-hidden />
            <span className="truncate">{place || "Konum belirtilmedi"}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{relativeTime(report.createdAt, now)}</span>
          </p>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/25" aria-hidden>
          <div className="h-full rounded-full bg-white" style={{ width: `${heat}%` }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-lg font-semibold">
              <UsersThreeIcon size={18} aria-hidden />
              {report.voteCount}
              <span className="text-sm font-normal text-white/90">kişi bildirdi</span>
            </span>
            <span className="mt-1 w-fit rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium">{statusMeta(report.status).label}</span>
          </div>
          <Link
            href={`/?bildirim=${report.id}`}
            aria-label={`Haritada gör: ${report.title}`}
            className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 after:absolute after:inset-0 after:rounded-[26px] after:content-[''] hover:scale-105"
          >
            <ArrowRightIcon size={20} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

function TrendCard({ trend, onPick }: { trend: CategoryTrend; onPick: (category: string) => void }) {
  const { gradient, icon: CategoryIcon } = themeOf(trend.category);
  const up = trend.delta >= 0;
  const Arrow = up ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <button
      type="button"
      onClick={() => onPick(trend.category)}
      aria-label={`${categoryLabel(trend.category)} şikayetlerini göster`}
      className={`focus-ring relative flex h-[176px] w-full flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-b ${gradient} p-4 text-left text-white shadow-[0_12px_28px_rgba(31,74,51,0.2)] transition-transform duration-300 motion-safe:hover:-translate-y-1`}
    >
      <CategoryIcon aria-hidden size={92} weight="duotone" className="absolute -right-3 -bottom-3 text-white/15" />
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur">
        <CategoryIcon size={18} aria-hidden />
      </span>
      <div className="relative flex flex-col gap-1.5">
        <p className="font-semibold">{categoryLabel(trend.category)}</p>
        <p className="text-sm text-white/80">{trend.open} açık bildirim</p>
        <span className="flex w-fit items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur">
          <Arrow size={12} weight="bold" aria-hidden />%{Math.abs(trend.delta)}
          <span className="sr-only">{up ? "artış" : "azalış"}</span>
        </span>
      </div>
    </button>
  );
}

export function PopularComplaints({
  reports,
  recentlyResolved,
  stats,
  trends = [],
}: {
  reports: PopularReport[];
  recentlyResolved: PopularReport[];
  stats: PopularStats;
  trends?: CategoryTrend[];
}) {
  const [now] = useState(() => new Date());
  const [category, setCategory] = useState("");
  const query = lower(useContext(GundemSearch).trim());
  // A category card narrows the complaint cards above to that category and scrolls back up to them.
  const pickCategory = (c: string) => {
    setCategory(c);
    document.getElementById("populer-kartlar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const categories = [...new Set(reports.map((r) => r.category))];
  const matches = (r: PopularReport) =>
    !query || lower(`${r.title} ${r.description} ${r.buildingName ?? ""} ${categoryLabel(r.category)}`).includes(query);
  const shown = reports.filter((r) => (!category || r.category === category) && matches(r));
  const max = Math.max(1, ...reports.map((r) => r.voteCount));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Kampüs özeti">
        <Stat label="Açık bildirim" value={String(stats.open)} />
        <Stat label="Bu hafta çözülen" value={String(stats.resolvedWeek)} />
        <Stat label="Ortalama çözüm süresi" value={days(stats.avgDays)} />
      </div>

      <section id="populer-kartlar" aria-label="Popüler şikayetler" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Kategori filtresi">
          {["", ...categories].map((c) => (
            <button
              key={c || "hepsi"}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`t focus-ring rounded-full border px-3 py-1.5 text-sm font-medium ${
                category === c ? "border-ink bg-ink text-white" : "border-hairline bg-white text-muted hover:bg-tint"
              }`}
            >
              {c ? categoryLabel(c) : "Hepsi"}
            </button>
          ))}
        </div>
        {shown.length ? (
          <Slider key={category} label="Popüler şikayet kartları" title={<h2 className="text-xl font-semibold">En çok bildirilenler</h2>}>
            {shown.map((r) => (
              <Card key={r.id} report={r} rank={reports.indexOf(r) + 1} max={max} now={now} />
            ))}
          </Slider>
        ) : (
          <EmptyState
            icon={<FireIcon size={24} aria-hidden />}
            title={query ? "Aramana uyan şikayet yok" : "Henüz popüler şikayet yok"}
            hint={query ? "Başka bir kelime dene ya da kategori filtresini kaldır." : "Bildirimler oy aldıkça burada görünür."}
          />
        )}
      </section>

      {trends.length > 0 && (
        <section aria-label="Yükselen kategoriler">
          <Slider
            label="Yükselen kategoriler"
            autoplay={false}
            itemClass="w-[44%] sm:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)]"
            title={<h2 className="text-xl font-semibold">Kategorilere göre</h2>}
          >
            {trends.map((tr) => (
              <TrendCard key={tr.category} trend={tr} onPick={pickCategory} />
            ))}
          </Slider>
        </section>
      )}

      {recentlyResolved.length > 0 && (
        <section aria-label="Son çözülenler" className="flex flex-col gap-3">
          <Slider
            label="Son çözülenler"
            autoplay={false}
            itemClass="w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            title={<h2 className="text-xl font-semibold">Son çözülenler</h2>}
          >
            {recentlyResolved.map((r) => (
              <Glass key={r.id} className="relative flex h-full flex-col gap-2 border-l-4 !border-l-status-cozuldu-fg p-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-tint px-2 py-1 text-xs font-medium">{categoryLabel(r.category)}</span>
                  <StatusPill status="cozuldu" />
                </div>
                <Link
                  href={`/?bildirim=${r.id}`}
                  className="focus-ring font-medium after:absolute after:inset-0 after:rounded-3xl after:content-['']"
                >
                  {r.title}
                </Link>
                <p className="text-sm text-muted">
                  {r.resolvedAt ? relativeTime(r.resolvedAt, now) : ""} · {r.voteCount} kişi bildirmişti
                </p>
              </Glass>
            ))}
          </Slider>
        </section>
      )}
    </div>
  );
}
