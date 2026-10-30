"use client";
import type { ReactNode } from "react";
import { ClockCounterClockwise, ListChecks, Package } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/admin-demo/ConsoleShell";

const tabs = [
  { href: "/personel", label: "İşler", icon: ListChecks },
  { href: "/personel/gecmis", label: "Geçmiş", icon: ClockCounterClockwise },
  { href: "/personel/malzeme", label: "Malzeme", icon: Package },
];

// Same dark console as the admin panel (shared ConsoleShell), sidebar on the left.
export function StaffShell({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell tabs={tabs} root="/personel" navLabel="Personel gezinme" brandTag="Personel paneli">
      {children}
    </ConsoleShell>
  );
}
