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

const SYNC_INTERVAL_MS = 15000; // 15 seconds

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

  // Extract YouTube ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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
      
      // Start/Stop progress polling based on playback state
      if (event.data === window.YT.PlayerState.PLAYING) {
        startPolling();
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

  const startPolling = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(async () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        if (duration > 0) {
          const percentage = (currentTime / duration) * 100;
          
          if (onProgressUpdate) onProgressUpdate(percentage);

          try {
            await apiClient.post("/progress/watch", {
              content_id: contentId,
              completion_percentage: percentage,
              last_position_seconds: currentTime,
            });
          } catch (error) {
            console.error("Failed to sync watch progress:", error);
          }
        }
      }
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
