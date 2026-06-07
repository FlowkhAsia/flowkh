"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";

interface EmbeddedVideoPlayerProps {
  videoKey?: string | null;
  fallbackImage: string;
  title: string;
}

export function EmbeddedVideoPlayer({
  videoKey,
  fallbackImage,
  title,
}: EmbeddedVideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const playerOpts = React.useMemo(() => ({
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      showinfo: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      disablekb: 1,
      iv_load_policy: 3,
      loop: 1,
      playlist: videoKey || undefined,
      enablejsapi: 1,
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  }), [videoKey]);

  useEffect(() => {
    if (videoKey && !player) {
      // Fallback timer just in case YouTube API takes too long
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [videoKey, player]);

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(100);
        // Many browsers pause video if unmuted via API. Explicitly tell it to play after unmuting.
        setTimeout(() => {
            player.playVideo();
        }, 100);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const onReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
    event.target.mute();
    event.target.playVideo();
  };

  const onStateChange = (event: YouTubeEvent) => {
    // PlayerState.PLAYING is 1
    if (event.data === 1) {
      setShowVideo(true);
    }
    // PlayerState.ENDED is 0
    if (event.data === 0 && player) {
      player.seekTo(0);
      player.playVideo();
    }
  };

  return (
    <>
      {/* Mute/Unmute Button */}
      {videoKey && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 md:top-10 md:right-12 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-white hover:bg-zinc-800/60 hover:scale-105 transition-all group group-hover:-translate-x-0.5"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
          ) : (
            <Volume2 className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
          )}
        </button>
      )}

      {/* Background Video */}
      {videoKey && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <YouTube
            videoId={videoKey}
            opts={playerOpts}
            onReady={onReady}
            onStateChange={onStateChange}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[1.4] md:scale-[1.25] opacity-80"
            style={{
              width: "100vw",
              height: "56.25vw",
              minHeight: "100vh",
              minWidth: "177.77vh",
            }}
          />
        </div>
      )}

      {/* Fallback Image Layer (Fades out when video is ready) */}
      <div
        className={`absolute inset-0 z-10 bg-black pointer-events-none transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-0" : "opacity-100"}`}
      >
        <Image
          src={fallbackImage}
          alt={title}
          fill
          priority
          className="object-cover object-center opacity-70 pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
    </>
  );
}
