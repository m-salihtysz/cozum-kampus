# Kendi projeni kurmak

Bu depo artık kendi hesaplarınla çalışacak şekilde hazırlandı. Hiçbir anahtar ya da proje adresi depoda tutulmaz;
hepsi `.env` ve `apps/web/.env.local` dosyalarına yazılır (ikisi de git tarafından yok sayılır).

Gerekenler: bir Supabase hesabı, bir Google Gemini API anahtarı. Yayına almak için Vercel, Render ve GitHub.

## 1. Supabase projesi

1. https://supabase.com adresinde yeni bir proje aç. Bölgeyi Vercel fonksiyonlarına yakın seç. Veritabanı şifresini not et.
2. Settings > API sayfasından `Project URL`, `anon` anahtarı ve `service_role` anahtarını kopyala.
3. Veritabanını kur (depodaki migration'ları uygular, bir kez):
   ```bash
   npx supabase login
   npx supabase link --project-ref <proje-ref>
   npx supabase db push
   ```
4. `supabase/seed.sql` içeriğini SQL Editor'da çalıştır. Birimleri, binaları ve örnek kayıtları ekler. Örnek bildirimler
   istemiyorsan dosyanın `insert into reports` bölümünü çıkar.
5. Authentication > URL Configuration: Site URL olarak canlı adresini (yerelde `http://localhost:3100`), Redirect URLs
   olarak `<adres>/auth/callback` ekle.
6. Authentication > Providers > Email açık olmalı. E-posta koduyla giriş için bir SMTP servisi bağla; Supabase'in
   varsayılan e-posta servisi saatte birkaç mesajla sınırlıdır. Şifreyle giriş SMTP gerektirmez.

## 2. İlk yönetici hesabı

`supabase/scripts/ilk_hesap.sql` dosyasını aç, e-postanı ve adını yaz, içindeki adımları sırayla izle. Okul alan adı
dışındaki bir adresle (ör. gmail) giriş yapacaksan adresin hem veritabanında (`allowed_emails`, betik ekler) hem de
web tarafında (`NEXT_PUBLIC_ALLOWED_EMAILS`) tanımlı olmalı.

## 3. Yapay zeka anahtarı

https://aistudio.google.com/apikey adresinden bir Gemini anahtarı al, `LLM_API_KEY` olarak yaz. Başka bir
OpenAI uyumlu servis kullanacaksan `LLM_BASE_URL` ve `LLM_MODEL` değerlerini değiştir.

## 4. Ortam dosyaları

```bash
cp .env.example .env
cp .env.example apps/web/.env.local
```

- `.env`: tüm değerler (yapay zeka servisi bunu okur).
- `apps/web/.env.local`: yalnızca `NEXT_PUBLIC_*` satırları. Servis anahtarlarını ve `LLM_API_KEY`'i buraya yazma;
  tarayıcıya gitmemeleri gerekir.
- `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`: giriş yapabilecek alan adları. `NEXT_PUBLIC_ALLOWED_EMAILS`: alan adı dışındaki
  tek tek adresler.

- Hesap aç sayfası (`/hesap-ac`): `apps/web/.env.local` içine `SUPABASE_SERVICE_ROLE_KEY` (yalnızca sunucu), `STAFF_SIGNUP_CODE`
  ve `ADMIN_SIGNUP_CODE` yaz. Kodlar boşsa Personel ve Yönetim için hesap açma kapalı kalır; öğrenci hesabı kodsuz açılır.
  Okul alan adı dışındaki adresler `NEXT_PUBLIC_ALLOWED_EMAILS` listesinde olmalı.

## 5. Yerelde çalıştırma

```bash
pnpm install
pnpm dev:web                                                           # http://localhost:3100
cd services/ai && uv run uvicorn app.main:app --reload --port 8000     # yapay zeka servisi
```

Sağlık kontrolü: `curl localhost:8000/health` → `{"status":"ok"}`. Testler: `pnpm test:web` ve `cd services/ai && uv run pytest`.

## 6. Yayına almak (isteğe bağlı)

- GitHub: depo `git remote add origin <adres>` ile bağlanır. `.env` ve `apps/web/.env.local` git tarafından yok sayılır; anahtarlar yalnızca Vercel ve Render'ın ortam değişkenlerine girilir.
- Vercel: depoyu içe aktar, Root Directory `apps/web`. `NEXT_PUBLIC_*` değişkenlerini gir. `NEXT_PUBLIC_AI_API_URL`
  Render adresin olsun.
- Render: `render.yaml` blueprint'i ile `cozum-kampus-ai` servisini kur. `SUPABASE_*`, `LLM_API_KEY` ve
  `ALLOWED_ORIGIN` (Vercel adresin) değerlerini gir. Ücretsiz plan 15 dakika boşta kalınca uyur; demodan önce
  `/health` adresine bir istek at.
- Supabase Auth ayarındaki Site URL'yi canlı adresinle güncelle.
