"use client";

import { createContext, useId, useState, type ReactNode } from "react";
import { MagnifyingGlassIcon, SparkleIcon } from "@phosphor-icons/react";
import { PageContent } from "@/components/layout/PageContent";
import { Tabs, TabPanels } from "@/components/student-demo/Common";
import { HeroLandscape } from "./HeroLandscape";

export const GUNDEM_TABS = ["Şikayetler", "Öneriler"] as const;

// The hero search box filters the complaint cards below it.
export const GundemSearch = createContext("");

// Gündem: the campus agenda in one place. Complaints and suggestions are sibling tabs.
export function GundemView({
  initialTab,
  complaints,
  suggestions,
}: {
  initialTab: (typeof GUNDEM_TABS)[number];
  complaints: ReactNode;
  suggestions: ReactNode;
}) {
  const id = useId();
  const [tab, setTab] = useState<string>(initialTab);
  const [query, setQuery] = useState("");
  return (
    <PageContent>
      <header className="relative overflow-hidden rounded-[28px] border border-[#e1e8d8] p-6 shadow-[0_10px_32px_rgba(40,90,63,0.07)] sm:p-8">
        <HeroLandscape />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#f3f6ec]/95 via-[#f3f6ec]/70 to-[#f3f6ec]/0 sm:bg-gradient-to-r sm:from-[#f3f6ec]/90 sm:via-[#f3f6ec]/45 sm:to-transparent" />
        <div className="relative flex max-w-[560px] flex-col gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <SparkleIcon size={16} weight="fill" className="text-accent" aria-hidden />
            Kampüs gündemi
          </p>
          <h1 className="text-[34px] leading-[40px] font-semibold">Kampüste bugün neler var?</h1>
          <p className="text-base text-muted">En çok bildirilen sorunlar, öğrencilerin önerileri ve yönetimin yanıtları.</p>
          {tab === "Şikayetler" && (
            <label className="mt-2 flex items-center gap-3 rounded-full border border-[#e3e8dc] bg-white px-5 py-3 shadow-[0_6px_20px_rgba(40,90,63,0.08)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
              <MagnifyingGlassIcon size={20} className="text-muted" aria-hidden />
              <span className="sr-only">Şikayet ara</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Şikayet, bina ya da kategori ara"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/80"
              />
            </label>
          )}
        </div>
      </header>
      <Tabs id={id} label="Gündem sekmeleri" options={[...GUNDEM_TABS]} value={tab} onChange={setTab} />
      <GundemSearch.Provider value={query}>
        <TabPanels id={id} options={[...GUNDEM_TABS]} value={tab}>
          {tab === "Şikayetler" ? complaints : suggestions}
        </TabPanels>
      </GundemSearch.Provider>
    </PageContent>
  );
}
