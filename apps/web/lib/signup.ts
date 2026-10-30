import { createHash, timingSafeEqual } from "node:crypto";
import { allowedDomainsLabel, isAllowedEmail } from "./auth";

export type SignupRole = "student" | "staff" | "admin";

export type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  role: SignupRole;
  unitSlug?: string;
  code?: string;
};

export type SignupEnv = {
  staffCode?: string;
  adminCode?: string;
  domains?: string;
  emails?: string;
};

export const SIGNUP_ROLES: SignupRole[] = ["student", "staff", "admin"];
export const MIN_PASSWORD_LENGTH = 8;

/** Constant-time comparison; an unset or empty expected code never matches. */
export function codeMatches(given: string, expected: string | undefined): boolean {
  if (!expected || !given) return false;
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** Returns a Turkish error message for the form, or null when the sign-up request may proceed. */
export function validateSignup(input: SignupInput, env: SignupEnv): string | null {
  if (!input.fullName?.trim()) return "Ad soyad gerekli.";
  if (!isAllowedEmail(input.email ?? "", env.domains, env.emails)) {
    const domains = allowedDomainsLabel(env.domains);
    return domains ? `Yalnızca ${domains} uzantılı adresle hesap açabilirsin.` : "Şu an hesap açılamıyor.";
  }
  if ((input.password ?? "").length < MIN_PASSWORD_LENGTH) {
    return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`;
  }
  if (!SIGNUP_ROLES.includes(input.role)) return "Geçerli bir panel seç.";
  if (input.role === "student") return null;

  const expected = input.role === "staff" ? env.staffCode : env.adminCode;
  if (!expected) return "Bu panel için hesap açma kapalı.";
  if (input.role === "staff" && !input.unitSlug) return "Personel için birim seç.";
  if (!codeMatches(input.code ?? "", expected)) return "Kayıt kodu hatalı.";
  return null;
}
