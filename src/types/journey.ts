export type SeedLinkStatus = 'deep' | 'homepage_only' | 'unverified' | 'not_found';

export interface OptionLink {
  id: string;
  agency: string;
  label: string;
  url: string;
  seed_link_status: SeedLinkStatus;
  verified_at: string | null;
  notes?: string | null;
}

export interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  why: string;
  do_this_when: string;
  optional: boolean;
  condition_tag?: string | null;
  choose: 'one' | 'all';
  options: OptionLink[];
  documents_needed: string[] | null;
  typical_cost: string | null;
  typical_time: string | null;
  common_mistakes: string[] | null;
  expert_reviewed: boolean;
}

export interface JourneyConsultant {
  name: string;
  specialty: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  status: string; // e.g. 'DRAFT_NOT_REVIEWED', 'REVIEWED'
  last_reviewed: string | null;
  consultant?: JourneyConsultant;
  steps: JourneyStep[];
}

export interface LeadSubmission {
  name: string;
  phone: string;
  email?: string;
  message: string;
  journey_id: string;
  current_step_id?: string;
  completed_steps?: string[];
  honeypot?: string;
}

export interface StoredLead extends LeadSubmission {
  id: string;
  created_at: string;
  ip_hash?: string;
}

export interface QuizState {
  entityType: 'ltd' | 'sole_proprietor' | 'guarantee' | 'external';
  hasForeignShareholders: boolean;
  willHireStaff: boolean;
}

export interface PublicConfig {
  whatsappNumber?: string;
  hasGemini: boolean;
}
