import { describe, it, expect } from 'vitest';
import { JourneyService } from '../server/services/journeyService.js';
import { LeadService } from '../server/services/leadService.js';
import type { LeadSubmission, Journey } from '../src/types/journey.js';

describe('Journey Schema & Data Integrity', () => {
  it('loads all journey files and passes schema validation', async () => {
    const journeys = await JourneyService.getAllJourneys();
    expect(journeys.length).toBeGreaterThan(0);

    for (const journey of journeys) {
      const validation = JourneyService.validateJourney(journey);
      expect(validation.valid, `Validation failed for journey "${journey.id}": ${validation.errors.join(', ')}`).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }
  });

  it('fails schema validation if required fields are missing', () => {
    const brokenJourney = {
      id: 'test-broken',
      title: 'Broken Journey',
      // missing status and steps
    };
    const validation = JourneyService.validateJourney(brokenJourney);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('verifies that every single option URL in all journeys is an absolute http:// or https:// URL', async () => {
    const journeys = await JourneyService.getAllJourneys();
    expect(journeys.length).toBeGreaterThan(0);

    for (const journey of journeys) {
      for (const step of journey.steps) {
        for (const option of step.options) {
          expect(
            JourneyService.isValidAbsoluteUrl(option.url),
            `Option "${option.label}" in step "${step.title}" of journey "${journey.id}" has invalid URL: ${option.url}`
          ).toBe(true);

          const parsed = new URL(option.url);
          expect(['http:', 'https:']).toContain(parsed.protocol);
        }
      }
    }
  });

  it('verifies start-a-company has null for unverified fields like costs, timelines, common mistakes in seed state', async () => {
    const journey = await JourneyService.getJourneyById('start-a-company');
    expect(journey).not.toBeNull();
    if (!journey) return;

    for (const step of journey.steps) {
      expect(step.documents_needed).toBeNull();
      expect(step.typical_cost).toBeNull();
      expect(step.typical_time).toBeNull();
      expect(step.common_mistakes).toBeNull();
    }
  });
});

describe('Lead Validation & Anti-Spam', () => {
  it('accepts valid lead submissions', () => {
    const validLead: LeadSubmission = {
      name: 'Kofi Mensah',
      phone: '+233241234567',
      email: 'kofi@example.com',
      message: 'Need help reserving my company name and drafting regulations.',
      journey_id: 'start-a-company',
      current_step_id: 'step-2-name-search',
      completed_steps: ['step-1-identity'],
    };

    const result = LeadService.validateLead(validLead);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects submissions with honeypot filled (spam bot protection)', () => {
    const spamLead: LeadSubmission = {
      name: 'Spam Bot',
      phone: '+233241234567',
      message: 'Click this link to buy things',
      journey_id: 'start-a-company',
      honeypot: 'http://malicious-link.test',
    };

    const result = LeadService.validateLead(spamLead);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Spam detected.');
  });

  it('rejects submissions with invalid phone numbers', () => {
    const invalidPhoneLead: LeadSubmission = {
      name: 'Ama Serwaa',
      phone: '1234', // too short
      message: 'Need consultation',
      journey_id: 'start-a-company',
    };

    const result = LeadService.validateLead(invalidPhoneLead);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid phone or WhatsApp');
  });

  it('rejects submissions with invalid email format when provided', () => {
    const invalidEmailLead: LeadSubmission = {
      name: 'Kwame Osei',
      phone: '0241234567',
      email: 'not-an-email',
      message: 'Need advice',
      journey_id: 'start-a-company',
    };

    const result = LeadService.validateLead(invalidEmailLead);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid email address');
  });

  it('accepts submissions with empty email since email is optional', () => {
    const noEmailLead: LeadSubmission = {
      name: 'Kwame Osei',
      phone: '0241234567',
      email: '',
      message: 'Need advice on tax registration',
      journey_id: 'start-a-company',
    };

    const result = LeadService.validateLead(noEmailLead);
    expect(result.valid).toBe(true);
  });
});
