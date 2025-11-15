import React from 'react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-8xl md:text-9xl font-bebas text-zinc-700 tracking-wider">404</h1>
        <h2 className="text-2xl md:text-4xl font-bold text-white mt-4">Page Not Found</h2>
        <p className="text-gray-400 mt-4 max-w-md">
            Oops! The page you're looking for seems to have been moved, deleted, or never existed. Let's get you back on track.
        </p>
        <button
            onClick={handleGoHome}
            className="mt-8 px-8 py-3 bg-[var(--brand-color)] text-white font-bold rounded-lg hover:bg-[var(--brand-color-dark)] transition-colors duration-300 text-lg shadow-lg"
        >
            Go to Homepage
        </button>
    </div>
  );
};

export default NotFoundPage;
