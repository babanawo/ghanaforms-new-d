import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { LeadSubmission, StoredLead } from '../../src/types/journey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEADS_FILE = path.resolve(__dirname, '../data/leads.json');

// In-memory rate limiting map: ip -> timestamps[]
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

export class LeadService {
  /**
   * Simple sliding-window rate limiter
   */
  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = (rateLimits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      return true;
    }
    timestamps.push(now);
    rateLimits.set(ip, timestamps);
    return false;
  }

  /**
   * Validate lead submission
   */
  static validateLead(data: LeadSubmission): { valid: boolean; error?: string } {
    // 1. Honeypot check
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return { valid: false, error: 'Spam detected.' };
    }

    // 2. Name validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100) {
      return { valid: false, error: 'Please enter your full name (2–100 characters).' };
    }

    // 3. Phone / WhatsApp validation (Ghana phone numbers or international)
    if (!data.phone || typeof data.phone !== 'string') {
      return { valid: false, error: 'Phone or WhatsApp number is required.' };
    }
    const cleanPhone = data.phone.replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 25 || !/^\+?[0-9]{8,25}$/.test(cleanPhone)) {
      return { valid: false, error: 'Please enter a valid phone or WhatsApp number (at least 8 digits).' };
    }

    // 4. Email validation (optional)
    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim()) || data.email.length > 150) {
        return { valid: false, error: 'Please provide a valid email address, or leave it blank.' };
      }
    }

    // 5. Message validation
    if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 3 || data.message.trim().length > 1200) {
      return { valid: false, error: 'Please describe what you are trying to do (3–1,200 characters).' };
    }

    // 6. Journey ID validation
    if (!data.journey_id || typeof data.journey_id !== 'string') {
      return { valid: false, error: 'Journey reference is required.' };
    }

    return { valid: true };
  }

  /**
   * Read leads from disk
   */
  static async getLeads(): Promise<StoredLead[]> {
    try {
      const raw = await fs.readFile(LEADS_FILE, 'utf-8');
      const leads = JSON.parse(raw) as StoredLead[];
      return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (err) {
      console.error('Error reading leads file:', err);
      return [];
    }
  }

  /**
   * Save a new validated lead
   */
  static async saveLead(submission: LeadSubmission, clientIp: string): Promise<{ success: boolean; leadId?: string; error?: string }> {
    const validation = this.validateLead(submission);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (this.isRateLimited(clientIp)) {
      return { success: false, error: 'Too many requests. Please wait a few minutes before submitting again.' };
    }

    const ipHash = crypto.createHash('sha256').update(clientIp + 'salt-ghana-guide').digest('hex').slice(0, 12);

    const newLead: StoredLead = {
      id: `lead_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      created_at: new Date().toISOString(),
      name: submission.name.trim(),
      phone: submission.phone.trim(),
      email: submission.email?.trim() || undefined,
      message: submission.message.trim(),
      journey_id: submission.journey_id,
      current_step_id: submission.current_step_id || undefined,
      completed_steps: Array.isArray(submission.completed_steps) ? submission.completed_steps : [],
      ip_hash: ipHash,
    };

    try {
      const leads = await this.getLeads();
      leads.unshift(newLead);
      await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
      return { success: true, leadId: newLead.id };
    } catch (err) {
      console.error('Failed to write lead to leads.json:', err);
      return { success: false, error: 'Failed to record lead request. Please try again or WhatsApp us directly.' };
    }
  }
}
