import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validateSignup, type SignupInput } from "@/lib/signup";
import { SUPABASE_URL } from "@/lib/supabase/env";

const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });

/**
 * Creates an account for the chosen panel. The role is written here, with the service key, because signed-in users
 * cannot change profiles.role themselves; staff and admin additionally need the sign-up code from the environment.
 */
export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return fail("Hesap açma şu an kullanılamıyor.", 503);

  let input: SignupInput;
  try {
    input = (await request.json()) as SignupInput;
  } catch {
    return fail("Geçersiz istek.", 400);
  }

  const problem = validateSignup(input, {
    staffCode: process.env.STAFF_SIGNUP_CODE,
    adminCode: process.env.ADMIN_SIGNUP_CODE,
    domains: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS,
    emails: process.env.NEXT_PUBLIC_ALLOWED_EMAILS,
  });
  if (problem) return fail(problem, 400);

  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  let unitId: number | null = null;
  if (input.role === "staff") {
    const { data: unit } = await admin.from("units").select("id").eq("slug", input.unitSlug!).maybeSingle();
    if (!unit) return fail("Birim bulunamadı.", 400);
    unitId = unit.id;
  }

  // The database trigger only lets listed addresses (or @sakarya.edu.tr) through; validateSignup already vetted this one.
  const { error: allowError } = await admin.from("allowed_emails").upsert({ email }, { onConflict: "email" });
  if (allowError) return fail("Hesap açılamadı. Biraz sonra yeniden dene.", 500);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) {
    const exists = createError?.code === "email_exists" || /already/i.test(createError?.message ?? "");
    return exists ? fail("Bu e-postayla zaten bir hesap var. Giriş yap.", 409) : fail("Hesap açılamadı.", 500);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: input.role, unit_id: unitId, full_name: fullName })
    .eq("id", created.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return fail("Hesap açılamadı.", 500);
  }

  return NextResponse.json({ ok: true, role: input.role });
}
