import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowRight,
  MessageSquareQuote,
  Layers,
  Search,
  Building2,
} from 'lucide-react';
import type { Journey } from '../types/journey.js';
import { GhanaFormsLogo } from '../components/GhanaFormsLogo.js';

interface LandingPageProps {
  onSelectJourney: (id: string) => void;
  onOpenTalkToUs: (context?: { journeyTitle?: string; initialMessage?: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectJourney, onOpenTalkToUs }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/journeys')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.journeys)) {
          setJourneys(data.journeys);
        }
      })
      .catch((err) => console.error('Failed to load journeys:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter journeys by search and category
  const filteredJourneys = useMemo(() => {
    return journeys.filter((journey) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        journey.title.toLowerCase().includes(q) ||
        journey.description.toLowerCase().includes(q) ||
        journey.steps.some((s) =>
          s.title.toLowerCase().includes(q) ||
          s.options.some((o) => o.agency.toLowerCase().includes(q) || o.label.toLowerCase().includes(q))
        );

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'identity' && (journey.id.includes('passport') || journey.id.includes('relocate') || journey.id.includes('national-identity'))) return true;
      if (selectedCategory === 'nss' && journey.id.includes('national-service')) return true;
      if (selectedCategory === 'higher-ed' && (journey.id.includes('tertiary') || journey.id.includes('law-school'))) return true;
      if (selectedCategory === 'colleges' && (journey.id.includes('nursing') || journey.id.includes('teacher'))) return true;
      if (selectedCategory === 'business' && (journey.id.includes('company') || journey.id.includes('premises') || journey.id.includes('enterprise'))) return true;
      if (selectedCategory === 'licensing' && (journey.id.includes('healthcare') || journey.id.includes('financial') || journey.id.includes('energy'))) return true;
      if (selectedCategory === 'property' && (journey.id.includes('land') || journey.id.includes('metropolitan'))) return true;
      if (selectedCategory === 'vehicle' && journey.id.includes('driver')) return true;

      return true;
    });
  }, [journeys, searchQuery, selectedCategory]);

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto space-y-4 px-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F6837]/10 border border-[#0F6837]/25 text-[#0F6837] dark:text-emerald-400 text-xs font-semibold">
          <GhanaFormsLogo iconOnly size="sm" />
          <span>Ghana Forms • Government Services Roadmap</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          Your Guide to Ghana’s Government Services
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Find the right forms, understand the requirements, and know what to do next.
        </p>

        {/* Secondary prompt for stuck users */}
        <div className="pt-2">
          <button
            onClick={() => onOpenTalkToUs({ initialMessage: 'I need guidance navigating a Ghanaian government agency.' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm font-medium border border-stone-200 dark:border-stone-700 transition-all shadow-2xs"
          >
            <MessageSquareQuote className="w-4 h-4 text-amber-600" />
            <span>Not sure where to start? Talk to us</span>
          </button>
        </div>
      </section>

      {/* Journeys List Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Institutional Navigation Roadmaps
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Pick a journey to follow the exact order of steps and official links
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or agencies..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Roadmaps' },
            { id: 'identity', label: 'Identity & Immigration' },
            { id: 'nss', label: 'National Service (NSA)' },
            { id: 'higher-ed', label: 'Universities & Higher Ed' },
            { id: 'colleges', label: 'Nursing & Teacher Colleges' },
            { id: 'business', label: 'Business Setup & Grants' },
            { id: 'licensing', label: 'Professional, Finance & Energy' },
            { id: 'property', label: 'Lands & Civic Permits' },
            { id: 'vehicle', label: 'Vehicles, DVLA & Ports' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#0F6837] text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 rounded-2xl bg-stone-100 dark:bg-stone-800/40 animate-pulse border border-stone-200 dark:border-stone-800" />
            <div className="h-44 rounded-2xl bg-stone-100 dark:bg-stone-800/40 animate-pulse border border-stone-200 dark:border-stone-800" />
          </div>
        ) : filteredJourneys.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-stone-500 text-sm">
            No journeys match your search. Try adjusting the filter or search keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJourneys.map((journey) => {
              const isDraft = journey.status?.startsWith('DRAFT');

              // Extract unique agency acronyms in this journey
              const agencies = Array.from(
                new Set(
                  journey.steps.flatMap((s) => s.options.map((o) => o.agency))
                )
              );

              return (
                <div
                  key={journey.id}
                  className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-amber-600/40 dark:hover:border-amber-600/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>{journey.steps?.length || 0} Ordered Steps</span>
                      </span>

                      {isDraft ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                          Draft Review
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {journey.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                      {journey.description}
                    </p>

                    {/* Agency badges */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] text-stone-400 mr-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Agencies:
                      </span>
                      {agencies.slice(0, 5).map((ag) => (
                        <span
                          key={ag}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700"
                        >
                          {ag}
                        </span>
                      ))}
                      {agencies.length > 5 && (
                        <span className="text-[10px] text-stone-400 font-medium">
                          +{agencies.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500">
                      Last reviewed: {journey.last_reviewed || 'Not yet reviewed'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectJourney(journey.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F6837] hover:bg-[#0c562e] active:bg-[#0a4625] text-white font-medium text-xs transition-colors shadow-xs"
                    >
                      <span>Start Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Advisory & Trust Section */}
      <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/30 p-6 sm:p-8 space-y-4">
        <div className="max-w-xl space-y-2">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Backed by Babanawo Consults
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Need someone on the ground at the Registrar of Companies (ORC), Ghana Revenue Authority (GRA), Lands Commission, DVLA, or Immigration Service? Our advisory team assists individuals, founders, and corporate entities directly.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => onOpenTalkToUs({ initialMessage: 'General consultation request for Ghanaian government institutions.' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F6837] hover:bg-[#0c562e] active:bg-[#0a4625] text-white text-xs font-medium transition-colors"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Consult a Specialist</span>
          </button>
        </div>

        {/* Mandatory Independent Disclaimer */}
        <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
          This is an independent guide, not an official government service. Always confirm requirements with the respective agencies.
        </p>
      </section>
    </div>
  );
};
