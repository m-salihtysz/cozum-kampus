"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { initials, roleLabel } from "@/lib/labels";
import type { Role } from "@/lib/auth";

type Me = { name: string; email: string; role: Role };

// Profile chip for the staff and admin top bars: who is signed in, and a way out.
export function AccountMenu({ dark = false, placement = "down" }: { dark?: boolean; placement?: "up" | "down" }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", data.user.id).single();
      if (cancelled) return;
      const email = data.user.email ?? "";
      setMe({ name: profile?.full_name || email, email, role: (profile?.role ?? "student") as Role });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/giris");
      router.refresh();
    } catch {
      setError("Çıkış yapılamadı. Tekrar dene.");
      setBusy(false);
    }
  }

  if (!me) return null;
  return (
    <div ref={box} className={`relative ${dark ? "w-full" : ""}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profil: ${me.name}`}
        onClick={() => setOpen((o) => !o)}
        className={`focus-ring t flex h-10 items-center gap-2 rounded-full py-0.5 pr-3 pl-0.5 ${
          dark ? "w-full border border-white/15 bg-white/10 text-white hover:bg-white/20" : "border border-hairline bg-white hover:bg-tint"
        }`}
      >
        <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-semibold ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
          {initials(me.name)}
        </span>
        <span className={`truncate text-sm font-medium ${dark ? "" : "max-w-[140px] max-sm:sr-only"}`}>{me.name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className={`glass absolute z-20 flex w-64 flex-col gap-3 p-4 text-ink shadow-lg ${
            placement === "up" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-tint text-base font-semibold">{initials(me.name)}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{me.name}</p>
              <p className="truncate text-xs text-muted">{me.email}</p>
              <span className="mt-1 inline-block rounded-full bg-tint px-2 py-0.5 text-xs font-medium">{roleLabel(me.role)}</span>
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={signOut}
            className="ghost t focus-ring flex items-center justify-center gap-2 rounded-lg border border-input-border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <SignOut size={18} aria-hidden />
            {busy ? "Çıkış yapılıyor…" : "Çıkış yap"}
          </button>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
