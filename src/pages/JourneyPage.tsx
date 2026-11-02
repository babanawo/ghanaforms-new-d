import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  MessageSquareQuote,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { Journey, JourneyStep, QuizState } from '../types/journey.js';
import { Stepper } from '../components/Stepper.js';
import { QuizModal } from '../components/QuizModal.js';
import { AssistantChat } from '../components/AssistantChat.js';
import { useSafeStorage } from '../hooks/useStorage.js';

interface JourneyPageProps {
  journeyId: string;
  onNavigateBack: () => void;
  onOpenTalkToUs: (context?: { journeyTitle?: string; stepId?: string; stepTitle?: string; initialMessage?: string }) => void;
}

export const JourneyPage: React.FC<JourneyPageProps> = ({
  journeyId,
  onNavigateBack,
  onOpenTalkToUs,
}) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe storage for completed steps (wrapped in try/catch via useSafeStorage)
  const [completedSteps, setCompletedSteps] = useSafeStorage<string[]>(
    `ghana_guide_progress_${journeyId}`,
    []
  );

  // Quiz state for personalized roadmap
  const [quizState, setQuizState] = useSafeStorage<QuizState>(
    `ghana_guide_quiz_${journeyId}`,
    {
      entityType: 'ltd',
      hasForeignShareholders: false,
      willHireStaff: false,
    }
  );

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showOnlyApplicable, setShowOnlyApplicable] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/journeys/${journeyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.journey) {
          setJourney(data.journey);
        } else {
          setError(data.error || 'Failed to load journey');
        }
      })
      .catch((err) => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [journeyId]);

  if (loading) {
    return (
      <div className="py-12 space-y-6">
        <div className="h-8 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        <div className="h-32 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
        <div className="h-96 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 max-w-md mx-auto">
          {error || 'Journey not found.'}
        </div>
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Journeys</span>
        </button>
      </div>
    );
  }

  // Quiz applicability logic derived strictly from data tags
  const isStepApplicable = (step: JourneyStep): boolean => {
    // 1. Foreign shareholders
    if (step.condition_tag === 'foreign_shareholders' && !quizState.hasForeignShareholders) {
      return false;
    }
    // 2. Hiring staff
    if (step.condition_tag === 'hiring_staff' && !quizState.willHireStaff) {
      return false;
    }
    // 3. Sole proprietor vs company
    if (step.condition_tag === 'company_only' && quizState.entityType === 'sole_proprietor') {
      return false;
    }
    return true;
  };

  const stepsToDisplay = showOnlyApplicable
    ? journey.steps.filter((s) => isStepApplicable(s))
    : journey.steps;

  // Progress metrics
  const totalApplicableSteps = journey.steps.filter((s) => isStepApplicable(s)).length;
  const completedCount = journey.steps.filter((s) => completedSteps.includes(s.id) && isStepApplicable(s)).length;
  const progressPercent = totalApplicableSteps > 0 ? Math.round((completedCount / totalApplicableSteps) * 100) : 0;

  const handleToggleComplete = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleStuck = (step: JourneyStep) => {
    onOpenTalkToUs({
      journeyTitle: journey.title,
      stepId: step.id,
      stepTitle: `Step ${step.step_number}: ${step.title}`,
      initialMessage: `I need guidance on Step ${step.step_number}: ${step.title}.`,
    });
  };

  const isDraft = journey.status?.startsWith('DRAFT');

  return (
    <div className="space-y-8 pb-24 sm:pb-12 pt-4">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journeys</span>
        </button>

        <span className="text-xs text-stone-400">
          Last reviewed: <strong className="text-stone-600 dark:text-stone-300">{journey.last_reviewed || 'Not yet reviewed'}</strong>
        </span>
      </div>

      {/* Draft banner if status starts with DRAFT */}
      {isDraft && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-600/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">
              Draft: not yet expert-reviewed
            </span>
            <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-xs">
              This roadmap contains verified official agency links, but timelines, costs, and checklist details are being verified by Babanawo Consults specialists.
            </p>
          </div>
        </div>
      )}

      {/* Header & Overview */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {journey.title}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
          {journey.description}
        </p>

        {/* Persistent Independent Guide Disclaimer */}
        <p className="text-xs text-stone-500 dark:text-stone-400 pt-1">
          This is an independent guide, not an official government service. Always confirm requirements with the agency.
        </p>
      </div>

      {/* Progress & Quiz Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 space-y-4">
        {/* Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Your Progress:
            </span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {completedCount} of {totalApplicableSteps} steps done
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuizOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 hover:border-amber-600/50 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Personalize Roadmap</span>
            </button>

            {completedSteps.length > 0 && (
              <button
                type="button"
                onClick={() => setCompletedSteps([])}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1.5 rounded-md text-xs"
                title="Reset completed steps"
                aria-label="Reset completed steps"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Quiz Setup Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/50 dark:border-stone-800/80">
          <div>
            Roadmap customized for:{' '}
            <strong className="text-stone-700 dark:text-stone-200 capitalize">
              {quizState.entityType.replace('_', ' ')}
            </strong>
            {quizState.hasForeignShareholders ? ' • Foreign shareholding' : ' • Ghanaian owned'}
            {quizState.willHireStaff ? ' • Hiring staff' : ' • No initial staff'}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-300">
            <input
              type="checkbox"
              checked={showOnlyApplicable}
              onChange={(e) => setShowOnlyApplicable(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Hide non-applicable steps</span>
          </label>
        </div>
      </div>

      {/* Main Content: Stepper & Knowledge Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stepper */}
        <div className="lg:col-span-2 space-y-6">
          <Stepper
            steps={stepsToDisplay}
            completedStepIds={completedSteps}
            onToggleStepComplete={handleToggleComplete}
            onStuckOnStep={handleStuck}
            isStepApplicable={isStepApplicable}
          />
        </div>

        {/* Right Col: Assistant & Direct Consultant Trigger */}
        <div className="space-y-6">
          {/* Ask Assistant */}
          <AssistantChat
            journey={journey}
            onOpenTalkToUs={(customMsg) =>
              onOpenTalkToUs({
                journeyTitle: journey.title,
                initialMessage: customMsg || `I have a question about ${journey.title}.`,
              })
            }
          />

          {/* Babanawo Consults Card */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-sm">
              <MessageSquareQuote className="w-4 h-4" />
              <span>Need Direct Human Representation?</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              If an office is delayed or rejecting filings, Babanawo Consults handles official filings and expedited liaisons in Accra and regional centers.
            </p>
            <button
              onClick={() => onOpenTalkToUs({ journeyTitle: journey.title, initialMessage: `Help with ${journey.title}` })}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F6837] hover:bg-[#0c562e] active:bg-[#0a4625] text-white font-medium text-xs transition-colors shadow-2xs"
            >
              Talk to Babanawo Consults
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-20 sm:hidden bg-stone-900/95 dark:bg-black/95 text-white backdrop-blur-md px-4 py-3 border-t border-stone-800 flex items-center justify-between shadow-lg">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-stone-200">
            {completedCount} of {totalApplicableSteps} steps
          </div>
          <div className="text-[10px] text-stone-400">
            {progressPercent}% completed
          </div>
        </div>

        <button
          onClick={() => onOpenTalkToUs({ journeyTitle: journey.title })}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F6837] hover:bg-[#0c562e] text-white text-xs font-medium shadow-sm"
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Talk to us</span>
        </button>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        quizState={quizState}
        onUpdateQuiz={setQuizState}
      />
    </div>
  );
};
