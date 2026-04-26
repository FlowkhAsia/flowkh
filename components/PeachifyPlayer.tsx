'use client';

import { useEffect, useRef, useState } from 'react';

interface PeachifyPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: string;
  episode?: string;
  dub?: string;
  sub?: string;
  quality?: string | number;
  server?: string;
  api?: string;
  autoNext?: boolean | number;
  accent?: string;
  autoPlay?: boolean;
}

export default function PeachifyPlayer({
  tmdbId,
  type,
  season,
  episode,
  dub,
  sub,
  quality,
  server,
  api,
  autoNext,
  accent = 'E50914', // Default to a red accent similar to the site
  autoPlay = true,
}: PeachifyPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // On mount, check if we have tracked progress for this media
    let savedProgress = 0;
    try {
      const dataStr = localStorage.getItem('peachifyProgress');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        const media = data[tmdbId];
        
        if (media) {
          if (type === 'movie' && media.progress) {
            const watched = media.progress.watched;
            const duration = media.progress.duration;
            if (duration && watched < duration * 0.95) {
              savedProgress = watched;
            }
          } else if (type === 'tv' && media.show_progress) {
            const epKey = `s${season}e${episode}`;
            if (media.show_progress[epKey] && media.show_progress[epKey].progress) {
              const watched = media.show_progress[epKey].progress.watched;
              const duration = media.show_progress[epKey].progress.duration;
              if (duration && watched < duration * 0.95) {
                savedProgress = watched;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading peachifyProgress from localStorage', error);
    }
    
    setStartAt(savedProgress > 5 ? savedProgress : 0); // Don't bother resuming if less than 5 seconds in
  }, [tmdbId, type, season, episode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin to ensure it's from Peachify
      if (event.origin !== 'https://peachify.top') return;
      
      const payload = event.data;
      if (!payload) return;

      // Handle MEDIA_DATA: Sync progress object
      if (payload.type === 'MEDIA_DATA') {
        const peachifyProgress = payload.data;
        try {
          // You receive the full progress state, store it directly
          localStorage.setItem('peachifyProgress', JSON.stringify(peachifyProgress));
        } catch (err) {
          console.error('Error writing peachifyProgress to localStorage', err);
        }
      }

      // Handle PLAYER_EVENT
      if (payload.type === 'PLAYER_EVENT') {
        const { event: playerEvent, currentTime, duration } = payload.data;
        // Optionally emit specific events out to parent if needed
        // console.log(`Player ${playerEvent} at ${currentTime}s of ${duration}s`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Expose postMessage helper methods if needed via useImperativeHandle in the future
  const sendCommand = (command: string, value?: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ command, value }, '*');
    }
  };

  // Only render the iframe after initial progress is determined
  if (!isMounted || startAt === null) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-white">Loading player...</div>;
  }

  // Build iframe URL
  const baseUrl = 'https://peachify.top/embed';
  const urlPath = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}/${season}/${episode}`;
  
  const searchParams = new URLSearchParams();
  
  if (dub) searchParams.set('dub', dub);
  if (sub) searchParams.set('sub', sub);
  if (quality) searchParams.set('quality', String(quality));
  if (server) searchParams.set('server', server);
  if (api) searchParams.set('api', api);
  if (autoNext !== undefined) searchParams.set('autoNext', String(autoNext));
  if (accent) searchParams.set('accent', accent);
  if (!autoPlay) searchParams.set('autoPlay', 'false');
  if (startAt > 0) searchParams.set('startAt', String(startAt));

  const embedUrl = `${baseUrl}${urlPath}?${searchParams.toString()}`;

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title={`Peachify player for ${type === 'movie' ? 'movie' : 'TV show'}`}
      className="w-full h-full border-0"
      allowFullScreen
      allow="autoplay; fullscreen"
    />
  );
}
