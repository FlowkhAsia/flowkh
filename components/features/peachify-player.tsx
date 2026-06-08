'use client';

import { useMemo } from 'react';

type PeachifyPlayerProps = {
  type: 'movie' | 'tv';
  mediaId: string;
  season?: number;
  episode?: number;
  dub?: string;
  sub?: string;
  server?: string;
  startAt?: number;
  autoNext?: boolean | number;
  showNextBtn?: boolean;
  accent?: string;
  autoPlay?: boolean;
  hide?: Array<
    | 'pip'
    | 'cast'
    | 'fullscreen'
    | 'volume'
    | 'servers'
    | 'captions'
    | 'quality'
    | 'play'
    | 'rewind'
    | 'forward'
    | 'timegroup'
    | 'timeslider'
    | 'settings'
  >;
};

export function PeachifyPlayer({
  type,
  mediaId,
  season,
  episode,
  dub,
  sub,
  server,
  startAt,
  autoNext,
  showNextBtn = true,
  accent,
  autoPlay = true,
  hide = [],
}: PeachifyPlayerProps) {
  const src = useMemo(() => {
    const path =
      type === 'movie'
        ? `/embed/movie/${mediaId}`
        : `/embed/tv/${mediaId}/${season ?? 1}/${episode ?? 1}`;

    const params = new URLSearchParams();
    if (dub) params.set('dub', dub);
    if (sub) params.set('sub', sub);
    if (server) params.set('server', server);
    if (typeof startAt === 'number') params.set('startAt', String(startAt));
    if (type === 'tv' && autoNext) {
      params.set('autoNext', typeof autoNext === 'number' ? String(autoNext) : '');
    }
    if (type === 'tv' && showNextBtn === false) {
      params.set('showNextBtn', 'false');
    }
    if (accent) params.set('accent', accent.replace('#E50914', ''));
    if (!autoPlay) params.set('autoPlay', 'false');
    if (hide.length > 0) {
      hide.forEach((control) => params.append('hide', control));
    }

    const query = params.toString();
    return `https://peachify.pro${path}${query ? '?' + query : ''}`;
  }, [type, mediaId, season, episode, dub, sub, server, startAt, autoNext, showNextBtn, accent, autoPlay, hide]);

  return (
    <iframe
      id="peachify-player"
      src={src}
      className="w-full h-full border-0 absolute inset-0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}
