import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, CheckCircle2, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import type { LeadSubmission } from '../types/journey.js';

interface TalkToUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  journeyTitle?: string;
  currentStepId?: string;
  currentStepTitle?: string;
  completedSteps?: string[];
  initialMessage?: string;
}

export const TalkToUsModal: React.FC<TalkToUsModalProps> = ({
  isOpen,
  onClose,
  journeyId,
  journeyTitle,
  currentStepId,
  currentStepTitle,
  completedSteps = [],
  initialMessage = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  // Fetch public config (WhatsApp number)
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setSubmittedId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (phone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (message.trim().length < 3) {
      setErrorMessage('Please describe what you need help with.');
      return;
    }

    setSubmitting(true);

    const payload: LeadSubmission = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      message: message.trim(),
      journey_id: journeyId || 'start-a-company',
      current_step_id: currentStepId,
      completed_steps: completedSteps,
      honeypot: honeypot.trim() || undefined,
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to submit request. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmittedId(data.lead_id || 'lead_ok');
      setSubmitting(false);
    } catch {
      setErrorMessage('Network error while sending request. You can also chat with us directly via WhatsApp.');
      setSubmitting(false);
    }
  };

  // Generate WhatsApp pre-filled text
  const buildWhatsAppUrl = () => {
    if (!whatsappNumber) return '';
    const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
    let text = `Hello Babanawo Consults, I'm using Ghana Forms.\n\nJourney: ${journeyTitle || journeyId}`;
    if (currentStepTitle) {
      text += `\nCurrent Step: ${currentStepTitle}`;
    }
    if (message.trim()) {
      text += `\nMy question/request: ${message.trim()}`;
    }
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  const whatsAppUrl = buildWhatsAppUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="talk-to-us-title"
    >
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/60 dark:bg-stone-800/40">
          <div>
            <h2 id="talk-to-us-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Talk to a Consultant
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Direct guidance from Babanawo Consults
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {submittedId ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                  Request Received
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto">
                  Thank you, <strong className="text-stone-800 dark:text-stone-200">{name}</strong>. A Babanawo Consults specialist has received your case details and will contact you via WhatsApp/call shortly.
                </p>
              </div>

              {whatsappNumber && (
                <div className="pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat Now</span>
                  </a>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Return to Journey
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Context preview */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-amber-900 dark:text-amber-300">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Context Attached:</span>
                </div>
                <div className="pl-5 text-stone-600 dark:text-stone-400">
                  Journey: <strong className="text-stone-800 dark:text-stone-200">{journeyTitle || journeyId}</strong>
                  {currentStepTitle && (
                    <>
                      <br />
                      Current Step: <strong className="text-stone-800 dark:text-stone-200">{currentStepTitle}</strong>
                    </>
                  )}
                  {completedSteps.length > 0 && (
                    <>
                      <br />
                      Completed: <span>{completedSteps.length} step(s)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Honeypot for spam bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="hp_field">Leave this empty</label>
                <input
                  id="hp_field"
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 024 123 4567 or +233..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Email Address <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. kwame@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  What are you trying to do or stuck on? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your current status or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                />
              </div>

              {/* Consent line */}
              <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>We'll use your details only to contact you about this request.</span>
              </p>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F6837] hover:bg-[#0c562e] active:bg-[#0a4625] text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
                </button>

                {whatsappNumber && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
