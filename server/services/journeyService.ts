import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Journey, JourneyStep } from '../../src/types/journey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOURNEYS_DIR = path.resolve(__dirname, '../data/journeys');

export class JourneyService {
  /**
   * Validate that an option URL is an absolute http or https URL.
   */
  static isValidAbsoluteUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate the journey schema integrity.
   */
  static validateJourney(journey: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!journey || typeof journey !== 'object') {
      return { valid: false, errors: ['Journey must be a valid JSON object.'] };
    }

    const j = journey as Partial<Journey>;
    if (!j.id || typeof j.id !== 'string') errors.push('Journey requires an id string.');
    if (!j.title || typeof j.title !== 'string') errors.push('Journey requires a title string.');
    if (!j.status || typeof j.status !== 'string') errors.push('Journey requires a status string.');
    if (!Array.isArray(j.steps)) {
      errors.push('Journey requires steps array.');
      return { valid: errors.length === 0, errors };
    }

    j.steps.forEach((step: JourneyStep, idx: number) => {
      const stepPrefix = `Step ${idx + 1} (${step?.id || 'unknown'}):`;
      if (!step.id) errors.push(`${stepPrefix} missing id.`);
      if (!step.title) errors.push(`${stepPrefix} missing title.`);
      if (!step.why) errors.push(`${stepPrefix} missing why.`);
      if (!step.do_this_when) errors.push(`${stepPrefix} missing do_this_when.`);
      if (typeof step.optional !== 'boolean') errors.push(`${stepPrefix} optional must be boolean.`);
      if (step.choose !== 'one' && step.choose !== 'all') errors.push(`${stepPrefix} choose must be 'one' or 'all'.`);
      if (!Array.isArray(step.options) || step.options.length === 0) {
        errors.push(`${stepPrefix} must contain at least one option.`);
      } else {
        step.options.forEach((opt, optIdx) => {
          const optPrefix = `${stepPrefix} Option ${optIdx + 1} (${opt?.id || 'unknown'}):`;
          if (!opt.agency) errors.push(`${optPrefix} missing agency.`);
          if (!opt.label) errors.push(`${optPrefix} missing label.`);
          if (!opt.url || !this.isValidAbsoluteUrl(opt.url)) {
            errors.push(`${optPrefix} URL "${opt?.url}" is not a valid absolute http/https URL.`);
          }
        });
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Load all journeys dynamically from server/data/journeys/
   */
  static async getAllJourneys(): Promise<Journey[]> {
    try {
      const entries = await fs.readdir(JOURNEYS_DIR, { withFileTypes: true });
      const journeys: Journey[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.json')) {
          const filePath = path.join(JOURNEYS_DIR, entry.name);
          const raw = await fs.readFile(filePath, 'utf-8');
          const parsed = JSON.parse(raw) as Journey;
          journeys.push(parsed);
        }
      }

      return journeys;
    } catch (err) {
      console.error('Error reading journeys directory:', err);
      return [];
    }
  }

  /**
   * Get single journey by ID
   */
  static async getJourneyById(id: string): Promise<Journey | null> {
    const filePath = path.join(JOURNEYS_DIR, `${id}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as Journey;
    } catch {
      return null;
    }
  }

  /**
   * Save / update journey
   */
  static async saveJourney(id: string, updatedJourney: Journey): Promise<{ success: boolean; error?: string }> {
    const validation = this.validateJourney(updatedJourney);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    const filePath = path.join(JOURNEYS_DIR, `${id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(updatedJourney, null, 2), 'utf-8');
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
