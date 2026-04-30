"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, CheckCircle, BookmarkPlus, BookmarkCheck, Lock, ChevronLeft, ChevronRight as ChevronRightIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import YouTubePlayer from "@/components/academy/YouTubePlayer";
import apiClient from "@/lib/api-client";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { useUserRole } from "@/context/UserRoleContext";

interface ContentDetail {
  id: string;
  title: string;
  description: string;
  video_url: string;
  resource_link: string | null;
  resource_link_label: string | null;
  is_locked: boolean;
  progress: {
    status: string;
    completion_percentage: number;
    last_position_seconds: number | null;
  } | null;
  next_id: string | null;
  prev_id: string | null;
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function ShortsPlayerPage({ params }: PageProps) {
  const { id } = React.use(params);
  const t = useTranslations("academy");
  const { role } = useUserRole();
  const isGuest = role === "GUEST";
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  // Task 6: Favorites state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    apiClient.get(`/academy/contents/${id}`)
      .then((res) => {
        setContent(res.data);
        setIsCompleted(res.data.progress?.status === "completed");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Task 6: Fetch user's favorites to check if this content is favorited
    if (!isGuest) {
      apiClient.get("/favorites")
        .then((res: { data: { content_id: string }[] }) => {
          const favoriteIds = res.data.map((f) => f.content_id);
          setIsFavorited(favoriteIds.includes(id));
        })
        .catch(() => {}); // silently fail — not critical
    }
  }, [id, isGuest]);

  // Task 6: Toggle favorite (add or remove)
  const handleToggleFavorite = async () => {
    if (isGuest || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await apiClient.delete(`/favorites/${id}`);
        setIsFavorited(false);
      } else {
        await apiClient.post("/favorites", { content_id: id });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) return <ShortsPlayerSkeleton />;
  if (!content) return <LockedContent t={t} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-xl mx-auto pt-24 px-4 pb-12">
        {/* Breadcrumb — Task 6: all segments are now clickable */}
        <nav className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-6">
          <Link href="/academy" className="hover:text-primary transition-colors">Akademi</Link>
          <ChevronRight size={10} />
          {/* Task 6 fix: "Shorts" is now a clickable link */}
          <Link href="/academy" className="hover:text-primary transition-colors">Shorts</Link>
          <ChevronRight size={10} />
          <span className="text-foreground line-clamp-1">{content.title}</span>
        </nav>

        {/* Task 4 & 5: Phone mock + side nav buttons wrapper */}
        {/* On ≥ sm screens, prev/next float on the sides of the mock.
            On xs screens, they collapse below the mock.               */}
        <div className="relative flex items-center justify-center">
          {/* Prev button — left side (hidden on xs, shown from sm) */}
          <Link
            href={content.prev_id ? `/academy/shorts/${content.prev_id}` : "#"}
            className={`hidden sm:flex absolute left-0 -translate-x-[110%] items-center justify-center
                        w-12 h-12 rounded-2xl border-2 transition-all
                        ${content.prev_id
                          ? "border-foreground/20 text-foreground/60 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/10"
                          : "border-foreground/5 text-foreground/20 pointer-events-none"}`}
            aria-label="Önceki video"
          >
            <ChevronLeft size={20} />
          </Link>

          {/* Video Player — Task 4: vertical={true} fixes 9:16 rendering */}
          <div
            className="relative mx-auto shadow-2xl rounded-[2.5rem] overflow-hidden border-8 border-foreground/10 bg-black"
            style={{ maxWidth: "340px", width: "100%", aspectRatio: "9/16" }}
          >
            {content.is_locked ? (
              <LockedVideoOverlay />
            ) : (
              <YouTubePlayer
                videoUrl={content.video_url}
                contentId={content.id}
                initialPosition={content.progress?.last_position_seconds ?? 0}
                vertical={true}
                onProgressUpdate={(percentage) => {
                  if (percentage >= 85) setIsCompleted(true);
                }}
              />
            )}
          </div>

          {/* Next button — right side (hidden on xs, shown from sm) */}
          <Link
            href={content.next_id ? `/academy/shorts/${content.next_id}` : "#"}
            className={`hidden sm:flex absolute right-0 translate-x-[110%] items-center justify-center
                        w-12 h-12 rounded-2xl border-2 transition-all
                        ${content.next_id
                          ? "border-primary/30 text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 bg-primary/5"
                          : "border-foreground/5 text-foreground/20 pointer-events-none"}`}
            aria-label="Sonraki video"
          >
            <ChevronRightIcon size={20} />
          </Link>
        </div>

        {/* Mobile fallback nav — only visible on xs (below sm) */}
        <div className="flex sm:hidden gap-4 mt-5">
          <Link href={content.prev_id ? `/academy/shorts/${content.prev_id}` : "#"} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-2xl gap-2 text-xs font-black"
              disabled={!content.prev_id}
            >
              <ChevronLeft size={14} /> Önceki
            </Button>
          </Link>
          <Link href={content.next_id ? `/academy/shorts/${content.next_id}` : "#"} className="flex-1">
            <Button
              className="w-full rounded-2xl gap-2 text-xs font-black shadow-lg shadow-primary/20"
              disabled={!content.next_id}
            >
              Sonraki <ChevronRightIcon size={14} />
            </Button>
          </Link>
        </div>

        {/* Information Section */}
        <div className="mt-8 text-center sm:text-left">
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">{content.title}</h1>
          {content.description && (
            <p className="text-foreground/60 text-sm mt-3 leading-relaxed border-l-2 border-primary/20 pl-4 italic">
              {content.description}
            </p>
          )}
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-3 mt-8">
          {/* Resource Link — hidden when locked */}
          {!content.is_locked && content.resource_link && (
            <a
              href={content.resource_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 px-6
                         border-2 border-primary text-primary rounded-2xl font-black text-xs uppercase tracking-widest
                         hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
            >
              <ExternalLink size={16} />
              {content.resource_link_label || t("view_resource")}
            </a>
          )}

          {/* Locked CTA */}
          {content.is_locked && (
            <Link href="/auth/register"
              className="flex items-center justify-center gap-3 w-full py-4 px-6
                         bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest
                         hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Lock size={16} />
              Partner Ol ve İzle
            </Link>
          )}

          {/* Completion Status — only for unlocked */}
          {!content.is_locked && (
            <div
              className={`flex items-center justify-center gap-3 w-full py-4 px-6
                         rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isCompleted
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-foreground/5 text-foreground/40 border border-foreground/10"
              }`}
            >
              <CheckCircle size={16} />
              {isCompleted ? t("completed") + " ✓" : t("watching")}
            </div>
          )}

          {/* Task 6: Favorite Button — only for authenticated (non-guest) users */}
          {!content.is_locked && !isGuest && (
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center justify-center gap-3 w-full py-4 px-6
                         rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed ${
                isFavorited
                  ? "border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                  : "border border-foreground/10 text-foreground/40 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {favoriteLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isFavorited ? (
                <BookmarkCheck size={16} />
              ) : (
                <BookmarkPlus size={16} />
              )}
              {isFavorited ? "Favorilerimde" : t("add_favorite")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function ShortsPlayerSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto pt-24 px-4 pb-12 animate-pulse">
        <div className="h-3 bg-foreground/10 rounded w-48 mb-6" />
        <div className="mx-auto bg-foreground/10 rounded-[2.5rem]" style={{ maxWidth: "340px", aspectRatio: "9/16" }} />
        <div className="mt-8 space-y-3 px-4">
          <div className="h-8 bg-foreground/10 rounded w-3/4" />
          <div className="h-4 bg-foreground/10 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

function LockedVideoOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm gap-4">
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <p className="text-white text-xs font-black uppercase tracking-widest text-center px-6">
        Partner üyelere özel
      </p>
    </div>
  );
}

function LockedContent({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md bg-surface p-12 rounded-[3rem] border border-foreground/10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-primary/20 shadow-lg shadow-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">{t("locked")}</h2>
          <p className="text-foreground/70 text-sm mb-8 leading-relaxed font-medium">
            {t("locked_hint")}
          </p>
          <Link href="/academy">
            <Button size="lg" className="rounded-2xl w-full px-12">
              {t("back_to_list")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
