"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (videoKey) {
      // Delay revealing the video to allow the YouTube iframe to initialize
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [videoKey]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (isMuted) {
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"unMute","args":[]}',
          "*",
        );
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"setVolume","args":[100]}',
          "*",
        );
        // Many browsers pause video if unmuted programmatically. Explicitly tell it to play after unmuting.
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":[]}',
          "*",
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"mute","args":[]}',
          "*",
        );
      }
      setIsMuted(!isMuted);
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
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] overflow-hidden pointer-events-none">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoKey}?enablejsapi=1&autoplay=1&mute=1&controls=0&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&playsinline=1&loop=1&playlist=${videoKey}`}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "100%",
                minWidth: "100%",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[1.3] md:scale-[1.25] opacity-80"
              allow="autoplay; encrypted-media"
              title="Trailer"
              tabIndex={-1}
            />
          </div>
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
