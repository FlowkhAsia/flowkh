'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface Season {
  season_number: number;
  name: string;
}

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeason: string;
  appendEpisode?: boolean;
}

export default function SeasonSelector({ seasons, currentSeason, appendEpisode = true }: SeasonSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = e.target.value;
    if (appendEpisode) {
      router.push(`${pathname}?season=${newSeason}&episode=1`);
    } else {
      router.push(`${pathname}?season=${newSeason}`);
    }
  };

  // Filter out season 0 (Specials) if you want, or keep it.
  const validSeasons = seasons.filter(s => s.season_number > 0);

  if (validSeasons.length <= 1) {
    return <p className="text-sm text-gray-400">Season {currentSeason}</p>;
  }

  return (
    <div className="relative inline-block mt-1">
      <select
        value={currentSeason}
        onChange={handleSeasonChange}
        className="appearance-none bg-[#2a2a2a] text-white text-sm font-medium py-1.5 pl-3 pr-8 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
        aria-label="Select Season"
      >
        {validSeasons.map((season) => (
          <option key={season.season_number} value={season.season_number.toString()}>
            {season.name || `Season ${season.season_number}`}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
