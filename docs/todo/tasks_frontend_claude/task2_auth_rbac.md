# Task 2: Auth & RBAC Alignment

## 🎯 Hedefler
- [ ] **UserRoleContext Entegrasyonu:**
    - Rol bilgilerinin sadece context değil, her sayfa geçişinde backend doğrulamasına (verify-global) bağlanması.
    - `SUPERADMIN` rolü için özel yetki kontrollerinin eklenmesi.
- [ ] **Server-side Guards:**
    - `proxy.ts` (eski middleware) üzerinden dil ve rol korumalarının güçlendirilmesi.
    - Yetkisiz erişim durumunda "Unauthorized" sayfası yerine şık bir bilgilendirme modalı veya yönlendirme.

# Task 3: Feature & Logic Sync

## 🎯 Hedefler
- [ ] **Academy Page Refactor:**
    - YouTube Player'ın backend'den gelen "unlisted" ayarlarıyla tam uyumlu çalışması.
    - `resource_links` API'sinden gelen materyallerin ders detaylarına eklenmesi.
- [ ] **Dashboard Sync:**
    - `announcements` API'sine bağlanarak güncel duyuruların dashboard'da sergilenmesi.
    - Kullanıcı gelişim istatistiklerinin (`progress` API) anlık güncellenmesi.
- [ ] **Calendar Integration:**
    - Statik etkinlik verilerinin `events` API'si ile dinamik hale getirilmesi.
    - Etkinlik detaylarına göre "Katıl" butonunun otomatik aktif/pasif edilmesi.
