"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, HammerIcon, SealCheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Glass } from "@/components/ui/Glass";
import { Slider } from "@/components/ui/Slider";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, Filters, Kpis } from "@/components/admin-demo/ui";
import s from "@/components/admin-demo/admin.module.css";
import { TARGET_DAYS, isOverdue } from "@/lib/admin";
import { relativeTime } from "@/lib/campus";
import { categoryLabel, urgencyLabel } from "@/lib/labels";
import { isOpen } from "@/lib/my-reports";
import { statusMeta } from "@/lib/status";
import type { AdminData, PanelReport } from "./types";

const TABS = ["Devam eden", "Tamamlanan"] as const;
type Tab = (typeof TABS)[number];
const DAY_MS = 86_400_000;
const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
const span = (from: string, to: string | number | Date) => (new Date(to).getTime() - new Date(from).getTime()) / DAY_MS;
const fmt = (d: number) => (d < 1 ? `${Math.max(1, Math.round(d * 24))} sa` : `${(Math.round(d * 10) / 10).toLocaleString("tr-TR")} gün`);

// Work log for the admin: what is being worked on, and what has been done, by whom and how fast.
export function WorkTrackingView({ data, assignees, now: nowProp }: { data: AdminData; assignees: Record<number, string>; now?: number }) {
  const [now] = useState(() => new Date(nowProp ?? Date.now()));
  const [tab, setTab] = useState<Tab>("Devam eden");
  const [unitId, setUnitId] = useState<number | null>(null);
  const unitName = new Map(data.units.map((u) => [u.id, u.name]));
  const unverified = new Set(data.unverified);

  const inUnit = (r: PanelReport) => unitId == null || r.unitId === unitId;
  const ongoing = data.reports.filter((r) => isOpen(r.status) && r.unitId != null && inUnit(r));
  const done = data.reports
    .filter((r) => r.status === "cozuldu" && r.resolvedAt && inUnit(r))
    .sort((a, b) => Date.parse(b.resolvedAt!) - Date.parse(a.resolvedAt!));
  const weekAgo = now.getTime() - 7 * DAY_MS;
  const doneWeek = done.filter((r) => Date.parse(r.resolvedAt!) >= weekAgo);
  const durations = done.map((r) => span(r.createdAt, r.resolvedAt!));
  const onTime = done.filter((r) => span(r.createdAt, r.resolvedAt!) <= TARGET_DAYS[r.urgency]).length;
  const working = ongoing.filter((r) => r.status === "islemde" || r.status === "yeniden_acildi").length;

  const rows = tab === "Devam eden" ? ongoing : done;

  return (
    <>
      <PageHeader title="İş takibi" description="Birimlerin üzerinde çalıştığı ve tamamladığı işler, kimin yaptığı ve ne kadar sürdüğü." />
      <Kpis
        items={[
          { label: "Devam eden iş", accessibleLabel: "Devam eden iş sayısı", value: ongoing.length, hint: `${working} tanesi sahada` },
          { label: "Bu hafta tamamlanan", accessibleLabel: "Bu hafta tamamlanan sayısı", value: doneWeek.length, hint: "Son 7 gün" },
          { label: "Ortalama süre", value: durations.length ? fmt(durations.reduce((a, b) => a + b, 0) / durations.length) : "–", hint: "Bildirimden çözüme" },
          { label: "Zamanında", value: done.length ? `%${Math.round((onTime / done.length) * 100)}` : "–", hint: "Hedef süre içinde kapanan" },
        ]}
      />

      {doneWeek.length > 0 && (
        <Slider
          label="Bu hafta tamamlananlar"
          title={<h2 className="text-xl font-semibold">Bu hafta tamamlananlar</h2>}
          itemClass="w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
        >
          {doneWeek.slice(0, 9).map((r) => (
            <Glass key={r.id} className="flex h-full flex-col gap-2 border-l-4 !border-l-status-cozuldu-fg p-4">
              <div className="flex items-center justify-between gap-2">
                <span className={s.badge}>{unitName.get(r.unitId ?? -1) ?? "Birim yok"}</span>
                <span className="mono text-xs text-muted">#{r.id}</span>
              </div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-muted">
                {assignees[r.id] ?? "Atama kaydı yok"} · {fmt(span(r.createdAt, r.resolvedAt!))} sürdü
              </p>
              <p className="mt-auto flex items-center gap-1 text-xs text-muted">
                <CheckCircleIcon size={14} aria-hidden /> {relativeTime(r.resolvedAt!, now)} çözüldü
              </p>
            </Glass>
          ))}
        </Slider>
      )}

      <Glass className={s.toolbar}>
        <Filters label="İş durumu" options={[...TABS]} value={tab} onChange={(v) => setTab(v as Tab)} />
        <select className={`${s.input} !w-auto max-w-full`} aria-label="Birim filtresi" value={unitId ?? ""} onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Tüm birimler</option>
          {data.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <span role="status" className={`${s.small} ml-auto`}>{rows.length} iş</span>
      </Glass>

      <Glass className={s.panel}>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col">İş</th>
                  <th scope="col">Birim</th>
                  <th scope="col">Teknisyen</th>
                  <th scope="col">{tab === "Devam eden" ? "Geçen süre" : "Süre"}</th>
                  <th scope="col">Durum</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const took = span(r.createdAt, r.resolvedAt ?? now);
                  const late = tab === "Devam eden" ? isOverdue(r, now) : took > TARGET_DAYS[r.urgency];
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/yonetim/bildirimler?q=${encodeURIComponent(`#${r.id}`)}`} className="font-medium text-accent hover:underline">
                          #{r.id} {r.title}
                        </Link>
                        <p className={s.small}>
                          {categoryLabel(r.category)} · {urgencyLabel(r.urgency)} · {r.resolvedAt ? `${DATE.format(new Date(r.resolvedAt))} tarihinde çözüldü` : `${relativeTime(r.createdAt, now)} açıldı`}
                        </p>
                      </td>
                      <td>{unitName.get(r.unitId ?? -1) ?? "–"}</td>
                      <td>{assignees[r.id] ?? <span className="text-muted">Atanmadı</span>}</td>
                      <td>
                        <span className="mono inline-flex items-center gap-1">
                          <ClockIcon size={14} aria-hidden />
                          {fmt(took)}
                        </span>
                        {late && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-danger">
                            <WarningCircleIcon size={14} aria-hidden />
                            {tab === "Devam eden" ? "Gecikmiş" : "Hedefi aştı"}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="flex flex-wrap items-center gap-1">
                          <Badge>{statusMeta(r.status).label}</Badge>
                          {tab === "Tamamlanan" &&
                            (unverified.has(r.id) ? (
                              <Badge>Doğrulanmadı</Badge>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-status-cozuldu-fg">
                                <SealCheckIcon size={14} aria-hidden />
                                Doğrulandı
                              </span>
                            ))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<HammerIcon size={22} aria-hidden />}
            title={tab === "Devam eden" ? "Devam eden iş yok." : "Henüz tamamlanan iş yok."}
            hint={tab === "Devam eden" ? "Bir birime yönlendirilen bildirimler burada görünür." : "Birimler işleri çözüldü yaptıkça burada listelenir."}
          />
        )}
      </Glass>
    </>
  );
}
