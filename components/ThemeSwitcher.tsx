import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckIcon } from './icons/Icons';

const themes = [
  { name: 'red', color: '#E50914' },
  { name: 'blue', color: '#0071eb' },
  { name: 'green', color: '#1db954' },
  { name: 'purple', color: '#9b59b6' },
  { name: 'cyan', color: '#00acc1' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute top-14 right-0 bg-[#2d2d2d] border border-neutral-700 rounded-lg p-3 shadow-lg animate-fade-in-down">
      <div className="flex items-center space-x-3">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name as any)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: t.color }}
            title={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
            aria-label={`Switch to ${t.name} theme`}
          >
            {theme === t.name && <CheckIcon className="w-5 h-5 text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;