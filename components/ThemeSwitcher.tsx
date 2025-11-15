import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckIcon } from './icons/Icons';

const themes = [
  { name: 'cyan', color: '#00acc1' },
  { name: 'red', color: '#E50914' },
  { name: 'blue', color: '#0071eb' },
  { name: 'green', color: '#1db954' },
  { name: 'purple', color: '#9b59b6' },
  { name: 'yellow', color: '#f5c518' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute top-14 right-0 bg-[#222222] border border-neutral-700 rounded-xl p-4 shadow-lg w-48 animate-fade-in-down">
      <h4 className="text-sm font-semibold text-neutral-300 mb-3 px-1">Accent Color</h4>
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {themes.map((t) => {
          const isSelected = theme === t.name;
          return (
            <button
              key={t.name}
              onClick={() => setTheme(t.name as any)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: t.color,
                boxShadow: isSelected ? `0 0 0 2px #222222, 0 0 0 4px ${t.color}` : 'none',
              }}
              title={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
              aria-label={`Switch to ${t.name} theme`}
            >
              {isSelected && <CheckIcon className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;