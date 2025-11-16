import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from './icons/Icons';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-10 right-8 z-50 p-3 rounded-full bg-[var(--brand-color)] text-white shadow-lg transition-all duration-300 hover:bg-[var(--brand-color-dark)] hover:scale-110 active:scale-100 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Go to top"
      title="Back to top"
    >
      <ArrowUpIcon className="h-6 w-6" />
    </button>
  );
};

export default BackToTopButton;