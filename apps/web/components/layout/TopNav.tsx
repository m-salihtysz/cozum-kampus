"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Fire, ListChecks, MapTrifold, Plus, UserCircle, type Icon } from "@phosphor-icons/react";

const LINKS: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Harita", icon: MapTrifold },
  { href: "/populer", label: "Gündem", icon: Fire },
  { href: "/bildirimlerim", label: "Bildirimlerim", icon: ListChecks },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// Pill bar on desktop, bottom tab bar on phones (styles in globals.css: .snav).
// The nav carries the soft theme itself so it looks the same over the map page.
export function TopNav() {
  const pathname = usePathname();
  const current = (href: string) => (isActive(pathname, href) ? "page" : undefined);

  return (
    <nav aria-label="Ana gezinme" className="snav soft">
      <div className="snav-inner">
        <div className="snav-group">
          {LINKS.map(({ href, label, icon: IconCmp }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} aria-current={current(href)} className="snav-link">
                <IconCmp size={active ? 18 : 18} weight={active ? "fill" : "regular"} aria-hidden />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
        <Link href="/bildir" aria-current={current("/bildir")} className="snav-cta">
          <Plus size={18} weight="bold" aria-hidden />
          Bildir
        </Link>
        <Link
          href="/bildirimler"
          aria-label="Bildirimler"
          aria-current={current("/bildirimler")}
          className="snav-round snav-bell"
        >
          <Bell size={20} aria-hidden />
        </Link>
        <Link href="/hesap" aria-label="Profil" aria-current={current("/hesap")} className="snav-round">
          <UserCircle size={24} aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
