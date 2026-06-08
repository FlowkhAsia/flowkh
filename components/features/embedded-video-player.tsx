"use client";

import React, { useState } from "react";
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const onReady = (event: YouTubeEvent) => {
    const ytPlayer = event.target;
    setPlayer(ytPlayer);
    ytPlayer.mute();
    ytPlayer.playVideo();

    // The 3-Second Opacity Mask to hide YouTube initial UI flashes
    setTimeout(() => {
      setIsVideoReady(true);
    }, 3000);
  };

  const onStateChange = (event: YouTubeEvent) => {
    // Permanent End-Screen Blocking
    // PlayerState.ENDED is 0
    if (event.data === 0) {
      event.target.seekTo(0);
      event.target.playVideo();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const playerOpts = {
    width: "100%",
    height: "100%",
    playerVars: {
      enablejsapi: 1,
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
    },
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
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[1.35] md:scale-[1.25] z-0">
            <YouTube
              videoId={videoKey}
              opts={playerOpts}
              onReady={onReady}
              onStateChange={onStateChange}
              className="absolute inset-0 w-full h-full pointer-events-none"
              iframeClassName={`w-full h-full pointer-events-none transition-opacity duration-1000 ${
                isVideoReady ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      )}

      {/* Fallback Image Layer (Fades out when video is ready) */}
      <div
        className={`absolute inset-0 z-10 bg-zinc-950 pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isVideoReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={fallbackImage}
          alt={title}
          fill
          priority
          className="object-cover object-top pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>
    </>
  );
}
