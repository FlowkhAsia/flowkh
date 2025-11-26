import React from 'react';
import { Actor } from '../types';
import { UserCircleIcon } from './icons/Icons';

interface ActorCardProps {
  actor: Actor;
  onSelectActor: (actor: Actor) => void;
}

const ActorCard: React.FC<ActorCardProps> = ({ actor, onSelectActor }) => {
  return (
    <div
      onClick={() => onSelectActor(actor)}
      className="flex-shrink-0 w-32 md:w-36 group cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full bg-zinc-800 rounded-lg overflow-hidden transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105 shadow-lg">
        {actor.profilePath ? (
          <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircleIcon className="w-16 h-16 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-2 px-1 text-center">
        <p className="font-bold text-white text-sm truncate">{actor.name}</p>
        <p className="text-gray-400 text-xs truncate mt-0.5">{actor.character}</p>
      </div>
    </div>
  );
};

export default ActorCard;