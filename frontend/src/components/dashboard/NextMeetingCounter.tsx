"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  meeting_link?: string | null;
  category: string;
}

function getTimeLeft(targetDate: Date) {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    total: totalSeconds
  };
}

export function NextMeetingCounter() {
  const [nextEvent, setNextEvent] = useState<UpcomingEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(new Date()));
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        const res = await apiClient.get("/events?limit=1");
        if (res.data && res.data.length > 0) {
          setNextEvent(res.data[0]);
          setTimeLeft(getTimeLeft(new Date(res.data[0].start_time)));
          setIsFallback(false);
        } else {
          throw new Error("No events");
        }
      } catch (err) {
        // Fallback: Show a placeholder event for tomorrow
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 14);
        setNextEvent({
          id: "placeholder",
          title: "Gelecek Eğitim & Toplantı",
          start_time: tomorrow.toISOString(),
          category: "PLANLANIYOR",
          meeting_link: null
        });
        setTimeLeft(getTimeLeft(tomorrow));
        setIsFallback(true);
      }
    };

    fetchNextEvent();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;
    const target = new Date(nextEvent.start_time);
    const timer = setInterval(() => {
      const remaining = getTimeLeft(target);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  if (!nextEvent) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-12"
    >
      <div className="relative overflow-hidden glass rounded-[2.5rem] p-1 border-primary/20 shadow-2xl shadow-primary/5">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
        
        <div className="relative z-10 bg-white/40 dark:bg-black/40 rounded-[2.4rem] p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Event Info */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
              <Clock size={32} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 italic">
                {isFallback ? "MOMENTUM VISION" : "SIRADAKİ CANLI ETKİNLİK"}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">
                {nextEvent.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {nextEvent.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold italic">
                  {isFallback ? "Yeni eğitimler yakında burada!" : new Date(nextEvent.start_time).toLocaleString("tr-TR", { 
                    weekday: 'long', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Grid */}
          <div className="flex items-center gap-4 md:gap-8 bg-black/5 dark:bg-white/5 px-8 py-5 rounded-[2rem] border border-white/50 dark:border-black/50 shadow-sm">
            {timeLeft.days > 0 && (
              <>
                <TimeUnit value={timeLeft.days} label="GÜN" />
                <Divider />
              </>
            )}
            <TimeUnit value={timeLeft.hours} label="SAAT" />
            <Divider />
            <TimeUnit value={timeLeft.minutes} label="DAKİKA" />
            <Divider />
            <TimeUnit value={timeLeft.seconds} label="SANİYE" />
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-2">
            {nextEvent.meeting_link ? (
              <a href={nextEvent.meeting_link} target="_blank" rel="noopener noreferrer">
                <Button className="rounded-2xl h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black italic tracking-tight gap-3 shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
                  <Play size={20} fill="currentColor" />
                  YAYINA KATIL
                </Button>
              </a>
            ) : (
              <div className="text-center px-6">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 italic">
                  {isFallback ? "HAZIR OLUN" : "LİNK BEKLENİYOR"}
                </p>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-tight">
                  {isFallback ? "Yeni etkinlikler için takipte kalın." : "Yayın saati yaklaştığında link burada görünecektir."}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[45px]">
      <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-[1px] h-10 bg-gray-900/10 dark:bg-white/10" />;
}
