import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield } from "lucide-react";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto pt-32 px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">KVKK Politikası</h1>
            <p className="text-gray-500 font-medium italic">Kişisel Verilerin Korunması ve İşlenmesi</p>
          </div>
        </div>

        <GlassCard className="p-10 border-foreground/5 shadow-sm space-y-8 text-gray-700 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary pl-4">1. Veri Sorumlusu</h2>
            <p>
              Greenleaf Akademi olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
              verilerinizin güvenliğini en üst seviyede tutuyoruz. Bu metin, platformumuzu kullanırken 
              toplanan verilerinizin nasıl işlendiği ve korunduğu hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary pl-4">2. Toplanan Veriler</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kimlik Bilgileri (Ad, Soyad, Kullanıcı Adı)</li>
              <li>İletişim Bilgileri (E-posta adresi, Telefon numarası)</li>
              <li>Eğitim Verileri (İzlenen videolar, tamamlanan eğitimler, puanlar)</li>
              <li>Sistem Kayıtları (IP adresi, tarayıcı bilgileri, giriş zamanları)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary pl-4">3. İşleme Amaçları</h2>
            <p>
              Toplanan verileriniz; platform üyelik işlemlerinin tamamlanması, eğitim süreçlerinin takibi, 
              size özel içeriklerin sunulması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary pl-4">4. Veri Aktarımı</h2>
            <p>
              Kişisel verileriniz, yasal zorunluluklar haricinde asla üçüncü şahıslarla paylaşılmaz. 
              Sadece Greenleaf Global ekosistemi içerisindeki doğrulama süreçleri için gerekli olan 
              asgari veriler ilgili birimlerle paylaşılabilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-primary pl-4">5. Haklarınız</h2>
            <p>
              KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, 
              düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Taleplerinizi profil ayarlarınız 
              üzerinden veya iletişim kanallarımızdan bize iletebilirsiniz.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 flex justify-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Son Güncelleme: 26 Nisan 2026
            </p>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
