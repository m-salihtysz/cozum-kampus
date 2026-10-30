"use client";

import type { ReactNode } from "react";
import { Buildings, ClipboardText, ListChecks, Megaphone, SquaresFour } from "@phosphor-icons/react";
import { ConsoleShell } from "./ConsoleShell";

const tabs = [
  { href: "/yonetim", label: "Genel bakış", icon: SquaresFour },
  { href: "/yonetim/bildirimler", label: "Bildirimler", icon: ListChecks },
  { href: "/yonetim/is-takibi", label: "İş takibi", icon: ClipboardText },
  { href: "/yonetim/birimler", label: "Birimler", icon: Buildings },
  { href: "/yonetim/kampus-sesi", label: "Kampüs sesi", icon: Megaphone },
];

// The admin console is a different place from the student app: a dark sidebar instead of the floating top bar.
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell tabs={tabs} root="/yonetim" navLabel="Yönetim gezinme" brandTag="Yönetim paneli">
      {children}
    </ConsoleShell>
  );
}
