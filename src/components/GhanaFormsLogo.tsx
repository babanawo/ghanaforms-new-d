import React from 'react';

interface GhanaFormsLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GhanaFormsLogo: React.FC<GhanaFormsLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const dimensions = {
    sm: { height: 28, width: iconOnly ? 24 : 120 },
    md: { height: 38, width: iconOnly ? 32 : 160 },
    lg: { height: 48, width: iconOnly ? 40 : 200 },
    xl: { height: 60, width: iconOnly ? 50 : 250 },
  };

  const { height } = dimensions[size];

  if (iconOnly) {
    return (
      <svg
        height={height}
        viewBox="0 0 140 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Ghana Forms Emblem"
      >
        <path d="M10 10 H85 C108 10 125 28 125 50 C125 64 118 76 106 85 C122 96 128 116 128 142 C114 135 96 134 78 134 H10 Z" fill="#0F6837"/>
        <path d="M30 30 H75 C94 30 105 38 105 50 C105 60 96 68 85 71 H30 Z" fill="#FFFFFF"/>
        <path d="M30 54 C54 54 94 51 126 78 C110 62 84 48 48 48 H30 Z" fill="#C8102E"/>
        <path d="M30 84 C56 84 96 84 126 111 C110 95 84 80 48 80 H30 Z" fill="#F5A800"/>
        <path d="M30 98 H75 C95 98 106 106 106 120 C88 118 62 118 30 118 Z" fill="#FFFFFF"/>
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 460 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Ghana Forms Logo"
      >
        {/* Emblem matching WhatsApp official logo */}
        <g id="logo-emblem">
          <path d="M10 10 H85 C108 10 125 28 125 50 C125 64 118 76 106 85 C122 96 128 116 128 142 C114 135 96 134 78 134 H10 Z" fill="#0F6837"/>
          <path d="M30 30 H75 C94 30 105 38 105 50 C105 60 96 68 85 71 H30 Z" fill="#FFFFFF"/>
          <path d="M30 54 C54 54 94 51 126 78 C110 62 84 48 48 48 H30 Z" fill="#C8102E"/>
          <path d="M30 84 C56 84 96 84 126 111 C110 95 84 80 48 80 H30 Z" fill="#F5A800"/>
          <path d="M30 98 H75 C95 98 106 106 106 120 C88 118 62 118 30 118 Z" fill="#FFFFFF"/>
        </g>
        {/* Text */}
        <g id="logo-text" transform="translate(145, 0)">
          <text x="0" y="70" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontSize="76" letterSpacing="-2" className="fill-stone-900 dark:fill-stone-100">GHANA</text>
          <text x="0" y="142" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontSize="76" letterSpacing="-2" className="fill-stone-900 dark:fill-stone-100">FORMS</text>
        </g>
      </svg>
    </div>
  );
};
