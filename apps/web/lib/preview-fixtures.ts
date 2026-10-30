// Local-only preview data. Enabled with PREVIEW_FAKE_DATA=1 in apps/web/.env.local.
// Never written to Supabase; ids are negative so they cannot collide with real rows.
import type { AppNotification } from "@/components/notifications/NotificationsView";
import type { StudentSuggestion } from "@/components/campus-voice/SuggestionsView";

export const previewEnabled = () => process.env.PREVIEW_FAKE_DATA === "1";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const H = 60;
const D = 24 * H;

export const FAKE_SUGGESTIONS: StudentSuggestion[] = [
  { id: -1, title: "Kütüphane sınav haftasında 24 saat açık olsun", body: "Final haftasında kütüphane 23:00'te kapanıyor. Sınav dönemlerinde en az bir katın 24 saat açık kalmasını öneriyorum.", category: "Kütüphane", votes: 184, status: "planlandi", createdAt: ago(12 * D), mine: false, anonymous: false, reply: "Öneriniz değerlendirildi; final haftasında 2. kat 24 saat açık olacak. Duyuru önümüzdeki hafta yapılacak." },
  { id: -2, title: "Yemekhanede vejetaryen seçenek her gün bulunsun", body: "Haftada sadece iki gün vejetaryen menü var. Her gün en az bir vejetaryen seçenek sunulabilir mi?", category: "Yemekhane", votes: 142, status: "degerlendiriliyor", createdAt: ago(9 * D), mine: false, anonymous: true, reply: null },
  { id: -3, title: "Kuzey kapı - merkez ring seferleri sıklaştırılsın", body: "Sabah 08:30 civarında ring çok kalabalık oluyor ve 20 dakikada bir geliyor. Sefer sıklığı bu saatlerde artırılabilir.", category: "Ulaşım", votes: 117, status: "yeni", createdAt: ago(5 * D), mine: true, anonymous: false, reply: null },
  { id: -4, title: "Ders programı sistemi mobil uyumlu olsun", body: "Telefondan ders programına bakarken tablo taşıyor. Mobil görünüm iyileştirilebilir.", category: "Akademik", votes: 96, status: "uygulandi", createdAt: ago(20 * D), mine: false, anonymous: false, reply: "Mobil görünüm son güncellemeyle yayına alındı. Geri bildirimleriniz için teşekkürler." },
  { id: -5, title: "Kampüse daha fazla oturma ve gölgelik alanı", body: "Fen Fakültesi önünde yaz aylarında oturacak gölgeli yer yok. Birkaç bank ve pergola eklenebilir.", category: "Yaşam", votes: 73, status: "yeni", createdAt: ago(2 * D), mine: false, anonymous: false, reply: null },
  { id: -6, title: "Kütüphanede grup çalışma odaları rezervasyonla olsun", body: "Grup odaları ilk gelen kapıyor, kimin kaç saat kullandığı belli değil. Online rezervasyon sistemi iyi olurdu.", category: "Kütüphane", votes: 58, status: "reddedildi", createdAt: ago(15 * D), mine: false, anonymous: true, reply: "Bu dönem için altyapı uygun değil; oda kullanım süresi 2 saatle sınırlandırıldı." },
  { id: -7, title: "Yurt çevresine gece aydınlatma", body: "Yurttan merkeze inen yolun bir kısmı geceleri çok karanlık. Aydınlatma eklenmesini rica ediyorum.", category: "Yaşam", votes: 41, status: "degerlendiriliyor", createdAt: ago(1 * D + 3 * H), mine: true, anonymous: false, reply: null },
];

export const FAKE_NOTIFICATIONS: AppNotification[] = [
  { id: -1, type: "oneri_yaniti", title: "Önerine yanıt geldi", body: "“Kütüphane sınav haftasında 24 saat açık olsun” önerine yetkili birim yanıt verdi.", payload: { suggestion_id: -1 }, readAt: null, createdAt: ago(25) },
  { id: -2, type: "durum", title: "Bildiriminin durumu değişti", body: "Mühendislik Fakültesi 2. kat aydınlatma arızası bildirimin “İşleme alındı” durumuna geçti.", payload: { report_id: -1 }, readAt: null, createdAt: ago(3 * H) },
  { id: -3, type: "durum", title: "Bildirimin çözüldü", body: "Yemekhane girişindeki ıslak zemin bildirimin çözüldü olarak işaretlendi.", payload: { report_id: -2 }, readAt: null, createdAt: ago(7 * H) },
  { id: -4, type: "oneri_yaniti", title: "Önerine yanıt geldi", body: "“Ders programı sistemi mobil uyumlu olsun” önerin uygulandı.", payload: { suggestion_id: -4 }, readAt: ago(20 * H), createdAt: ago(1 * D + 2 * H) },
  { id: -5, type: "durum", title: "Bildiriminin durumu değişti", body: "Kuzey kapı otopark lambası bildirimin ekibe atandı.", payload: { report_id: -3 }, readAt: ago(1 * D), createdAt: ago(1 * D + 6 * H) },
  { id: -6, type: "durum", title: "Bildirimin çözüldü", body: "Kütüphane 1. kat klima arızası bildirimin çözüldü.", payload: { report_id: -4 }, readAt: ago(3 * D), createdAt: ago(4 * D) },
  { id: -7, type: "oneri_yaniti", title: "Önerine yanıt geldi", body: "“Kütüphanede grup çalışma odaları rezervasyonla olsun” önerine yanıt verildi.", payload: { suggestion_id: -6 }, readAt: ago(5 * D), createdAt: ago(6 * D) },
];

// Popular complaints for /populer (MapReport shape + building name).
const rep = (
  id: number, title: string, description: string, category: string, urgency: "dusuk" | "orta" | "acil",
  status: "alindi" | "atandi" | "islemde" | "cozuldu", votes: number, building: string, floor: number | null,
  createdMin: number, resolvedMin: number | null = null, aiSummary: string | null = null,
) => ({
  id, title, description, category, urgency, status, unitId: null, buildingId: null, floor, lat: null, lng: null,
  aiSummary, voteCount: votes, createdAt: ago(createdMin), resolvedAt: resolvedMin == null ? null : ago(resolvedMin),
  reporterId: null, coverUrl: null, buildingName: building,
}) as import("@/components/popular/PopularComplaints").PopularReport;

export const FAKE_POPULAR = [
  rep(-101, "Kütüphane 2. kat klima çalışmıyor", "Sınav haftasında salon çok sıcak, çalışmak mümkün olmuyor.", "isitma_sogutma", "acil", "islemde", 212, "Merkez Kütüphane", 2, 3 * D, null, "Merkez Kütüphane 2. kattaki klima arızası çalışma salonunu kullanılamaz hale getiriyor; teknik ekip işlemde."),
  rep(-102, "Mühendislik Fakültesi asansörü sürekli arızalı", "Asansör haftada birkaç kez duruyor, engelli öğrenciler üst katlara çıkamıyor.", "asansor_erisilebilirlik", "acil", "atandi", 168, "Mühendislik Fakültesi", 0, 6 * D, null, "Asansör arızaları erişilebilirliği engelliyor; bakım firmasına atandı."),
  rep(-103, "Yurt çevresi yolunda aydınlatma yok", "Akşam 19:00'dan sonra yol çok karanlık, güvenli hissetmiyoruz.", "aydinlatma", "orta", "alindi", 143, "Kız Öğrenci Yurdu", null, 2 * D),
  rep(-104, "Wi-Fi ağı derslikte sürekli kopuyor", "Derslerde eduroam bağlantısı kopuyor, online sınavlarda sorun yaşıyoruz.", "internet_ag", "orta", "islemde", 121, "Fen-Edebiyat Fakültesi", 1, 4 * D, null, "Derslik bölgesindeki erişim noktası yetersiz; Bilgi İşlem ek cihaz kuruyor."),
  rep(-105, "Yemekhane girişinde zemin kaygan", "Yağmurlu günlerde girişte kayıp düşen oldu.", "su_tesisat", "acil", "atandi", 97, "Merkez Yemekhane", 0, 1 * D + 4 * H),
  rep(-106, "Kantin önündeki çöp kutuları taşıyor", "Çöp kutuları gün içinde boşaltılmıyor, koku ve kirlilik var.", "temizlik", "dusuk", "alindi", 74, "Öğrenci Merkezi", 0, 3 * D),
  rep(-107, "Derslik sıraları kırık", "A-204 numaralı dersliğin birkaç sırası yerinden oynamış durumda.", "mobilya", "dusuk", "islemde", 52, "İktisat Fakültesi", 2, 5 * D),
  rep(-108, "Otopark girişinde kamera çalışmıyor", "Gece otoparkta güvenlik kamerası görüntü vermiyor.", "guvenlik", "orta", "alindi", 39, "Kuzey Otopark", null, 8 * H),
  rep(-109, "Spor salonu duşlarında sıcak su yok", "Sabah saatlerinde sıcak su gelmiyor.", "su_tesisat", "orta", "alindi", 33, "Spor Salonu", 0, 1 * D),
  rep(-110, "Kütüphane giriş turnikesi arızası", "Turnike kartları okumuyor, girişte kuyruk oluşuyor.", "diger", "orta", "cozuldu", 88, "Merkez Kütüphane", 0, 7 * D, 2 * D),
  rep(-111, "Fen Fakültesi koridor lambaları yanmıyor", "Zemin kat koridorunda lambalar yanmıyor.", "aydinlatma", "orta", "cozuldu", 64, "Fen Fakültesi", 0, 5 * D, 1 * D),
  rep(-112, "Yurt çamaşırhanesi kullanılamıyor", "Makineler hata veriyor.", "diger", "dusuk", "cozuldu", 45, "Erkek Öğrenci Yurdu", 0, 9 * D, 3 * H),
];

// Active reports for the "Takip ettiklerin" slider on /bildirimlerim.
const mineItem = (id: number, title: string, status: "alindi" | "atandi" | "islemde", urgency: "dusuk" | "orta" | "acil", category: string, createdMin: number) => ({
  id, title, description: title, category, urgency, status, unitId: null, buildingId: null, floor: 1, lat: null, lng: null,
  aiSummary: null, voteCount: 12, createdAt: ago(createdMin), resolvedAt: null, reporterId: "preview", coverUrl: null,
  events: [], photos: { once: [], sonra: [], ek: [] },
}) as import("@/components/my-reports/types").MyReportItem;

export const FAKE_MINE = [
  mineItem(-201, "Kütüphane 2. kat priz arızası", "islemde", "orta", "aydinlatma", 2 * D),
  mineItem(-202, "Yemekhane girişinde zemin kaygan", "atandi", "acil", "su_tesisat", 1 * D),
  mineItem(-203, "Derslikte projeksiyon çalışmıyor", "alindi", "dusuk", "diger", 3 * H),
];
