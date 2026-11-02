import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { LandingPage } from './pages/LandingPage.js';
import { JourneyPage } from './pages/JourneyPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { TalkToUsModal } from './components/TalkToUsModal.js';
import { safeLocalStorageGet, safeLocalStorageSet } from './hooks/useStorage.js';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeLocalStorageGet('ghana_guide_theme');
    if (saved !== null) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      safeLocalStorageSet('ghana_guide_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeLocalStorageSet('ghana_guide_theme', 'light');
    }
  }, [darkMode]);

  // Client-side router state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Listen to popstate for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Talk to us modal global state
  const [talkToUsOpen, setTalkToUsOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{
    journeyId: string;
    journeyTitle?: string;
    stepId?: string;
    stepTitle?: string;
    initialMessage?: string;
  }>({
    journeyId: 'start-a-company',
    journeyTitle: 'Start a Company in Ghana',
  });

  const openTalkToUsWithContext = (context?: {
    journeyId?: string;
    journeyTitle?: string;
    stepId?: string;
    stepTitle?: string;
    initialMessage?: string;
  }) => {
    setModalContext({
      journeyId: context?.journeyId || 'start-a-company',
      journeyTitle: context?.journeyTitle || 'Start a Company in Ghana',
      stepId: context?.stepId,
      stepTitle: context?.stepTitle,
      initialMessage: context?.initialMessage || '',
    });
    setTalkToUsOpen(true);
  };

  // Resolve current route
  const renderCurrentView = () => {
    if (currentPath === '/admin') {
      return <AdminPage onNavigateHome={() => navigateTo('/')} />;
    }

    if (currentPath.startsWith('/journey/')) {
      const journeyId = currentPath.replace('/journey/', '').split('?')[0];
      return (
        <JourneyPage
          journeyId={journeyId || 'start-a-company'}
          onNavigateBack={() => navigateTo('/')}
          onOpenTalkToUs={(ctx) =>
            openTalkToUsWithContext({
              journeyId,
              journeyTitle: ctx?.journeyTitle || journeyId.replace(/-/g, ' '),
              ...ctx,
            })
          }
        />
      );
    }

    // Default to Landing Page
    return (
      <LandingPage
        onSelectJourney={(id) => navigateTo(`/journey/${id}`)}
        onOpenTalkToUs={() => openTalkToUsWithContext()}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#121214] text-stone-900 dark:text-stone-100 transition-colors font-sans selection:bg-amber-500/20">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenTalkToUs={() => openTalkToUsWithContext()}
        onNavigateHome={() => navigateTo('/')}
        onNavigateAdmin={() => navigateTo('/admin')}
        currentRoute={currentPath}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6">
        {renderCurrentView()}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 py-8 px-4 text-xs text-stone-500 dark:text-stone-400 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[#0F6837] font-black">GHANA FORMS</span>
              <span className="text-stone-400 font-normal">• Official Services & Institutional Roadmaps</span>
            </p>
            <p className="text-[11px] max-w-lg">
              Independent advisory resource. Not an official government portal. In collaboration with{' '}
              <strong className="text-stone-800 dark:text-stone-200">Babanawo Consults</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => openTalkToUsWithContext()}
              className="text-[#0F6837] dark:text-emerald-400 font-semibold hover:underline"
            >
              Contact Consultant
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('/admin')}
              className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Global Talk to us Modal */}
      <TalkToUsModal
        isOpen={talkToUsOpen}
        onClose={() => setTalkToUsOpen(false)}
        journeyId={modalContext.journeyId}
        journeyTitle={modalContext.journeyTitle}
        currentStepId={modalContext.stepId}
        currentStepTitle={modalContext.stepTitle}
        initialMessage={modalContext.initialMessage}
      />
    </div>
  );
}
