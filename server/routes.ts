import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JourneyService } from './services/journeyService.js';
import { LeadService } from './services/leadService.js';
import { AssistantService } from './services/assistantService.js';
import type { LeadSubmission, Journey } from '../src/types/journey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UNANSWERED_FILE = path.resolve(__dirname, './data/unanswered.json');

export const router = express.Router();

// Helper middleware for admin token check
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminSecret = process.env.ADMIN_TOKEN || 'ghana-guide-admin-secret';
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string | undefined;
  const queryToken = req.query.token as string | undefined;

  let providedToken: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7).trim();
  } else if (customHeader) {
    providedToken = customHeader.trim();
  } else if (queryToken) {
    providedToken = queryToken.trim();
  }

  if (!providedToken || providedToken !== adminSecret) {
    res.status(401).json({ ok: false, error: 'Unauthorized: Invalid admin token.' });
    return;
  }
  next();
}

// 1. Health check
router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// 2. Public config (WhatsApp number, Gemini presence)
router.get('/config', (_req, res) => {
  res.json({
    ok: true,
    whatsappNumber: process.env.WHATSAPP_NUMBER?.trim() || '',
    hasGemini: !!process.env.GEMINI_API_KEY,
  });
});

// 3. Journeys list
router.get('/journeys', async (_req, res) => {
  try {
    const journeys = await JourneyService.getAllJourneys();
    res.json({ ok: true, journeys });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// 4. Single Journey by ID
router.get('/journeys/:id', async (req, res) => {
  try {
    const journey = await JourneyService.getJourneyById(req.params.id);
    if (!journey) {
      res.status(404).json({ ok: false, error: 'Journey not found' });
      return;
    }
    res.json({ ok: true, journey });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// 5. Submit a lead request
router.post('/leads', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const submission: LeadSubmission = req.body;
    const result = await LeadService.saveLead(submission, clientIp);

    if (!result.success) {
      res.status(400).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, lead_id: result.leadId });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// 6. Admin: Get all leads
router.get('/admin/leads', requireAdmin, async (_req, res) => {
  try {
    const leads = await LeadService.getLeads();
    res.json({ ok: true, leads });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// 7. Admin: Get unanswered queries logged by AI assistant
router.get('/admin/unanswered', requireAdmin, async (_req, res) => {
  try {
    let logs = [];
    try {
      const raw = await fs.readFile(UNANSWERED_FILE, 'utf-8');
      logs = JSON.parse(raw);
    } catch {
      logs = [];
    }
    res.json({ ok: true, unanswered: logs });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// 8. Admin: Update journey
router.put('/admin/journeys/:id', requireAdmin, async (req, res) => {
  try {
    const journeyId = req.params.id;
    const updatedJourney = req.body as Journey;

    if (!updatedJourney || updatedJourney.id !== journeyId) {
      res.status(400).json({ ok: false, error: 'Journey payload ID mismatch' });
      return;
    }

    const result = await JourneyService.saveJourney(journeyId, updatedJourney);
    if (!result.success) {
      res.status(400).json({ ok: false, error: result.error });
      return;
    }

    res.json({ ok: true, journey: updatedJourney });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// 9. Ask Assistant (grounded in journey)
router.post('/assistant/ask', async (req, res) => {
  try {
    const { journey_id, question } = req.body;
    if (!journey_id || !question || typeof question !== 'string') {
      res.status(400).json({ ok: false, error: 'journey_id and question are required' });
      return;
    }

    const journey = await JourneyService.getJourneyById(journey_id);
    if (!journey) {
      res.status(404).json({ ok: false, error: 'Journey not found' });
      return;
    }

    const result = await AssistantService.askJourneyQuestion(journey, question);
    res.json({ ok: true, answer: result.answer, can_answer: result.canAnswer });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});
