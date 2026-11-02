import React from 'react';
import { Moon, Sun, MessageSquareQuote } from 'lucide-react';
import { GhanaFormsLogo } from './GhanaFormsLogo.js';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTalkToUs: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenTalkToUs,
  onNavigateHome,
  onNavigateAdmin,
  currentRoute,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#faf8f5]/90 dark:bg-[#111317]/90 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6837] rounded-lg group"
          aria-label="Ghana Forms Home"
        >
          <GhanaFormsLogo size="md" className="group-hover:scale-[1.02] transition-transform" />
          <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300/50 dark:border-stone-700 ml-1">
            Official Services Navigator
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentRoute !== '/admin' && (
            <button
              onClick={onNavigateAdmin}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Admin
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6837]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          <button
            onClick={onOpenTalkToUs}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[#0F6837] hover:bg-[#0c562e] active:bg-[#0a4625] text-white shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6837] focus-visible:ring-offset-2"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Talk to us</span>
          </button>
        </div>
      </div>
    </header>
  );
};
