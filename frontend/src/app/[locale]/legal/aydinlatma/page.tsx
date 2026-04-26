import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileText } from "lucide-react";

export default function AydınlatmaPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto pt-32 px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Aydınlatma Metni</h1>
            <p className="text-gray-500 font-medium italic">Kullanım Şartları ve Veri İşleme Bilgilendirmesi</p>
          </div>
        </div>

        <GlassCard className="p-10 border-foreground/5 shadow-sm space-y-8 text-gray-700 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-blue-500 pl-4">Metnin Amacı</h2>
            <p>
              Bu aydınlatma metni, Greenleaf Akademi platformu kullanıcılarının veri toplama süreçleri, 
              çerez kullanımı ve platform içi davranışların nasıl kaydedildiği hakkında şeffaf bir 
              bilgilendirme sunmak amacıyla oluşturulmuştur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-blue-500 pl-4">Hangi Verileri Neden İşliyoruz?</h2>
            <p>
              Platformumuzda geçirdiğiniz süre boyunca; eğitim videolarını tamamlama oranlarınız, 
              katıldığınız etkinlikler ve sistem içi etkileşimleriniz kaydedilmektedir. Bu veriler:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sizin için en uygun eğitim yolculuğunu tasarlamak,</li>
              <li>İlerleme durumunuzu sertifikalandırmak,</li>
              <li>Platform performansını optimize etmek amacıyla kullanılır.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-blue-500 pl-4">Çerezler (Cookies)</h2>
            <p>
              Tarayıcınızda saklanan çerezler, oturumunuzun açık kalmasını sağlamak ve tercihlerinizi 
              hatırlamak için kullanılır. İsterseniz tarayıcı ayarlarınızdan çerezleri devre dışı 
              bırakabilirsiniz ancak bu durumda platformun bazı özellikleri çalışmayabilir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-blue-500 pl-4">Güvenlik Önlemleri</h2>
            <p>
              Kişisel verileriniz yüksek güvenlikli sunucularda şifrelenmiş olarak saklanmaktadır. 
              Veri tabanı erişimleri sıkı denetim altındadır ve yetkisiz erişimlere karşı modern 
              siber güvenlik protokolleri uygulanmaktadır.
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
