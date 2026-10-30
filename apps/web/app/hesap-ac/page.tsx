import Link from "next/link";
import { allowedDomainsLabel } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main id="icerik" className="app flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[440px]">
        <span className="mb-10 inline-flex items-center gap-2 font-semibold text-ink">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-ink text-[13px] text-white">
            ÇK
          </span>
          Çözüm Kampüs
        </span>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">Hesap aç</h1>
        <p className="mt-2 text-[15px] text-muted">
          {allowedDomainsLabel() || "Okul"} e-posta adresinle, kullanacağın panele göre hesabını oluştur.
        </p>
        <SignupForm />
        <p className="mt-6 text-sm text-muted">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-accent underline-offset-2 hover:underline focus-ring">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
