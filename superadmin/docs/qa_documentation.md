# Greenleaf Superadmin Q&A Documentation

## Project Vision
The Superadmin is a central command center that manages and monitors multiple independent Greenleaf Academy deployments (TR, DE, etc.). Instead of a shared database, it communicates with deployments via specialized internal APIs.

---

### Q1: Merkezi Yönetim Kapsamı
**Question:** Superadmin paneli üzerinden bir "Deployment" eklediğimizde, sadece o instance'ın durumunu mu izleyeceğiz yoksa verilere tam erişimimiz olacak mı?

**Answer:** Superadmin, her deployment'ta bulunan özel API uç noktalarına istek atarak veri alacak ve yönetimsel aksiyonlar alabilecek. Sadece bir health-check değil, veri odaklı bir yönetim merkezi olacak.

### Q2: API Mimarisi ve Güvenlik
**Question:** Her deployment için yazılacak bu API'ların standardı ve güvenliği nasıl olmalı?

**Status:** *Awaiting Answer* (Read/Write limits and Authentication protocol).

## Technical Requirements (Planned)
1. **Internal Stats API:** Each deployment must expose an endpoint for metrics (user count, active sessions, storage usage).
2. **Action API:** Superadmin should be able to trigger actions (maintenance mode, version updates, license management).
3. **Authentication:** Secure handshake using `api_key` stored in the Superadmin `deployments` table.
