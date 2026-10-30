# Çözüm Kampüs

**[📄 Tanıtım sunumunu görüntüle (PDF)](SUNUM.pdf)**

Yapay zeka destekli kampüs sorun bildirim ve takip platformu. Öğrenci kampüste gördüğü sorunu fotoğrafla ya da kısa bir yazıyla bildirir, yapay zeka sınıflandırıp doğru birime yönlendirir, birim personeli çözer, öğrenci süreci canlı izler. Sakarya Üniversitesi bağlamında tasarlandı.

## Neler var

| Panel | Yapabildikleri |
|---|---|
| **Öğrenci** | Fotoğraf, konum ve açıklamayla bildirim açar (QR ile yer seçilebilir). Yapay zeka başlık, kategori, aciliyet ve birimi önerir. Bildirimlerini zaman çizelgesinde ve canlı bildirimlerle takip eder. Haritada kampüs sorunlarını görür. Öneri paylaşır ve beğenir. Hesabını ve verilerini siler. |
| **Personel** | Birimine gelen işleri görür, işe başlar, çözüm fotoğrafı yükler (yapay zeka doğrular), malzeme talep eder, geçmiş işlerine bakar. |
| **Yönetim** | Tüm bildirimleri filtreler, yayında olmayanları yayınlar ya da gizler, birim performansını ve iş takibini izler, öğrenci önerilerine yapay zeka destekli taslak yanıt yazar, birimleri yönetir. |

Bildirimin yolu: **Alındı → Yönlendirildi → İşlemde → Çözüldü**.

## Mimari

```
Tarayıcı ──► Next.js 16 (apps/web) ──► Supabase  (Postgres + RLS, Auth, Storage, Realtime)
                  │                         ▲
                  └──► FastAPI (services/ai) ┘ ──► Gemini (OpenAI uyumlu uç nokta)
```

| Parça | Klasör | Teknoloji |
|---|---|---|
| Web arayüzü | `apps/web` | Next.js 16 (App Router, Cache Components), React 19, Tailwind 4, MapLibre, Phosphor ikonlar |
| Yapay zeka servisi | `services/ai` | Python 3.12, FastAPI, OpenAI SDK (Gemini), `uv` |
| Veritabanı | `supabase` | Postgres, satır bazlı yetki (RLS), migration'lar, seed, testler |

Yapay zeka uçları: `/ai/analyze-report` (bildirim analizi), `/ai/verify-resolution` (çözüm fotoğrafı doğrulama), `/ai/draft-reply` (yönetim için öneri yanıtı). Servis kullanıcının Supabase oturumunu doğrular, kullanıcı başına dakikalık istek sınırı uygular, kişisel verileri modele gitmeden maskeler. LLM yanıt vermezse kural tabanlı yedek analiz devreye girer.

## Hızlı başlangıç

Gerekenler: Node.js 20+, pnpm, Python 3.12 ile `uv`, bir Supabase projesi ve bir Gemini API anahtarı.

```bash
# 1. Ortam dosyaları (değerleri doldur; hiçbiri git'e girmez)
cp .env.example .env
cp .env.example apps/web/.env.local   # yalnızca NEXT_PUBLIC_* ve sunucu satırları kalsın

# 2. Veritabanı (bir kez)
npx supabase login
npx supabase link --project-ref <proje-ref>
npx supabase db push
#    supabase/seed.sql dosyasını Supabase SQL Editor'da çalıştır

# 3. Çalıştır
pnpm install
pnpm dev:web                                                        # http://localhost:3100
cd services/ai && uv run uvicorn app.main:app --reload --port 8000  # yapay zeka servisi
```

Ayrıntılı adımlar (Supabase panel ayarları, ilk hesap, SMTP, yayına alma) için [docs/KURULUM.md](docs/KURULUM.md).

## Ortam değişkenleri

Gerçek değerler yalnızca `.env` ve `apps/web/.env.local` dosyalarında durur, ikisi de `.gitignore` içindedir. Şablon: [.env.example](.env.example).

| Değişken | Nerede | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web (tarayıcıya açık) | Supabase proje adresi ve anon anahtarı |
| `NEXT_PUBLIC_AI_API_URL` | web | Yapay zeka servisinin adresi |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`, `NEXT_PUBLIC_ALLOWED_EMAILS` | web | Hesap açabilecek alan adları ve tek tek adresler |
| `SUPABASE_SERVICE_ROLE_KEY` | web (yalnızca sunucu) ve AI | **Gizli.** Hesap açma sayfası rolü bununla yazar |
| `STAFF_SIGNUP_CODE`, `ADMIN_SIGNUP_CODE` | web (yalnızca sunucu) | Personel ve yönetim hesabı açmak için kayıt kodları. Boşsa o panel için kayıt kapalı |
| `LLM_API_KEY` | AI | **Gizli.** Gemini anahtarı. Model ve uç nokta `LLM_*` ile değişir |
| `ALLOWED_ORIGIN` | AI | CORS: web adresi |
| `SUPABASE_DB_URL` | CLI | `psql` ile seed çalıştırmak için, isteğe bağlı |

## Hesaplar ve roller

`/hesap-ac` sayfasından ad, e-posta, şifre ve panel (öğrenci, personel, yönetim) seçilerek hesap açılır. Rol yalnızca sunucuda atanır; kullanıcılar kendi rollerini değiştiremez (veritabanı RLS ile reddeder). Personel ve yönetim için kayıt kodu gerekir. E-posta onayı yapılmaz, bu yüzden yayında özel SMTP ile onay açılmalıdır.

## Testler

```bash
pnpm test:web                          # Vitest, 237 test
pnpm --filter web typecheck && pnpm --filter web lint
cd services/ai && uv run pytest        # 71 test
cd services/ai && uv run ruff check .
```

CI (`.github/workflows`) web ve AI için lint, tip denetimi, test ve derlemeyi çalıştırır.

## Klasör yapısı

```
apps/web/            Next.js uygulaması
  app/               Sayfalar: (ogrenci), personel, yonetim, giris, hesap-ac, api
  components/        Arayüz bileşenleri (harita, bildirimler, yönetim, personel, ...)
  lib/               İş mantığı, Supabase istemcileri, yetki (auth.ts), testler
  proxy.ts           Oturum ve rol kontrolü (her istekte)
services/ai/         FastAPI servisi (app/, tests/, Dockerfile)
supabase/            migrations/, seed.sql, scripts/ilk_hesap.sql, tests/rls_check.sql
docs/                Rehber, kurulum, ekran tasarımları, tanıtım sunumu kaynağı
render.yaml          Yapay zeka servisi için Render blueprint'i
```

## Yayına alma

Web Vercel'e (Root Directory `apps/web`), yapay zeka servisi Render'a (`render.yaml`) kurulabilir. Render ücretsiz planı boşta uyur; demodan önce `/health` adresine istek at. Adımlar [docs/KURULUM.md](docs/KURULUM.md) içinde.

## Güvenlik ve gizlilik

- Tüm tablolarda RLS açık; öğrenci yalnızca kendi bildirimlerini görür, personel yalnızca kendi birimini, yönetim hepsini.
- Servis anahtarı ve LLM anahtarı tarayıcıya gitmez.
- Fotoğraflar özel bir Storage bucket'ında tutulur; yüklenirken EXIF konumu kontrol edilir.
- KVKK: aydınlatma metni `/kvkk`, hesap silme, zamanlanmış veri saklama (retention) işi.
- Uygunsuz içerik filtresi ve yapay zeka denetimi: denetimi geçmeyen bildirim yayınlanmaz, yönetim onayına düşer.

## Belgeler

- [docs/KURULUM.md](docs/KURULUM.md): kendi hesaplarınla kurulum
- [docs/PROJE_REHBERI.md](docs/PROJE_REHBERI.md): ürün kararları ve kapsam
- [docs/tasarim/](docs/tasarim): ekran tasarımları
- [SUNUM.pdf](SUNUM.pdf): tanıtım sunumu (6 slayt, `docs/tanitim/tanitim.html` kaynağından üretilir)
