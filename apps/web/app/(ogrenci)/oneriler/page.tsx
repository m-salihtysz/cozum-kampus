import { redirect } from "next/navigation";

// Öneriler artık Gündem sayfasının bir sekmesi; eski bağlantılar (ve #oneri-ID çapaları) oraya yönlenir.
export default function SuggestionsPage() {
  redirect("/populer?sekme=oneriler");
}
