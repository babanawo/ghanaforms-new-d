import React from 'react';
import { Sparkles, Check, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import type { QuizState } from '../types/journey.js';

interface QuizModalProps {
  quizState: QuizState;
  onUpdateQuiz: (updated: QuizState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quizState,
  onUpdateQuiz,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateQuiz({
      entityType: 'ltd',
      hasForeignShareholders: false,
      willHireStaff: false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/60 dark:bg-stone-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="quiz-modal-title" className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Personalize Your Steps
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Answer 3 quick questions to filter non-applicable steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md"
            aria-label="Close quiz"
          >
            ✕
          </button>
        </div>

        {/* Questions Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Question 1: Entity Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              1. What type of entity are you establishing?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'ltd', label: 'Private Limited Company (Ltd)', desc: 'Standard commercial company with shares' },
                { id: 'sole_proprietor', label: 'Sole Proprietorship', desc: 'Individual business name registration' },
                { id: 'guarantee', label: 'Company Ltd by Guarantee', desc: 'NGO, church, or non-profit association' },
                { id: 'external', label: 'External Company', desc: 'Branch of an existing foreign company' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateQuiz({ ...quizState, entityType: opt.id as QuizState['entityType'] })}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    quizState.entityType === opt.id
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="font-medium text-stone-900 dark:text-stone-100 mb-1">{opt.label}</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Foreign Shareholders */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              2. Are any shareholders or partners foreign nationals?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuiz({ ...quizState, hasForeignShareholders: false })}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  !quizState.hasForeignShareholders
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                No (100% Ghanaian owned)
              </button>
              <button
                type="button"
                onClick={() => onUpdateQuiz({ ...quizState, hasForeignShareholders: true })}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  quizState.hasForeignShareholders
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                Yes (Foreign participation)
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Foreign shareholders require GIPC minimum capital and non-citizen identity cards.
            </p>
          </div>

          {/* Question 3: Employees */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              3. Will you hire employees at launch?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuiz({ ...quizState, willHireStaff: false })}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  !quizState.willHireStaff
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                No staff at start (Founders only)
              </button>
              <button
                type="button"
                onClick={() => onUpdateQuiz({ ...quizState, willHireStaff: true })}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  quizState.willHireStaff
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                Yes, hiring employees
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Hiring staff activates mandatory SSNIT Tier-1 employer registration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/60 dark:bg-stone-800/40">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset answers</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <span>Apply Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
