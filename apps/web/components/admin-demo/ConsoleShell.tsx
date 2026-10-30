"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight, type Icon } from "@phosphor-icons/react";
import { AccountMenu } from "@/components/layout/AccountMenu";
import styles from "./admin.module.css";

export type ConsoleTab = { href: string; label: string; icon: Icon };

// Dark console frame shared by the admin and staff panels: sidebar, breadcrumb strip and the profile/sign-out menu.
export function ConsoleShell({
  children,
  tabs,
  root,
  navLabel,
  brandTag,
  side = "left",
}: {
  children: ReactNode;
  tabs: ConsoleTab[];
  root: string;
  navLabel: string;
  brandTag: string;
  side?: "left" | "right";
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === root ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const current = tabs.find((t) => isActive(t.href))?.label ?? tabs[0].label;
  const right = side === "right";
  return (
    <div className={`app ${styles.shell}`}>
      <a className="skip" href="#icerik">Ana içeriğe geç</a>
      <aside className={`${styles.sidebar} ${right ? styles.sidebarRight : ""}`}>
        <div className={styles.brand}>
          <span aria-hidden className={styles.brandMark}>ÇK</span>
          <span className={styles.brandText}>
            Çözüm Kampüs
            <span className={styles.brandTag}>{brandTag}</span>
          </span>
        </div>
        <nav aria-label={navLabel} className={styles.nav}>
          {tabs.map(({ href, label, icon: IconCmp }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}>
                <IconCmp size={18} weight={active ? "fill" : "regular"} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.account}>
          <AccountMenu dark placement="up" />
        </div>
      </aside>
      <main id="icerik" className={`${styles.main} ${right ? styles.mainRight : ""}`}>
        <header className={styles.header}>
          <span className={styles.crumb}>
            {brandTag.split(" ")[0]} <CaretRight size={12} aria-hidden /> <strong>{current}</strong>
          </span>
          <span className={styles.live}>
            <i aria-hidden /> Canlı veri
          </span>
        </header>
        {children}
      </main>
    </div>
  );
}
