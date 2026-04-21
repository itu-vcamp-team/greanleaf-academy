"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Trash2, History, User, Lock, Loader2, CheckCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  username: string;
  consent_given_at: string | null;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function SettingsPage({ params: _params }: PageProps) {
  const { user, setAuth, access_token, refresh_token } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    apiClient.get("/auth/profile").then((res) => {
      setProfile(res.data);
      setFullName(res.data.full_name ?? "");
      setPhone(res.data.phone ?? "");
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      await apiClient.patch("/auth/profile", { full_name: fullName, phone });
      setProfileSuccess(true);
      // Update the auth store with new name
      if (user && access_token && refresh_token) {
        setAuth({ ...user, full_name: fullName }, access_token, refresh_token);
      }
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setProfileError(detail ?? "Kayıt başarısız.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await apiClient.patch("/auth/profile", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setPasswordError(detail ?? "Şifre değiştirme başarısız.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto pt-32 px-6 pb-20 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black tracking-tight mb-1">Hesap Ayarları</h1>
          <p className="text-foreground/40 text-sm">Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin.</p>
        </motion.div>

        {/* Profile Section */}
        <GlassCard className="p-0 overflow-hidden border-white/5">
          <SectionHeader icon={<User className="w-4 h-4 text-primary" />} title="Profil Bilgileri" />
          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-2">Ad Soyad</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-2">Telefon</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 555 555 55 55"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-2">E-posta (değiştirilemez)</label>
              <Input value={profile?.email ?? ""} disabled className="opacity-50 cursor-not-allowed" />
            </div>
            {profileError && (
              <p className="text-xs text-red-400 font-medium">{profileError}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <CheckCircle className="w-4 h-4" /> Kaydedildi
                </span>
              )}
              <Button
                type="submit"
                size="sm"
                className="ml-auto rounded-xl"
                disabled={savingProfile}
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Password Section */}
        <GlassCard className="p-0 overflow-hidden border-white/5">
          <SectionHeader icon={<Lock className="w-4 h-4 text-primary" />} title="Şifre Değiştir" />
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-2">Mevcut Şifre</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-2">Yeni Şifre</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-2">Tekrar Yeni Şifre</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-xs text-red-400 font-medium">{passwordError}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              {passwordSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <CheckCircle className="w-4 h-4" /> Şifre güncellendi
                </span>
              )}
              <Button
                type="submit"
                size="sm"
                className="ml-auto rounded-xl"
                disabled={savingPassword}
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Şifreyi Değiştir"}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Audit Log Section */}
        <GlassCard className="p-0 overflow-hidden border-white/5">
          <SectionHeader icon={<History className="w-4 h-4 text-foreground/40" />} title="Onay Geçmişi (KVKK)" />
          <div className="p-6">
            <div className="bg-black/10 rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
              {profile?.consent_given_at ? (
                <AuditRow
                  event="KVKK Aydınlatma Metni Onayı"
                  timestamp={new Date(profile.consent_given_at).toLocaleString("tr-TR")}
                />
              ) : (
                <p className="p-4 text-sm text-foreground/30 italic">Onay kaydı bulunamadı.</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-0 overflow-hidden border-red-500/10">
          <SectionHeader icon={<Shield className="w-4 h-4 text-red-400" />} title="Tehlikeli Alan" />
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-red-400">Hesabı Kalıcı Olarak Sil</h4>
              <p className="text-xs text-foreground/40 mt-1 max-w-md">
                Tüm eğitim ilerlemeniz ve kişisel bilgileriniz{" "}
                <span className="text-red-400/70 font-bold">geri döndürülemez şekilde</span> silinecektir.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 flex-shrink-0"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hesabımı Sil
            </Button>
          </div>
        </GlassCard>
      </main>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass border-red-500/30 p-8 text-center rounded-3xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Emin misiniz?</h2>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Bu işlem durdurulamaz. Tüm verileriniz GDPR/KVKK uyumlu olarak
                <span className="text-white font-bold"> kalıcı olarak</span> silinecektir.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Vazgeç
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 border-none">
                  Evet, Her Şeyi Sil
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -- Sub-components --

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 p-6 border-b border-white/5 bg-white/[0.02]">
      {icon}
      <h2 className="font-bold text-sm">{title}</h2>
    </div>
  );
}

function AuditRow({ event, timestamp }: { event: string; timestamp: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <p className="text-sm font-bold text-white/80">{event}</p>
      <p className="text-xs text-white/40">{timestamp}</p>
    </div>
  );
}
