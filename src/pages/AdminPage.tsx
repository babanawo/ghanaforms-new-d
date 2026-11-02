import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Users,
  FileEdit,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import type { StoredLead, Journey, JourneyStep } from '../types/journey.js';

interface AdminPageProps {
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  // Check token in sessionStorage or URL query
  const [token, setToken] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTok = urlParams.get('token');
    if (queryTok) return queryTok;
    return sessionStorage.getItem('ghana_guide_admin_token') || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'leads' | 'editor' | 'unanswered'>('leads');
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authenticate & load data
  const verifyAndLoad = async (currentToken: string) => {
    if (!currentToken) return;
    setLoading(true);
    setAuthError(null);

    try {
      // Test admin token with /api/admin/leads
      const res = await fetch('/api/admin/leads', {
        headers: { 'x-admin-token': currentToken },
      });

      if (!res.ok) {
        setIsAuthenticated(false);
        setAuthError('Invalid Admin Token. Check ADMIN_TOKEN in .env');
        setLoading(false);
        return;
      }

      const leadsData = await res.json();
      setLeads(leadsData.leads || []);
      setIsAuthenticated(true);
      sessionStorage.setItem('ghana_guide_admin_token', currentToken);

      // Load unanswered queries
      fetch('/api/admin/unanswered', {
        headers: { 'x-admin-token': currentToken },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) setUnanswered(data.unanswered || []);
        })
        .catch(() => {});

      // Load journeys for editing
      fetch('/api/journeys')
        .then((r) => r.json())
        .then((data) => {
          if (data.ok && Array.isArray(data.journeys)) {
            setJourneys(data.journeys);
            if (data.journeys.length > 0) {
              setSelectedJourney(data.journeys[0]);
            }
          }
        })
        .catch(() => {});
    } catch {
      setAuthError('Connection error validating token.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyAndLoad(token);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToken(tokenInput.trim());
    verifyAndLoad(tokenInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ghana_guide_admin_token');
    setToken('');
    setIsAuthenticated(false);
  };

  // Step editor updates
  const handleUpdateStepField = (
    stepIndex: number,
    field: keyof JourneyStep,
    value: any
  ) => {
    if (!selectedJourney) return;
    const updatedSteps = [...selectedJourney.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      [field]: value,
    };
    setSelectedJourney({
      ...selectedJourney,
      steps: updatedSteps,
    });
  };

  // Save journey back to disk
  const handleSaveJourney = async () => {
    if (!selectedJourney) return;
    setSaveSuccess(null);
    setSaveError(null);

    // Calculate if all steps are reviewed
    const allStepsReviewed = selectedJourney.steps.every((s) => s.expert_reviewed);
    const updatedPayload: Journey = {
      ...selectedJourney,
      status: allStepsReviewed ? 'REVIEWED' : selectedJourney.status,
      last_reviewed: allStepsReviewed ? new Date().toISOString().split('T')[0] : selectedJourney.last_reviewed,
    };

    try {
      const res = await fetch(`/api/admin/journeys/${selectedJourney.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(updatedPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error || 'Failed to save journey changes.');
      } else {
        setSelectedJourney(data.journey);
        setSaveSuccess(`Journey "${selectedJourney.title}" saved successfully!`);
      }
    } catch {
      setSaveError('Network error while saving journey.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Admin Portal
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Access consultant leads & journey content editor
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Admin Secret Token
              </label>
              <input
                type="password"
                required
                placeholder="Enter ADMIN_TOKEN from .env"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-medium text-sm transition-colors shadow-2xs disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Unlock Admin Portal'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            >
              ← Return to public website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Admin & Expert Console
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
              Active
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Review client leads and curate verified journey content
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => verifyAndLoad(token)}
            className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            Log out
          </button>
          <button
            onClick={onNavigateHome}
            className="px-3 py-1.5 text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg hover:bg-stone-200 transition-colors"
          >
            View Site
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'leads'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Consultant Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'editor'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Journey Content Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('unanswered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'unanswered'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Unanswered Queries ({unanswered.length})</span>
        </button>
      </div>

      {/* Tab 1: Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-stone-500 text-sm">
              No leads submitted yet. When a user clicks "Talk to us" and submits the request, it will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-3">
                    <div>
                      <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
                        {lead.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          <strong className="text-stone-700 dark:text-stone-300">{lead.phone}</strong>
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            <span>{lead.email}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{new Date(lead.created_at).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Reply</span>
                      </a>
                    </div>
                  </div>

                  {/* Context attached */}
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-800 text-xs space-y-1">
                    <div>
                      <span className="text-stone-400">Journey:</span>{' '}
                      <strong className="text-stone-800 dark:text-stone-200">{lead.journey_id}</strong>
                      {lead.current_step_id && (
                        <>
                          {' '}• <span className="text-stone-400">Step:</span>{' '}
                          <strong className="text-stone-800 dark:text-stone-200">{lead.current_step_id}</strong>
                        </>
                      )}
                    </div>
                    {lead.completed_steps && lead.completed_steps.length > 0 && (
                      <div className="text-[11px] text-stone-500">
                        Completed: {lead.completed_steps.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                    {lead.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Journey Content Editor */}
      {activeTab === 'editor' && selectedJourney && (
        <div className="space-y-6">
          {/* Journey Overview Bar */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Editing Journey
                </span>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {selectedJourney.title}
                </h2>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Status:{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {selectedJourney.status}
                  </span>{' '}
                  • Last reviewed:{' '}
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {selectedJourney.last_reviewed || 'Not yet reviewed'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveJourney}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Changes</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          {/* Steps Editor Accordion */}
          <div className="space-y-4">
            {selectedJourney.steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      Step {step.step_number}
                    </span>
                    <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
                      {step.title}
                    </h3>
                  </div>

                  {/* Toggle reviewed */}
                  <label className="flex items-center gap-2 cursor-pointer bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <input
                      type="checkbox"
                      checked={step.expert_reviewed}
                      onChange={(e) =>
                        handleUpdateStepField(idx, 'expert_reviewed', e.target.checked)
                      }
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                      Mark as Expert-Reviewed
                    </span>
                  </label>
                </div>

                {/* Form fields for expert verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Typical Cost */}
                  <div className="space-y-1">
                    <label className="block font-medium text-stone-700 dark:text-stone-300">
                      Typical Cost (e.g. "GH₵ 60 filing fee", or leave blank if verifying)
                    </label>
                    <input
                      type="text"
                      value={step.typical_cost || ''}
                      placeholder="e.g. GH₵ 60 at official bank cashier"
                      onChange={(e) =>
                        handleUpdateStepField(
                          idx,
                          'typical_cost',
                          e.target.value.trim() ? e.target.value : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  {/* Typical Time */}
                  <div className="space-y-1">
                    <label className="block font-medium text-stone-700 dark:text-stone-300">
                      Typical Timeline (e.g. "2 to 4 working days")
                    </label>
                    <input
                      type="text"
                      value={step.typical_time || ''}
                      placeholder="e.g. 2 to 4 business days"
                      onChange={(e) =>
                        handleUpdateStepField(
                          idx,
                          'typical_time',
                          e.target.value.trim() ? e.target.value : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                {/* Documents needed (one per line) */}
                <div className="space-y-1 text-xs">
                  <label className="block font-medium text-stone-700 dark:text-stone-300">
                    Documents Needed (enter one document per line, or leave empty if unverified)
                  </label>
                  <textarea
                    rows={2}
                    value={step.documents_needed ? step.documents_needed.join('\n') : ''}
                    placeholder="e.g. Ghana Card for all directors&#10;Digital Address code (GPS)&#10;TIN of auditor"
                    onChange={(e) => {
                      const lines = e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean);
                      handleUpdateStepField(
                        idx,
                        'documents_needed',
                        lines.length > 0 ? lines : null
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-600 resize-none"
                  />
                </div>

                {/* Common mistakes */}
                <div className="space-y-1 text-xs">
                  <label className="block font-medium text-stone-700 dark:text-stone-300">
                    Common Mistakes to Avoid (enter one mistake per line)
                  </label>
                  <textarea
                    rows={2}
                    value={step.common_mistakes ? step.common_mistakes.join('\n') : ''}
                    placeholder="e.g. Using name with forbidden words without authorization&#10;Mismatched name on Ghana Card vs registration documents"
                    onChange={(e) => {
                      const lines = e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean);
                      handleUpdateStepField(
                        idx,
                        'common_mistakes',
                        lines.length > 0 ? lines : null
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-600 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Unanswered Queries Log */}
      {activeTab === 'unanswered' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-300">
            These questions were asked to the Journey AI Assistant but could not be answered with verified facts from the JSON database. Review them to identify what information needs to be added by the expert.
          </div>

          {unanswered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-stone-500 text-sm">
              No unanswered queries logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {unanswered.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Journey: {u.journey_id}</span>
                    <span>{new Date(u.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      User Question:
                    </span>{' '}
                    <span className="text-stone-900 dark:text-stone-100 font-medium">"{u.question}"</span>
                  </div>
                  <div className="text-stone-500 dark:text-stone-400">
                    <span className="font-medium">System Note:</span> {u.response_summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
