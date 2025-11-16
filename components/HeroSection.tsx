
import React from 'react';
import type { Movie } from '../types';

interface HeroSectionProps {
    movie: Movie;
    onPlayClick: () => void;
}

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ movie, onPlayClick }) => {
    return (
        <div className="relative h-[60vh] md:h-[85vh] w-full">
            <div className="absolute inset-0">
                <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/30 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">{movie.title}</h1>
                    <p className="mt-4 text-md md:text-lg text-gray-300 line-clamp-3 drop-shadow-md">
                        {movie.description}
                    </p>
                    <div className="mt-6 flex items-center space-x-4">
                        <button 
                            onClick={onPlayClick}
                            className="flex items-center justify-center bg-brand-purple hover:bg-brand-purple-light text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 hover:scale-105 shadow-lg">
                            <PlayIcon className="h-6 w-6 mr-2" />
                            <span>Play</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 hover:scale-105 backdrop-blur-sm">
                            More Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
