-- Kendi Supabase projende ilk yönetici hesabını açar.
--
-- Sıra:
--   1. Aşağıdaki iki değeri kendi bilgilerinle değiştir.
--   2. Bu betiğin 1. bölümünü SQL Editor'da çalıştır (e-postana giriş izni verir).
--   3. Supabase panelinde Authentication > Users > Add user > Create new user:
--      e-posta + şifre gir, "Auto Confirm User" kutusunu işaretle.
--   4. Bu betiğin 2. bölümünü çalıştır (hesabı yönetici yapar).
--
-- Okul alan adı dışındaki adresler (ör. gmail) yalnızca allowed_emails listesindeyse hesap açabilir;
-- web tarafında da NEXT_PUBLIC_ALLOWED_EMAILS içinde aynı adres olmalı (.env / apps/web/.env.local).

-- 1. Giriş izni ------------------------------------------------------------------------------------------------
insert into public.allowed_emails (email)
values (lower('SENIN-EPOSTAN@ORNEK.COM'))
on conflict do nothing;

-- 2. Yönetici rolü (3. adımdaki hesap açıldıktan sonra) --------------------------------------------------------
update public.profiles
   set role = 'admin',
       full_name = 'ADIN SOYADIN'
 where id = (select id from auth.users where lower(email) = lower('SENIN-EPOSTAN@ORNEK.COM'));

-- Kontrol: tek satır dönmeli ve role = admin olmalı.
select p.id, u.email, p.role, p.full_name
  from public.profiles p
  join auth.users u on u.id = p.id
 where lower(u.email) = lower('SENIN-EPOSTAN@ORNEK.COM');

-- Personel hesabı açmak için aynı yolu izle: e-postayı allowed_emails'e ekle, kullanıcıyı panelden oluştur, sonra
--   update public.profiles set role = 'staff', unit_id = (select id from public.units where slug = 'yapi_isleri')
--    where id = (select id from auth.users where lower(email) = lower('personel@ornek.com'));
