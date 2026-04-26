"use client";

import React, { useEffect, useRef, useState } from "react";
import apiClient from "@/lib/api-client";

interface YouTubePlayerProps {
  videoUrl: string;
  contentId: string;
  initialPosition?: number;
  onStateChange?: (state: number) => void;
  onProgressUpdate?: (percentage: number) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const SYNC_INTERVAL_MS = 5000; // 5 seconds — short enough to capture progress in short videos

export default function YouTubePlayer({
  videoUrl,
  contentId,
  initialPosition = 0,
  onStateChange,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerId = `yt-player-${contentId}`;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Extract YouTube ID from URL — supports standard, shorts and youtu.be formats
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([0-9A-Za-z_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // Standard & embed: watch?v=, /v/, /embed/, youtu.be/
    const standardMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/|embed\/|u\/\w\/))([0-9A-Za-z_-]{11})/
    );
    if (standardMatch) return standardMatch[1];

    return null;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    // 1. Load the IFrame Player API code asynchronously.
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // 2. Define the global callback function
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    // If YT is already loaded (e.g., after navigation), init immediately
    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      if (!videoId) return;
      
      playerRef.current = new window.YT.Player(containerId, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          start: Math.floor(initialPosition),
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    function onPlayerReady(event: any) {
      setPlayerReady(true);
      // Ensure we start from initial position if provided
      if (initialPosition > 0) {
        event.target.seekTo(initialPosition, true);
      }
    }

    function onPlayerStateChange(event: any) {
      if (onStateChange) onStateChange(event.data);

      if (event.data === window.YT.PlayerState.PLAYING) {
        startPolling();
      } else if (event.data === window.YT.PlayerState.ENDED) {
        // Video ended — immediately sync 100% completion
        stopPolling();
        syncProgress(event.target, true);
      } else {
        stopPolling();
      }
    }

    return () => {
      stopPolling();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, contentId, initialPosition]);

  const syncProgress = async (player: any, forceComplete = false) => {
    if (!player || !player.getCurrentTime) return;
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration <= 0) return;

    const percentage = forceComplete ? 100 : (currentTime / duration) * 100;
    const position = forceComplete ? duration : currentTime;

    if (onProgressUpdate) onProgressUpdate(percentage);

    try {
      await apiClient.post("/progress/watch", {
        content_id: contentId,
        completion_percentage: percentage,
        last_position_seconds: position,
      });
    } catch (error) {
      console.error("Failed to sync watch progress:", error);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      syncProgress(playerRef.current);
    }, SYNC_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
        Geçersiz YouTube Linki
      </div>
    );
  }

  return (
    <div id={containerId} className="w-full h-full" />
  );
}
