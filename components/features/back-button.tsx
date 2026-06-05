'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

export function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleBack = () => {
    const isPlay = searchParams.get('play') === 'true';
    if (isPlay) {
      router.replace(pathname);
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="absolute top-6 left-6 md:top-10 md:left-12 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-white hover:bg-zinc-800/60 hover:scale-105 transition-all group"
    >
      <Icons.chevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
}

