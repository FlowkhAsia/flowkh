import React, { useState } from 'react';
import { FacebookIcon, TwitterIcon, PlusIcon, MinusIcon, TelegramIcon } from './icons/Icons';

const FACEBOOK_URL = (import.meta as any).env.VITE_FACEBOOK_URL || 'https://facebook.com/';
const TWITTER_URL = (import.meta as any).env.VITE_TWITTER_URL || 'https://twitter.com/';
const TELEGRAM_URL = (import.meta as any).env.VITE_TELEGRAM_URL || 'https://t.me/flowkh';

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-6"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-')}`}
      >
        <h3 className="text-lg md:text-xl font-semibold text-white transition-colors">
          {question}
        </h3>
        {isOpen ? (
          <MinusIcon className="w-7 h-7 text-gray-400 flex-shrink-0" />
        ) : (
          <PlusIcon className="w-7 h-7 text-gray-400 flex-shrink-0" />
        )}
      </button>
      <div
        id={`faq-answer-${question.replace(/\s+/g, '-')}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <div className="space-y-3 text-gray-300 pb-6 pr-8">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-white text-center">Frequently Asked Questions</h1>
        
        <div className="border-t border-zinc-700/50">
            <FAQItem question="What is flowkh?">
                <p>flowkh is a modern, user-friendly interface designed to help you discover and browse movies and TV shows. It uses The Movie Database (TMDB) API to provide detailed information about a vast library of content.</p>
            </FAQItem>

            <FAQItem question="Is flowkh free to use?">
                <p>Yes, flowkh is completely free to use. It's a project created to demonstrate a modern web application and serve as a discovery tool for entertainment.</p>
            </FAQItem>
            
            <FAQItem question="Where does the content come from?">
                <p>All the metadata, including titles, posters, descriptions, and ratings, is sourced from The Movie Database (TMDB), a community-built movie and TV database.</p>
                <p>The video content itself is not hosted by us. We use embedded players that link to third-party, publicly available streaming services. We are simply an index for this content.</p>
            </FAQItem>

            <FAQItem question="Is flowkh legal?">
                <p>flowkh itself is legal as we do not host any of the video content. Our service functions as a search engine or index, providing links to content that is already available on the internet. However, the responsibility for ensuring that you have the right to view the content from the third-party providers lies with you, the user.</p>
            </FAQItem>

            <FAQItem question="Do I need an account to use flowkh?">
                <p>No, you do not need to create an account. You can browse and discover content freely. Features like "My List" are saved directly to your browser's local storage for convenience, without requiring any personal information.</p>
            </FAQItem>

            <FAQItem question="How do I add a movie/show to 'My List'?">
                <p>When you hover over a movie or TV show poster, you will see a bookmark icon. Clicking this icon will add the title to your "My List". You can view all your saved items by navigating to the "My List" page from the main menu.</p>
            </FAQItem>
        </div>
        
        <div className="text-center mt-16 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Find us on</h2>
            <div className="flex items-center justify-center space-x-6">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <FacebookIcon className="w-8 h-8"/>
                    <span className="font-semibold">Facebook</span>
                </a>
                <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <TwitterIcon className="w-7 h-7"/>
                    <span className="font-semibold">Twitter (X)</span>
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <TelegramIcon className="w-7 h-7"/>
                    <span className="font-semibold">Telegram</span>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;