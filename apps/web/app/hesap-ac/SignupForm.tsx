"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { primaryDomain } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import type { SignupRole } from "@/lib/signup";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-input-border bg-white px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors hover:border-[#b9c3d3] focus:border-ink focus:outline-none";

const PANELS: { role: SignupRole; label: string; hint: string }[] = [
  { role: "student", label: "Öğrenci", hint: "Bildirim aç, takip et" },
  { role: "staff", label: "Personel", hint: "Birimine gelen işleri yönet" },
  { role: "admin", label: "Yönetim", hint: "Tüm bildirimleri ve birimleri yönet" },
];

type Unit = { name: string; slug: string };

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unitSlug, setUnitSlug] = useState("");
  const [code, setCode] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("units")
      .select("name, slug")
      .order("name")
      .then(({ data }) => setUnits(data ?? []));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/hesap-ac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, unitSlug, code }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(body.error ?? "Hesap açılamadı.");
        return;
      }
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        router.replace("/giris");
        return;
      }
      // The proxy sends each role to its own panel.
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <fieldset>
        <legend className="text-sm font-medium">Hangi panel için?</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PANELS.map((p) => (
            <label
              key={p.role}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ink ${
                role === p.role ? "border-ink bg-tint" : "border-input-border bg-white hover:border-[#b9c3d3]"
              }`}
            >
              <input
                type="radio"
                name="panel"
                value={p.role}
                checked={role === p.role}
                onChange={() => setRole(p.role)}
                className="sr-only"
              />
              <span className="block font-medium text-ink">{p.label}</span>
              <span className="mt-0.5 block text-xs leading-4 text-muted">{p.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium">
        Ad soyad
        <input
          className={inputClass}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        E-posta
        <input
          className={inputClass}
          type="email"
          autoComplete="email"
          placeholder={`ad.soyad@${primaryDomain()}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Şifre
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className="mt-1 block text-xs text-muted">En az 8 karakter.</span>
      </label>

      {role === "staff" && (
        <label className="block text-sm font-medium">
          Birim
          <select className={inputClass} value={unitSlug} onChange={(e) => setUnitSlug(e.target.value)} required>
            <option value="">Birim seç</option>
            {units.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {role !== "student" && (
        <label className="block text-sm font-medium">
          Kayıt kodu
          <input
            className={`${inputClass} font-mono`}
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <span className="mt-1 block text-xs text-muted">Bu paneller için yönetimden alınan kod gerekir.</span>
        </label>
      )}

      {message && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        Hesap aç
      </Button>
    </form>
  );
}
