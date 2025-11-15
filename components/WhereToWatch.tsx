import React from 'react';
import { WatchProvider } from '../types';

interface WhereToWatchProps {
  providers: {
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  };
}

const ProviderSection: React.FC<{ title: string; providers: WatchProvider[] | undefined }> = ({ title, providers }) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  // IMPORTANT: This is a placeholder link. You should replace this with a
  // service like JustWatch and your affiliate ID, or construct direct affiliate
  // links for each service (e.g., Amazon, Apple TV).
  // Example: `https://www.justwatch.com/us/provider/${provider.provider_name.toLowerCase().replace(/\s/g, '-')}`
  const generateAffiliateLink = (provider: WatchProvider) => {
    // Replace with your actual affiliate link logic.
    return `https://www.justwatch.com/us?utm_source=kisskh&utm_medium=affiliate`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-300 mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {providers.map((provider) => (
          <a
            key={provider.provider_id}
            href={generateAffiliateLink(provider)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Watch on ${provider.provider_name}`}
            className="flex items-center p-3 bg-[#2a2a2a] rounded-lg group transition-all duration-200 hover:bg-[#383838] hover:scale-105"
          >
            <img
              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
              alt={`${provider.provider_name} logo`}
              className="w-10 h-10 rounded-md object-contain flex-shrink-0"
              loading="lazy"
              decoding="async"
            />
            <span className="ml-3 text-sm font-semibold text-white truncate group-hover:text-[var(--brand-color)]">
              {provider.provider_name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

const WhereToWatch: React.FC<WhereToWatchProps> = ({ providers }) => {
  const { flatrate, rent, buy } = providers;
  const hasProviders = (flatrate && flatrate.length > 0) || (rent && rent.length > 0) || (buy && buy.length > 0);

  if (!hasProviders) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1.5 h-7 bg-[var(--brand-color)] rounded-full" />
        <h2 className="text-2xl font-bold">Where to Watch</h2>
      </div>
      <div className="space-y-6">
        <ProviderSection title="Stream" providers={flatrate} />
        <ProviderSection title="Rent" providers={rent} />
        <ProviderSection title="Buy" providers={buy} />
      </div>
    </section>
  );
};

export default WhereToWatch;