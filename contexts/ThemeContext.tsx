import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

const themeColors = {
  red: '#E50914',
  blue: '#0071eb',
  green: '#1db954',
  purple: '#9b59b6',
  cyan: '#00acc1',
  yellow: '#f5c518',
};

type Theme = keyof typeof themeColors;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const faviconTemplate = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 423.454 161.28">
  <g transform="translate(-857.983 -297.638)">
    <path d="M1217.168,458.918H1090.853a11.7,11.7,0,0,1-10.931-15.875l19.127-50.094a11.7,11.7,0,0,1,10.932-7.527H1236.3a11.7,11.7,0,0,1,10.931,15.875L1228.1,451.391A11.7,11.7,0,0,1,1217.168,458.918Z" fill="${color}"/>
    <path d="M858.81,452.87l60.256-149.184q2.688-6.048,8.288-6.048h35.392q6.048,0,3.36,6.048l-12.992,32.032L999.482,301a15.163,15.163,0,0,1,9.184-3.36H1051.9q8.509,0,.223,6.272L931.386,393.286a7.145,7.145,0,0,0-2.912,3.808L905.85,452.87q-2.688,6.048-8.288,6.048H862.17Q856.122,458.918,858.81,452.87Z" fill="#202020"/>
    <path d="M941.466,396.422l34.272-25.536a7.689,7.689,0,0,1,4.256-1.792q2.463,0,3.136,2.912l14.112,80.416q1.119,6.5-6.5,6.5h-41.44q-4.931,0-5.6-4.48l-7.168-49.5Q935.866,400.682,941.466,396.422Z" fill="${color}"/>
    <path d="M1065.561,303.686q2.688-6.048,8.288-6.048h35.392q6.048,0,3.36,6.048L1052.344,452.87q-2.688,6.048-8.288,6.048h-35.392q-6.048,0-3.36-6.048Z" fill="#202020"/>
    <g>
      <path d="M1120.378,350.794a4.568,4.568,0,0,1,4.384-3.015h36.715a3.875,3.875,0,0,0,3.836-2.6q.824-2.467-1.78-2.466h-21.92q-9.591,0-13.152-6.713t.136-16.029q4.8-12.054,11.851-17.194t19.386-5.137h41.237q3.012,0,1.78,3.013L1197.1,314.9a4.32,4.32,0,0,1-4.247,3.014h-35.62a3.3,3.3,0,0,0-3.425,2.192q-.959,2.191,1.645,2.192h21.92q9.725,0,13.151,6.986t-.41,16.3q-4.932,12.468-11.919,17.467t-19.317,5h-42.333q-3.015,0-1.918-3.014Z" fill="#202020"/>
      <path d="M1198.6,350.794a4.568,4.568,0,0,1,4.385-3.015H1239.7a3.877,3.877,0,0,0,3.836-2.6q.822-2.467-1.781-2.466h-21.92q-9.591,0-13.153-6.713t.138-16.029q4.793-12.054,11.851-17.194t19.384-5.137H1279.3q3.011,0,1.781,3.013l-5.754,14.249a4.321,4.321,0,0,1-4.247,3.014h-35.62a3.294,3.294,0,0,0-3.425,2.192q-.961,2.191,1.644,2.192H1255.6q9.728,0,13.153,6.986t-.411,16.3q-4.932,12.468-11.919,17.467t-19.318,5h-42.333q-3.013,0-1.918-3.014Z" fill="#202020"/>
    </g>
    <g>
      <path d="M1107.534,445.189l18.595-46.038a2.709,2.709,0,0,1,2.558-1.867h10.921q1.867,0,1.037,1.867l-4.008,9.884,14.308-10.714a4.684,4.684,0,0,1,2.835-1.037h13.341q2.626,0,.069,1.936L1129.931,426.8a2.205,2.205,0,0,0-.9,1.175l-6.982,17.213a2.709,2.709,0,0,1-2.558,1.866h-10.922Q1106.705,447.055,1107.534,445.189Zm25.508-17.42,10.576-7.88a2.372,2.372,0,0,1,1.314-.554c.506,0,.829.3.968.9l4.354,24.817q.345,2.006-2.005,2h-12.788a1.524,1.524,0,0,1-1.728-1.382l-2.212-15.277Q1131.312,429.083,1133.042,427.769Z" fill="#202020"/>
      <path d="M1152.742,445.189l18.6-46.038a2.709,2.709,0,0,1,2.558-1.867h10.922q1.866,0,1.037,1.867l-18.595,46.038a2.709,2.709,0,0,1-2.558,1.866h-10.922Q1151.913,447.055,1152.742,445.189Zm25.3-18.734,3.8-9.4a2.545,2.545,0,0,1,2.558-1.8h12.373a.981.981,0,0,0,.968-.691l6.221-15.415a2.709,2.709,0,0,1,2.558-1.867h10.853q1.934,0,1.106,1.867l-18.6,46.038a2.75,2.75,0,0,1-2.627,1.866h-10.853q-1.867,0-1.037-1.866l6.636-16.245q.274-.69-.414-.691h-12.443Q1177.35,428.253,1178.042,426.455Z" fill="#202020"/>
    </g>
  </g>
</svg>
`.trim().replace(/\n\s*/g, '');

const updateFavicon = (color: string) => {
  if (typeof window === 'undefined') return;
  const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!favicon) return;
  const svg = faviconTemplate(color);
  const encoded = window.btoa(svg);
  favicon.href = `data:image/svg+xml;base64,${encoded}`;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('flowkh-theme') as Theme) || 'cyan';
    }
    return 'cyan';
  });

  useEffect(() => {
    const currentTheme = localStorage.getItem('flowkh-theme') as Theme || 'cyan';
    updateFavicon(themeColors[currentTheme]);
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('flowkh-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      updateFavicon(themeColors[newTheme]);
      setThemeState(newTheme);
    } catch (e) {
      console.error("Failed to set theme in localStorage", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};