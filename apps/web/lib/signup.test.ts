import { describe, expect, it } from "vitest";
import { codeMatches, validateSignup, type SignupInput } from "./signup";

const D = "sakarya.edu.tr,ogr.sakarya.edu.tr";
const env = { staffCode: "personel-kodu", adminCode: "yonetim-kodu", domains: D, emails: "" };
const base: SignupInput = { fullName: "Ali Veli", email: "ali@ogr.sakarya.edu.tr", password: "gizli-sifre", role: "student" };

describe("validateSignup", () => {
  it("accepts a student without any code", () => {
    expect(validateSignup(base, env)).toBeNull();
  });

  it("needs a name and a password of at least 8 characters", () => {
    expect(validateSignup({ ...base, fullName: " " }, env)).toMatch(/ad soyad/i);
    expect(validateSignup({ ...base, password: "kisa" }, env)).toMatch(/8/);
  });

  it("rejects addresses outside the allowed domains and list", () => {
    expect(validateSignup({ ...base, email: "ali@gmail.com" }, env)).toMatch(/uzantılı/);
    expect(validateSignup({ ...base, email: "ali@gmail.com" }, { ...env, emails: "ali@gmail.com" })).toBeNull();
  });

  it("only accepts the three panel roles", () => {
    expect(validateSignup({ ...base, role: "security" as never }, env)).toMatch(/panel/i);
  });

  it("staff needs a unit and the staff code", () => {
    const staff: SignupInput = { ...base, role: "staff", unitSlug: "yapi_isleri", code: "personel-kodu" };
    expect(validateSignup(staff, env)).toBeNull();
    expect(validateSignup({ ...staff, unitSlug: "" }, env)).toMatch(/birim/i);
    expect(validateSignup({ ...staff, code: "yanlis" }, env)).toMatch(/kod/i);
    expect(validateSignup({ ...staff, code: "yonetim-kodu" }, env)).toMatch(/kod/i);
  });

  it("admin needs the admin code, and the staff code does not open it", () => {
    const admin: SignupInput = { ...base, role: "admin", code: "yonetim-kodu" };
    expect(validateSignup(admin, env)).toBeNull();
    expect(validateSignup({ ...admin, code: "personel-kodu" }, env)).toMatch(/kod/i);
  });

  it("keeps staff and admin sign-up closed when no code is configured", () => {
    const closed = { ...env, staffCode: "", adminCode: undefined };
    expect(validateSignup({ ...base, role: "staff", unitSlug: "x", code: "" }, closed)).toMatch(/kapalı/i);
    expect(validateSignup({ ...base, role: "admin", code: "" }, closed)).toMatch(/kapalı/i);
  });
});

describe("codeMatches", () => {
  it("compares exactly and never matches an empty code", () => {
    expect(codeMatches("abc", "abc")).toBe(true);
    expect(codeMatches("abd", "abc")).toBe(false);
    expect(codeMatches("", "")).toBe(false);
    expect(codeMatches("abc", undefined)).toBe(false);
  });
});
