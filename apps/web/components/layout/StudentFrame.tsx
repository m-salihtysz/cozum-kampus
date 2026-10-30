"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The map page keeps its own look; every other student page gets the soft theme.
export function StudentFrame({ children }: { children: ReactNode }) {
  const onMap = usePathname() === "/";
  return (
    <div className={`app relative min-h-screen w-full overflow-x-hidden ${onMap ? "bg-map-bg" : "soft soft-bg"}`}>{children}</div>
  );
}
