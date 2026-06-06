'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PeachifyPlayer } from '@/components/features/peachify-player';

interface MediaStateEngineProps {
  /** 
   * External data fetcher that runs when season changes.
   * Keeps TMDB API keys completely hidden on the server.
   */
  fetchSeasonData: (mediaId: string, season: string) => Promise<any>;
  dashboardLayout: React.ReactNode;
  renderEpisodeGrid: (seasonData: any, currentSeason: string) => React.ReactNode;
}

/**
 * Unified Media State Engine
 * Handles strict conditional rendering, parameter evaluation, and structural view toggling.
 */
export default function UnifiedMediaStateEngine({ 
  fetchSeasonData,
  dashboardLayout,
  renderEpisodeGrid 
}: MediaStateEngineProps) {
  // 1. Unified Address Bar Listening
  const params = useParams();
  const searchParams = useSearchParams();

  // Capture dynamic path token and parameters
  const mediaId = params?.slug?.[0] || params?.id || '';
  const isPlaying = searchParams.get('play') === 'true';
  const currentSeason = searchParams.get('season') || '1';

  // State array tracking for the active season map
  const [activeSeasonData, setActiveSeasonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Background Data Synchronization
  // Dynamically sync and update the array dataset whenever 'currentSeason' parameter changes
  useEffect(() => {
    let isMounted = true;
    
    async function syncSeasonData() {
      if (!mediaId) return;
      setIsLoading(true);
      try {
        const data = await fetchSeasonData(mediaId as string, currentSeason);
        if (isMounted) setActiveSeasonData(data);
      } catch (error) {
        console.error("Failed to sync season data", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    syncSeasonData();

    return () => {
      isMounted = false;
    };
  }, [mediaId, currentSeason, fetchSeasonData]);

  // 2. Structural View Toggling
  
  // Screen Layer A (The Video Frame)
  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-[100] w-full h-full overflow-hidden">
        <PeachifyPlayer
          type="tv"
          mediaId={mediaId as string}
          season={Number(currentSeason)}
          autoPlay={true}
        />
      </div>
    );
  }

  // Screen Layer B (The Main Dashboard View)
  return (
    <div className="relative w-full overflow-hidden w-full max-w-7xl mx-auto px-4 md:px-16 space-y-4">
      {/* Render the descriptive overview details text layout and elements */}
      {dashboardLayout}
      
      {/* Background Data Track Grid */}
      <div className="mt-8 transition-opacity duration-300" style={{ opacity: isLoading ? 0.5 : 1 }}>
        {renderEpisodeGrid(activeSeasonData, currentSeason)}
      </div>
    </div>
  );
}
