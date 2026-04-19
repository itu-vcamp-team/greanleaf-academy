"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, Clock, Link as LinkIcon, Plus, Trash2, 
  ChevronLeft, ChevronRight, Video, Shield 
} from "lucide-react";

import { Navbar } from "@/components/ui/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useUserRole } from "@/context/UserRoleContext";
import apiClient from "@/lib/api-client";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  speaker: string;
  link?: string;
  description: string;
  event_date?: string; // ISO format from backend
}

export default function CalendarPage() {
  const { role } = useUserRole();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    apiClient.get("/events/calendar")
      .then(res => setEvents(res.data))
      .catch(err => console.error("Failed to fetch events:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      await apiClient.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Delete event failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-primary mb-4">
              <CalendarIcon className="w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-[0.3em]">Haftalık Yayın Akışı</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">
              Akademi <span className="text-primary italic">Canlı Takvim</span>
            </h1>
          </div>
          
          {(role === "ADMIN" || role === "SUPERADMIN") && (
            <Button onClick={() => setIsAdding(true)} className="gap-2 rounded-2xl px-8 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" /> Yeni Etkinlik Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mini Calendar Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 border-foreground/5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg">
                  {new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map(d => (
                  <span key={d} className="text-[10px] font-black text-foreground/20 uppercase">{d}</span>
                ))}
              </div>
              <MiniCalendarDays events={events} />
            </GlassCard>

            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Önemli Not</h4>
              <p className="text-xs text-foreground/60 leading-relaxed italic">
                Tüm yayınlar kayıt altına alınmakta ve 24 saat sonra Akademi - Masterclass bölümüne yüklenmektedir.
              </p>
            </div>
          </div>

          {/* Event List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-36 bg-gray-100/60 rounded-3xl animate-pulse border border-gray-100" />
              ))
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium text-sm">Yaklaşan etkinlik bulunmuyor.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    role={role}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <AddEventModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onCreated={(newEvent) => setEvents(prev => [newEvent, ...prev])}
      />
    </div>
  );
}

// --- Sub Components ---

function MiniCalendarDays({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Mon-first: 0=Mon,...,6=Sun
  const offset = (firstDay + 6) % 7;

  // Get event days set
  const eventDays = new Set(
    events
      .map(e => e.event_date ? new Date(e.event_date).getDate() : null)
      .filter(Boolean)
  );

  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const isToday = day === today.getDate();
        const hasEvent = eventDays.has(day);
        return (
          <div
            key={day}
            className={`aspect-square flex items-center justify-center text-xs rounded-lg relative transition-colors cursor-pointer
              ${isToday ? "bg-primary text-white font-bold shadow-lg shadow-primary/30" : "hover:bg-primary/5 text-foreground/40"}
            `}
          >
                  description: "Eğitim detayları...",
                }, ...prev]);
                setIsAdding(false);
              }}>Kaydet</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
