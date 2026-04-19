# Task 1: Çekirdek Mimari & Veri Katmanı Refaktörü

Bu görev, Frontend'in temel yapı taşlarını backend ile uyumlu hale getirmeyi ve Next.js 16 standartlarına geçişi hedefler.

## 🎯 Hedefler
- [ ] **API Client (Axios) Güncellemesi:**
    - `X-Tenant-ID` header'ının tüm isteklere otomatik eklenmesi (TenantContext'ten alınacak).
    - Hata yakalama (error handling) için global bir interceptor eklenmesi.
- [ ] **TenantContext Yenilenmesi:**
    - Mock verilerin kaldırılması.
    - Uygulama başlarken (yüklenirken) backend'den kiracı konfigürasyonunun çekilmesi.
    - Dinamik renk ve logo yönetiminin (`document.documentElement.style`) backend verisine bağlanması.
- [ ] **Next.js 16 Uyumluluğu:**
    - Tüm `layout.tsx` ve `page.tsx` dosyalarındaki `params` ve `searchParams` nesnelerinin asenkron (`await`) olarak işlenmesi.
    - Gereksiz `use client` direktiflerinin optimize edilmesi (sunucu taraflı render avantajları için).

## 🛠️ Teknik Detaylar
- `api-client.ts` içinde `config.headers['X-Tenant-ID'] = currentTenantSlug` mantığı kurulacak.
- `TenantProvider` içinde `fetchTenantConfig(slug)` fonksiyonu implemente edilecek.

## ✅ Doğrulama
- Browser konsolunda "Missing context" veya "params must be awaited" hatalarının kalmadığının teyidi.
- Network loglarında tüm isteklerin `X-Tenant-ID` header'ını taşıdığının kontrolü.
