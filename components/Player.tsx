
import React, { useState } from 'react';
// FIX: Corrected import path for ChevronLeftIcon to be relative.
import { ChevronLeftIcon } from './icons/Icons';

interface PlayerProps {
  content: {
    id: number;
    isTv: boolean;
  };
  onClose: () => void;
}

const servers = [
  { name: 'VidSrc', url: 'https://vidsrc.cc/v3/embed' },
  { name: 'VidPlus', url: 'https://player.vidplus.to/embed' }
];

const Player: React.FC<PlayerProps> = ({ content, onClose }) => {
  const { id, isTv } = content;
  const [selectedServer, setSelectedServer] = useState(servers[0]);

  const playerSrc = isTv
    ? `${selectedServer.url}/tv/${id}`
    : `${selectedServer.url}/movie/${id}`;

  return (
    <div className="fixed inset-0 bg-black z-[200]">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <button
          onClick={onClose}
          className="flex items-center bg-black/50 text-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
          aria-label="Back"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-2 bg-black/50 rounded-full p-1">
          {servers.map((server) => (
            <button
              key={server.name}
              onClick={() => setSelectedServer(server)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                selectedServer.name === server.name
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>
      
      <iframe
        key={playerSrc} // Key is important to force re-render on src change
        src={playerSrc}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        title="Video Player"
      ></iframe>
    </div>
  );
};

export default Player;
