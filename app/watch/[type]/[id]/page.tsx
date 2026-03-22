import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function WatchPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ type: string, id: string }>,
  searchParams: Promise<{ season?: string, episode?: string }>
}) {
  const { type, id } = await params;
  const { season, episode } = await searchParams;

  let embedUrl = '';
  if (type === 'movie') {
    embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
  } else if (type === 'tv') {
    const s = season || '1';
    const e = episode || '1';
    embedUrl = `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
  } else {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        Invalid media type
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col relative">
      <div className="absolute top-4 left-4 z-50">
        <Link href={`/title/${type}/${id}`} className="flex items-center gap-2 text-white hover:text-gray-300 transition bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </Link>
      </div>
      <iframe 
        src={embedUrl} 
        className="w-full h-full border-0" 
        allowFullScreen 
        allow="autoplay; fullscreen"
      ></iframe>
    </div>
  );
}
