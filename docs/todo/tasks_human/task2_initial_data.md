# Task 2: Başlangıç Verileri ve Marka Kimliği (Human)

## 🎯 Hedef
İlk tenant (TR) için sisteme girilecek marka kimliği verilerini, ilk kullanıcı listesini ve yasal metinleri hazırlamak.

## ⚠️ Bu Task Ne Zaman Yapılmalı?
Backend ve veritabanı kurulumu (Task 1 Claude) tamamlandıktan sonra. Veriler doğrudan Render.com database'ine veya admin paneli üzerinden girilecek.

---

## 📋 1. Marka Kimliği – TR Tenant Yapılandırması

Sistem açıldığında TR tenant'ının görsel kimliği şu bilgilerle yapılandırılır. Bu bilgileri hazırlayıp geliştirici ile paylaş:

### Renkler
Greenleaf Global'in kurumsal marka renklerini belirle:

```
Primary Color (Ana Renk)  : #______  (örn: #2D6A4F koyu yeşil)
Secondary Color (İkincil) : #______  (örn: #74C69D açık yeşil)
```

> 💡 Greenleaf Global'in web sitesinden veya marka kılavuzundan renk kodlarını al.

### Logo
- [ ] Greenleaf logosu **SVG veya PNG** formatında hazırla (şeffaf arka plan tercih)
- [ ] Minimum çözünürlük: 512x512 px
- [ ] Dosya adı: `greenleaf_logo.png`

### Sosyal Medya Linkleri (Opsiyonel)
Admin panelinden sonradan eklenebilir ama şimdi hazırlayabilirsin:

```
Instagram : https://instagram.com/...
YouTube   : https://youtube.com/...
WhatsApp  : https://wa.me/...
Telegram  : https://t.me/...
```

---

## 📋 2. İlk Tenant Kaydı (Veritabanına Manuel Giriş)

Faz 1'de SuperAdmin paneli henüz yok. İlk TR tenant kaydı doğrudan veritabanına SQL ile girilecek:

```sql
-- Bu SQL'i geliştirici (Claude) ile paylaş; o çalıştıracak.
INSERT INTO tenants (id, slug, name, is_active, config, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'tr',
  'Greenleaf Türkiye',
  true,
  '{
    "primary_color": "#______",
    "secondary_color": "#______",
    "logo_url": null,
    "social_media": {
      "instagram": "https://instagram.com/...",
      "youtube": "https://youtube.com/..."
    },
    "support_links": {
      "whatsapp": "https://wa.me/..."
    }
  }',
  NOW(),
  NOW()
);
```

> **Renk kodlarını, sosyal medya linklerini doldur** ve bu SQL'i geliştiriciye ilet.

---

## 📋 3. İlk SuperAdmin Hesabı

TR tenant'ı için ilk admin kullanıcısını oluştur. Bu kişi sistemi yönetecek:

```
Ad Soyad    : ______________________
Kullanıcı Adı: ______________________
E-posta     : ______________________@__________
Şifre       : ______________________ (güçlü, 12+ karakter)
```

> ⚠️ Bu bilgileri güvenli bir yerde sakla. Şifreyi e-posta veya mesajla paylaşma.
> Geliştiriciye sadece kullanıcı adı ve e-postayı ver; şifreyi kendin belirle.

---

## 📋 4. KVKK / Aydınlatma Metni

Kayıt sırasında kullanıcılara onaylatılacak yasal metin. Bir avukattan veya hazır KVKK şablonundan düzenle:

Metin şu bilgileri içermeli:
- Veri sorumlusunun adı ve iletişim bilgileri
- Hangi kişisel verilerin toplandığı (ad, e-posta, partner ID)
- Verilerin işlenme amacı (eğitim platformu erişimi)
- Saklama süresi (1 yıl hareketsizlik sonrası silinir)
- Kullanıcının hakları (silme, güncelleme)

**Teslim formatı:** Düz metin veya basit HTML (karmaşık tasarım gerekmez)

---

## 📋 5. İlk 5-10 Partner Verisi (Opsiyonel)

Sisteme girilecek ilk "pilot" partnerların bilgileri:

| # | Ad Soyad | E-posta | Greenleaf Global Partner ID |
|---|----------|---------|----------------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| ... | | | |

> Bu kişiler kayıt olduklarında `partner_id` alanını doldurmak için kullanılır.
> Admin paneli açıldığında bu kişiler "onay bekleyenler" listesinden onaylanır.

---

## ✅ Kontrol Listesi

- [x] Primary ve secondary renk kodları (HEX) belirlendi
- [x] Logo dosyası hazır (SVG veya PNG, şeffaf arka plan)
- [x] Sosyal medya linkleri hazır
- [x] Tenant SQL kaydı geliştiriciye iletildi
- [x] SuperAdmin kullanıcı bilgileri hazırlandı (şifre güvenli saklandı)
- [x] KVKK/Aydınlatma metni hazır (düz metin veya HTML)

---

## 📝 Implementation Summary (2026-04-19)

Gaffar Dulkadir tarafından sağlanan verilerle sistemin ilk ayağa kaldırılması tamamlandı:
- **Tenant:** `tr` tenant'ı `#4AA435` ana rengi ve `logo.svg` ile yapılandırıldı.
- **SuperAdmin:** `gaffar-dulkadir` hesabı oluşturuldu, şifre `bcrypt` ile hash'lendi.
- **Legal:** KVKK ve Şartlar metinleri için taslaklar tenant konfigürasyonuna eklendi.
- **Statik Dosyalar:** Logo dosyası `backend/static/` altına taşındı.
