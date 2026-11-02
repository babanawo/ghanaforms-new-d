import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Coins,
  AlertTriangle,
  Building2,
  Info,
} from 'lucide-react';
import type { JourneyStep, OptionLink } from '../types/journey.js';

interface StepperProps {
  steps: JourneyStep[];
  completedStepIds: string[];
  onToggleStepComplete: (stepId: string) => void;
  onStuckOnStep: (step: JourneyStep) => void;
  isStepApplicable?: (step: JourneyStep) => boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  completedStepIds,
  onToggleStepComplete,
  onStuckOnStep,
  isStepApplicable = () => true,
}) => {
  // Keep step expanded by default, or allow collapsing
  const [collapsedStepIds, setCollapsedStepIds] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedStepIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6" role="list" aria-label="Journey steps">
      {steps.map((step, index) => {
        const isDone = completedStepIds.includes(step.id);
        const applicable = isStepApplicable(step);
        const isCollapsed = !!collapsedStepIds[step.id];
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            role="listitem"
            className={`relative flex gap-4 sm:gap-6 ${
              !applicable ? 'opacity-60 hover:opacity-100 transition-opacity' : ''
            }`}
          >
            {/* Stepper Timeline Left Pillar */}
            <div className="flex flex-col items-center">
              {/* Step indicator button */}
              <button
                type="button"
                onClick={() => onToggleStepComplete(step.id)}
                aria-label={`Mark step ${step.step_number}: ${step.title} as ${isDone ? 'incomplete' : 'done'}`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6837] ${
                  isDone
                    ? 'bg-[#0F6837] text-white shadow-md shadow-[#0F6837]/25'
                    : 'bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#0F6837]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <span>{step.step_number}</span>
                )}
              </button>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`w-0.5 grow my-2 transition-colors ${
                    isDone ? 'bg-[#0F6837]/50' : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Step Card Content */}
            <div
              className={`flex-1 rounded-2xl border transition-all mb-4 overflow-hidden ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-950/60 bg-white/70 dark:bg-stone-900/60'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F6837] dark:text-emerald-400 tracking-wide uppercase">
                        Step {step.step_number}
                      </span>

                      {step.optional && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                          Optional
                        </span>
                      )}

                      {!applicable && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                          Not applicable per quiz
                        </span>
                      )}

                      {step.expert_reviewed && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          Expert Reviewed
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  {/* Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(step.id)}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md transition-colors"
                    aria-label={isCollapsed ? 'Expand step details' : 'Collapse step details'}
                  >
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>

                {/* Why & When */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-600 dark:text-stone-300">
                  <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block mb-0.5">
                      Why this is required:
                    </span>
                    <p className="leading-relaxed">{step.why}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block mb-0.5">
                      Do this when:
                    </span>
                    <p className="leading-relaxed">{step.do_this_when}</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Body */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Options Section */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        {step.choose === 'one' ? 'Pick the one that applies to you' : 'Required steps & filings'}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        {step.options.length} {step.options.length === 1 ? 'option' : 'options'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {step.options.map((opt: OptionLink) => (
                        <div
                          key={opt.id}
                          className="group p-3 sm:p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#0F6837]/10 dark:bg-[#0F6837]/20 text-[#0F6837] dark:text-emerald-300 border border-[#0F6837]/25">
                                <Building2 className="w-3 h-3" />
                                {opt.agency}
                              </span>
                              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                {opt.label}
                              </span>
                            </div>

                            {opt.notes && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 pl-0.5">
                                {opt.notes}
                              </p>
                            )}

                            {/* Verification badge or check notice */}
                            <div className="pt-0.5 flex items-center gap-2">
                              {opt.verified_at ? (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                  ✓ Verified on official site
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                                  Official link · Verify details on official site
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Official URL Link Button */}
                          <a
                            href={opt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 shadow-2xs group-hover:border-[#0F6837]/50 transition-colors shrink-0"
                          >
                            <span>Open official page</span>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#0F6837]" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification & Details Section (Documents, Cost, Timeline, Mistakes) */}
                  <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {/* Cost */}
                      <div className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 mb-1">
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          <span>Typical Cost:</span>
                        </div>
                        {step.typical_cost ? (
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {step.typical_cost}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">
                            Details for this step are being verified by our team.
                          </span>
                        )}
                      </div>

                      {/* Time */}
                      <div className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 mb-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Typical Time:</span>
                        </div>
                        {step.typical_time ? (
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {step.typical_time}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">
                            Details for this step are being verified by our team.
                          </span>
                        )}
                      </div>

                      {/* Documents */}
                      <div className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 mb-1">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>Documents Required:</span>
                        </div>
                        {step.documents_needed && step.documents_needed.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-stone-800 dark:text-stone-200 font-medium">
                            {step.documents_needed.map((doc, dIdx) => (
                              <li key={dIdx}>{doc}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-stone-400 italic">
                            Details for this step are being verified by our team.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Common Mistakes */}
                    {step.common_mistakes && step.common_mistakes.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-xs text-red-900 dark:text-red-300">
                        <div className="flex items-center gap-1.5 font-semibold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Common Mistakes to Avoid:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {step.common_mistakes.map((mis, mIdx) => (
                            <li key={mIdx}>{mis}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions: Mark as Done & I'm stuck on this step */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleStepComplete(step.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed (Click to undo)</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-stone-400" />
                          <span>Mark as done</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onStuckOnStep(step)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F6837] dark:text-emerald-400 hover:bg-[#0F6837]/10 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>I'm stuck on this step</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
