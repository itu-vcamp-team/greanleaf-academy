"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Loader2, Globe, Key, User, Phone, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

export function RegistrationFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  
  // Step 1: Base Info
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    phone: ""
  });
  
  // Step 2: Global Account
  const [glData, setGlData] = useState({
    gl_username: "",
    gl_password: ""
  });
  
  // Step 3: Finalize
  const [hasPartnerId, setHasPartnerId] = useState(true);
  const [referenceCode, setReferenceCode] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  
  const router = useRouter();

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/register/step1", formData);
      setSessionId(res.data.session_id);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt başlatılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/register/step2", {
        session_id: sessionId,
        ...glData
      });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Global hesap doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/register/step3", {
        session_id: sessionId,
        has_partner_id: hasPartnerId,
        reference_code: hasPartnerId ? referenceCode : null,
        supervisor_name: !hasPartnerId ? supervisorName : null
      });
      
      if (res.data.status === "pending_email_verification") {
        setStep(4); // Success / Verification notice
      } else {
        router.push("/academy");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/20 border border-white/5"
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Hesap Oluştur</h1>
                <p className="text-white/40 text-sm italic">Akademi yolculuğuna ilk adımı atın.</p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <Input 
                  label="Ad Soyad" 
                  placeholder="Ahmet Yılmaz" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required 
                />
                <Input 
                  label="E-Posta" 
                  type="email"
                  placeholder="ahmet@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
                <Input 
                  label="Kullanıcı Adı" 
                  placeholder="ahmet_yılmaz" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required 
                />
                <Input 
                  label="Şifre" 
                  type="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
                {error && <p className="text-red-400 text-xs italic">{error}</p>}
                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg" loading={loading}>
                  Devam Et
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Global Doğrulama</h1>
                <p className="text-white/40 text-sm italic">Greenleaf Global (Office) hesabınızı bağlayın.</p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-4">
                <Input 
                  label="Office Kullanıcı Adı" 
                  placeholder="GL12345" 
                  value={glData.gl_username}
                  onChange={(e) => setGlData({...glData, gl_username: e.target.value})}
                  required 
                />
                <Input 
                  label="Office Şifresi" 
                  type="password"
                  placeholder="••••••••" 
                  value={glData.gl_password}
                  onChange={(e) => setGlData({...glData, gl_password: e.target.value})}
                  required 
                />
                {error && <p className="text-red-400 text-xs italic">{error}</p>}
                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg" loading={loading}>
                  Doğrula ve Devam Et
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Partnerlik Onayı</h1>
                <p className="text-white/40 text-sm">Sponsor bilgilerinizi girin.</p>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5">
                  <button 
                    type="button"
                    onClick={() => setHasPartnerId(true)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasPartnerId ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Referans Kodum Var
                  </button>
                  <button 
                    type="button"
                    onClick={() => setHasPartnerId(false)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!hasPartnerId ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    Kodum Yok
                  </button>
                </div>

                {hasPartnerId ? (
                  <Input 
                    label="Referans Kodu" 
                    placeholder="GL-XXXXX" 
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    required 
                  />
                ) : (
                  <Input 
                    label="Üst Sponsor Adı (Biliniyorsa)" 
                    placeholder="Ad Soyad" 
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                  />
                )}
                
                {error && <p className="text-red-400 text-xs italic">{error}</p>}

                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg" loading={loading}>
                  Kaydı Tamamla
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="p-10 border-green-500/20 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-lg shadow-green-500/10">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4 italic text-green-400">Harika Bir Başlangıç!</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Hesabınız başarıyla oluşturuldu. <br/>
                Lütfen e-posta adresinize gönderdiğimiz doğrulama kodunu kontrol edin. 
                Doğrulama sonrası tüm eğitimlere erişebileceksiniz.
              </p>
              <Button onClick={() => router.push("/")} className="w-full rounded-2xl py-6 h-auto">
                 Ana Sayfaya Dön
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

  return (
    <div className="w-full max-w-md">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/20 border border-white/5"
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5" animate>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Global Doğrulama</h1>
                <p className="text-white/40 text-sm italic">Greenleaf Global (Office) hesabınızı doğrulayarak başlayın.</p>
              </div>

              <form onSubmit={handleGlobalVerify} className="space-y-4">
                <Input 
                  label="Office Kullanıcı Adı" 
                  placeholder="Kullanıcı adınız" 
                  value={globalLogin}
                  onChange={(e) => setGlobalLogin(e.target.value)}
                  required 
                />
                <Input 
                  label="Office Şifresi" 
                  type="password"
                  placeholder="••••••••" 
                  value={globalPassword}
                  onChange={(e) => setGlobalPassword(e.target.value)}
                  error={error}
                  required 
                />
                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg" loading={loading}>
                  Doğrula ve Devam Et
                </Button>
                <p className="text-[10px] text-white/20 text-center leading-relaxed">
                  Şifreniz sadece doğrulama için kullanılır ve asla kaydedilmez.
                </p>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5" animate>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <UserPlus className="w-6 h-6 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Profilini Oluştur</h1>
                <p className="text-white/40 text-sm">Akademi kimliğinizi tanımlayın.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Partner ID (Atandı)</p>
                    <p className="text-lg font-black text-white">{mockId}</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-primary opacity-40" />
                </div>

                <Input 
                  label="E-Posta" 
                  type="email"
                  placeholder="ahmet@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <Input 
                  label="Akademi Kullanıcı Adı" 
                  placeholder="ahmet_yılmaz" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
                
                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg">
                  Son Adıma Geç
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-8 border-white/5" animate>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Şifre Belirle</h1>
                <p className="text-white/40 text-sm">Akademi platformu için giriş şifrenizi oluşturun.</p>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <Input 
                  label="Yeni Şifre" 
                  type="password"
                  placeholder="••••••••" 
                  value={academyPassword}
                  onChange={(e) => setAcademyPassword(e.target.value)}
                  required 
                />
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" required className="mt-1 accent-primary" />
                    <span className="text-[11px] text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">
                      <span className="text-primary underline">KVKK Aydınlatma Metni</span> ve Kullanım Şartları'nı okudum, kabul ediyorum.
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest" size="lg" loading={loading}>
                  Kaydı Tamamla ve Giriş Yap
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
