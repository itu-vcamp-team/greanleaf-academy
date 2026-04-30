"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus, Trash2, Pencil, Zap, ShieldCheck,
  Loader2, ExternalLink, Globe, Lock, Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";

type ContentType = "SHORT" | "MASTERCLASS";
type ContentStatus = "PUBLISHED" | "DRAFT";

interface AcademyContent {
  id: string;
  type: ContentType;
  locale: string;
  title: string;
  description: string | null;
  video_url: string | null;
  resource_link: string | null;
  resource_link_label: string | null;
  order: string;
  status: ContentStatus;
  is_new: boolean;
  is_public: boolean;
  thumbnail_url: string | null;
}

// Default built-in locales — admin can add more via the custom field
const DEFAULT_LOCALES = [
  { value: "tr-TR", label: "🇹🇷 Türkçe (tr-TR)" },
  { value: "en-US", label: "🇬🇧 English (en-US)" },
  { value: "de-DE", label: "🇩🇪 Deutsch (de-DE)" },
  { value: "fr-FR", label: "🇫🇷 Français (fr-FR)" },
  { value: "ar-SA", label: "🇸🇦 العربية (ar-SA)" },
];

const emptyForm = {
  type: "SHORT" as ContentType,
  locale: "tr-TR",
  title: "",
  description: "",
  video_url: "",
  resource_link: "",
  resource_link_label: "",
  order: "000000",
  status: "PUBLISHED" as ContentStatus,
  is_new: false,
  is_public: true,
  prerequisite_id: "",
};

export default function AdminAcademyContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>("SHORT");
  const [contents, setContents] = useState<AcademyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [customLocale, setCustomLocale] = useState("");
  const [showCustomLocale, setShowCustomLocale] = useState(false);
  const [extraLocales, setExtraLocales] = useState<string[]>([]);

  // All available locale options (defaults + any custom ones added)
  const allLocales = [
    ...DEFAULT_LOCALES,
    ...extraLocales.map((v) => ({ value: v, label: `🌐 ${v}` })),
  ];

  useEffect(() => {
    fetchContents();
  }, [activeTab]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/academy/admin/contents?type=${activeTab}`);
      setContents(res.data);
    } catch {
      console.error("Failed to fetch contents");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, type: activeTab });
    setShowCustomLocale(false);
    setCustomLocale("");
    setShowForm(true);
  };

  const openEdit = (item: AcademyContent) => {
    setEditingId(item.id);
    const knownLocale = DEFAULT_LOCALES.some((l) => l.value === item.locale);
    if (!knownLocale && item.locale && !extraLocales.includes(item.locale)) {
      setExtraLocales((prev) => [...prev, item.locale]);
    }
    setForm({
      type: item.type,
      locale: item.locale ?? "tr-TR",
      title: item.title,
      description: item.description ?? "",
      video_url: item.video_url ?? "",
      resource_link: item.resource_link ?? "",
      resource_link_label: item.resource_link_label ?? "",
      order: item.order,
      status: item.status,
      is_new: item.is_new,
      is_public: item.is_public,
      prerequisite_id: "",
    });
    setShowCustomLocale(false);
    setCustomLocale("");
    setShowForm(true);
  };

  const handleAddCustomLocale = () => {
    const trimmed = customLocale.trim();
    if (!trimmed) return;
    if (!extraLocales.includes(trimmed)) {
      setExtraLocales((prev) => [...prev, trimmed]);
    }
    setForm({ ...form, locale: trimmed });
    setShowCustomLocale(false);
    setCustomLocale("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        prerequisite_id: form.prerequisite_id || null,
        resource_link: form.resource_link || null,
        resource_link_label: form.resource_link_label || null,
        description: form.description || null,
      };

      if (editingId) {
        await apiClient.patch(`/academy/contents/${editingId}`, payload);
      } else {
        await apiClient.post("/academy/contents", payload);
      }

      setShowForm(false);
      fetchContents();
    } catch (err) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(message ?? "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/academy/contents/${id}`);
      fetchContents();
    } catch {
      alert("Silme başarısız.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newContents = [...contents];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newContents.length) return;
    
    [newContents[index], newContents[targetIndex]] = [newContents[targetIndex], newContents[index]];
    setContents(newContents);
    
    try {
      await apiClient.post("/academy/contents/reorder", newContents.map(c => c.id));
    } catch {
      alert("Sıralama güncellenemedi.");
      fetchContents();
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-primary mb-3">
            <Zap className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">İçerik Yönetimi</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Akademi <span className="text-primary italic">İçerikleri</span>
          </h1>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-2xl px-8 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Yeni İçerik Ekle
        </Button>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1.5 bg-surface rounded-2xl w-fit">
        {(["SHORT", "MASTERCLASS"] as ContentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground/40 hover:text-foreground/60"
            }`}
          >
            {tab === "SHORT" ? <Zap size={15} /> : <ShieldCheck size={15} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20 text-foreground/40 italic">
          Henüz içerik eklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {contents.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="p-5 flex flex-col gap-3 border-border hover:border-primary/20 transition-colors">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full aspect-video object-cover rounded-xl"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-foreground text-sm line-clamp-2">{item.title}</p>
                      {/* Locale badge */}
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-foreground/5 text-foreground/50">
                        <Globe size={9} /> {item.locale}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                        item.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-surface text-foreground/50"
                      }`}>
                        {item.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                      </span>
                      {/* Public/Private badge */}
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 ${
                        item.is_public
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {item.is_public ? <><Unlock size={9} /> Herkese Açık</> : <><Lock size={9} /> Özel</>}
                      </span>
                    </div>
                  </div>
                  {item.video_url && (
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary font-bold hover:underline"
                    >
                      <ExternalLink size={11} /> Video Linkini Aç
                    </a>
                  )}
                  <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 rounded-xl border-border"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={13} /> Düzenle
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl px-2 border-border disabled:opacity-30"
                        onClick={() => handleMove(contents.indexOf(item), "up")}
                        disabled={contents.indexOf(item) === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl px-2 border-border disabled:opacity-30"
                        onClick={() => handleMove(contents.indexOf(item), "down")}
                        disabled={contents.indexOf(item) === contents.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-50 rounded-xl px-3"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-2xl font-black text-foreground mb-6">
                  {editingId ? "İçeriği Düzenle" : "Yeni İçerik Ekle"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Type + Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground/50 mb-2">Tür</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as ContentType })}
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-foreground"
                      >
                        <option value="SHORT">SHORT</option>
                        <option value="MASTERCLASS">MASTERCLASS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground/50 mb-2">Durum</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-foreground"
                      >
                        <option value="PUBLISHED">Yayında</option>
                        <option value="DRAFT">Taslak</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Language Selector */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-2">
                      <Globe size={11} className="inline mr-1" />Dil
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={form.locale}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setShowCustomLocale(true);
                          } else {
                            setForm({ ...form, locale: e.target.value });
                            setShowCustomLocale(false);
                          }
                        }}
                        className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-foreground"
                      >
                        {allLocales.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                        <option value="__custom__">+ Dil Ekle…</option>
                      </select>
                    </div>

                    {/* Custom locale input */}
                    <AnimatePresence>
                      {showCustomLocale && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 flex gap-2"
                        >
                          <Input
                            value={customLocale}
                            onChange={(e) => setCustomLocale(e.target.value)}
                            placeholder="ör. pt-BR, ja-JP, ru-RU"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); handleAddCustomLocale(); }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl px-4 shrink-0"
                            onClick={handleAddCustomLocale}
                          >
                            Ekle
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-xl px-3 shrink-0"
                            onClick={() => { setShowCustomLocale(false); setCustomLocale(""); }}
                          >
                            İptal
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-2">Başlık *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="İçerik başlığı"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-2">Açıklama</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Kısa açıklama..."
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-surface text-foreground"
                    />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-2">YouTube URL *</label>
                    <Input
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                      required
                    />
                  </div>

                  {/* Resource Link + Label */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground/50 mb-2">Kaynak Linki</label>
                      <Input
                        value={form.resource_link}
                        onChange={(e) => setForm({ ...form, resource_link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground/50 mb-2">Link Etiketi</label>
                      <Input
                        value={form.resource_link_label}
                        onChange={(e) => setForm({ ...form, resource_link_label: e.target.value })}
                        placeholder="PDF Görüntüle"
                      />
                    </div>
                  </div>

                  {/* Checkboxes: is_new + is_public */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_new"
                        checked={form.is_new}
                        onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                      <label htmlFor="is_new" className="text-sm font-bold text-foreground/60 cursor-pointer">
                        Yeni içerik etiketi
                      </label>
                    </div>

                    {/* is_public toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-foreground/[0.02]">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={form.is_public}
                        onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                      <div>
                        <label htmlFor="is_public" className="text-sm font-bold text-foreground/70 cursor-pointer flex items-center gap-1">
                          {form.is_public ? <Unlock size={13} className="text-blue-500" /> : <Lock size={13} className="text-orange-500" />}
                          {form.is_public ? "Herkese Açık (Public)" : "Sadece Partnerlere Özel (Private)"}
                        </label>
                        <p className="text-[10px] text-foreground/40 mt-0.5">
                          {form.is_public
                            ? "Guestler anasayfada ve akademi listesinde görebilir"
                            : "Sadece giriş yapmış partnerler görebilir; anasayfada gösterilmez"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 rounded-2xl border border-border"
                      onClick={() => setShowForm(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-2xl"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editingId ? (
                        "Kaydet"
                      ) : (
                        "Oluştur"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
