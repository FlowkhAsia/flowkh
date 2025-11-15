import React from 'react';

export const NetflixLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 115 35" {...props}>
    <defs>
      <path id="netflix-arc" d="M 5,27 Q 57.5,20 110,27" />
    </defs>
    <text style={{ fontFamily: "'Bebas Neue', sans-serif" }} fontSize="32" fill="#E50914" letterSpacing="-0.01em">
      <textPath href="#netflix-arc" startOffset="50%" textAnchor="middle">
        NETFLIX
      </textPath>
    </text>
  </svg>
);

export const PrimeVideoLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 180 40" {...props}>
        <text style={{ fontFamily: "Amazon Ember, sans-serif", fontWeight: 700 }} fontSize="28" fill="#FFFFFF" x="5" y="28">prime video</text>
        <path d="M 120 23 C 120 23, 138 23, 138 15" stroke="#00A8E1" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
);

export const DisneyPlusLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 180 40" {...props}>
        <text style={{ fontFamily: "sans-serif", fontWeight: 700 }} fontSize="28" fill="#FFFFFF" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">DisneyPlus</text>
    </svg>
);

export const HuluLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 40" {...props}>
        <text style={{ fontFamily: "sans-serif", fontWeight: "bold" }} fontSize="32" fill="#3DBB3D" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" letterSpacing="-0.05em">hulu</text>
    </svg>
);

export const MaxLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 40" {...props}>
        <text style={{ fontFamily: "sans-serif", fontWeight: "bold" }} fontSize="32" fill="#FFFFFF" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">max</text>
    </svg>
);

export const AppleTvPlusLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 120 40" {...props}>
        <path fill="#FFFFFF" d="M21.1,13.4c1.1-2.2,2.9-3.7,4.8-4.7c-2.2-1.3-4.8-1.5-7.3-0.9c-3.5,0.9-6.3,3-7.9,5.8 C9.1,16.2,8.4,19,8.7,21.8c0.1,0.9,0.3,1.8,0.6,2.6c0.8,2,2.1,3.7,3.6,5.1c2.1,1.9,4.7,2.8,7.5,2.7c0.6,0,3.3-0.3,5.1-2 c2-1.9,2.8-4.4,2.9-4.5c0,0-2.3-0.9-4.6-2.6c-2.4-1.8-3.1-4.4-3-6.8C20.8,16.1,20.4,14.6,21.1,13.4z M19.7,7.2 c1.7-1.8,4.3-2.9,6.9-2.6c0.3,2.3-0.6,4.6-2.2,6.3c-1.6,1.6-4.1,2.8-6.6,2.5C17.6,11.3,18.2,8.8,19.7,7.2z"/>
        <text style={{fontFamily: "sans-serif", fontWeight: 700}} fontSize="20" fill="#FFFFFF" x="45" y="27">tv+</text>
    </svg>
);