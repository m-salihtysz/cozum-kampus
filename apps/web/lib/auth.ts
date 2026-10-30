export type Role = "student" | "staff" | "admin" | "security";

const ALL_ROLES: Role[] = ["student", "staff", "admin", "security"];

const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

/** Sign-in is open to school domains plus an explicit list of single addresses (mirrors public.allowed_emails). */
export function isAllowedEmail(
  email: string,
  domains: string | undefined = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS,
  emails: string | undefined = process.env.NEXT_PUBLIC_ALLOWED_EMAILS,
): boolean {
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[0]) return false;
  return list(domains).includes(parts[1]) || list(emails).includes(normalized);
}

/** "@sakarya.edu.tr, @ogr.sakarya.edu.tr": the domains shown in the sign-in copy. */
export function allowedDomainsLabel(domains: string | undefined = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS): string {
  return list(domains)
    .map((d) => `@${d}`)
    .join(", ");
}

/** First allowed domain, for the e-mail field placeholder. */
export function primaryDomain(domains: string | undefined = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS): string {
  return list(domains)[0] ?? "sakarya.edu.tr";
}

function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function requiredRole(pathname: string): Role[] | null {
  if (under(pathname, "/giris") || under(pathname, "/auth") || under(pathname, "/kvkk")) return null;
  if (under(pathname, "/hesap-ac") || under(pathname, "/api/hesap-ac")) return null;
  if (under(pathname, "/yonetim")) return ["admin"];
  if (under(pathname, "/personel")) return ["staff", "admin"];
  return ALL_ROLES;
}

// Staff and admin have their own shells; the student map at "/" is not their home.
export function homeFor(role: Role): string {
  if (role === "staff") return "/personel";
  if (role === "admin") return "/yonetim";
  return "/";
}

/** Role carried in the JWT (synced from profiles.role); null when absent so callers fall back to the database. */
export function roleFromClaims(claims: { app_metadata?: object } | null | undefined): Role | null {
  const role = (claims?.app_metadata as { role?: unknown } | undefined)?.role;
  return ALL_ROLES.includes(role as Role) ? (role as Role) : null;
}
