"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";

const AUTOPLAY_MS = 5500;
const MAX_DOTS = 10;

const arrow = "ghost t focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-white text-ink";

// Horizontal scroll-snap carousel: arrows, dots, and autoplay that yields to hover, focus and reduced motion.
export function Slider({
  label,
  children,
  itemClass = "w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]",
  autoplay = true,
  title,
}: {
  label: string;
  children: ReactNode;
  itemClass?: string;
  autoplay?: boolean;
  title?: ReactNode;
}) {
  const items = Children.toArray(children);
  const count = items.length;
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback((index: number) => {
    const el = track.current;
    const card = el?.children[index] as HTMLElement | undefined;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !card || !first) return;
    el.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: "smooth" });
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = active + dir;
      goTo(next < 0 ? count - 1 : next >= count ? 0 : next);
    },
    [active, count, goTo],
  );

  const onScroll = () => {
    const el = track.current;
    if (!el || !count) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 && el.scrollLeft > 0) return setActive(count - 1);
    const first = (el.children[0] as HTMLElement).offsetLeft;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < count; i++) {
      const dist = Math.abs((el.children[i] as HTMLElement).offsetLeft - first - el.scrollLeft);
      if (dist < bestDist) [best, bestDist] = [i, dist];
    }
    setActive(best);
  };

  const auto = playing && !paused && !reduced && count > 1;
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [auto, step]);

  if (!count) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">{title}</div>
        {count > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            {autoplay && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Otomatik kaydırmayı durdur" : "Otomatik kaydırmayı başlat"}
                className="ghost t focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink"
              >
                {playing ? <PauseIcon size={18} aria-hidden /> : <PlayIcon size={18} aria-hidden />}
              </button>
            )}
            <button type="button" onClick={() => step(-1)} aria-label="Önceki" className={arrow}>
              <CaretLeftIcon size={18} aria-hidden />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Sonraki" className={arrow}>
              <CaretRightIcon size={18} aria-hidden />
            </button>
          </div>
        )}
      </div>
      <div
        ref={track}
        onScroll={onScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        tabIndex={0}
        role="region"
        aria-roledescription="kayan liste"
        aria-label={label}
        className="focus-ring relative -mx-1 -my-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className={`${itemClass} shrink-0 snap-start`}>
            {item}
          </div>
        ))}
      </div>
      {count > 1 &&
        (count <= MAX_DOTS ? (
          <div className="flex justify-center gap-2" role="group" aria-label={`${label} seçici`}>
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. öğeye git`}
                aria-current={i === active}
                className={`focus-ring h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-ink" : "w-2 bg-input-border"}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-muted" aria-live="polite">
            {active + 1} / {count}
          </p>
        ))}
    </div>
  );
}
