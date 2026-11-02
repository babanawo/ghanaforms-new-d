import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import type { Journey } from '../../src/types/journey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UNANSWERED_FILE = path.resolve(__dirname, '../data/unanswered.json');

interface UnansweredLog {
  id: string;
  timestamp: string;
  journey_id: string;
  question: string;
  response_summary: string;
}

export class AssistantService {
  private static aiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI();
    }
    return this.aiClient;
  }

  static async logUnanswered(journeyId: string, question: string, summary: string): Promise<void> {
    try {
      let logs: UnansweredLog[] = [];
      try {
        const raw = await fs.readFile(UNANSWERED_FILE, 'utf-8');
        logs = JSON.parse(raw) as UnansweredLog[];
      } catch {
        logs = [];
      }

      logs.push({
        id: `unans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        journey_id: journeyId,
        question: question.trim(),
        response_summary: summary.slice(0, 300),
      });

      await fs.writeFile(UNANSWERED_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to log unanswered query:', err);
    }
  }

  static async askJourneyQuestion(journey: Journey, question: string): Promise<{ answer: string; canAnswer: boolean }> {
    const client = this.getClient();
    if (!client) {
      return {
        answer: 'The AI assistant is not currently active. Please click "Talk to us" to connect with a consultant at Babanawo Consults.',
        canAnswer: false,
      };
    }

    const systemInstruction = `You are the Ghana Forms AI Assistant for the journey: "${journey.title}".
Your job is to answer user questions ONLY using the verified journey facts provided in the JSON below.

CRITICAL RULES:
1. Answer ONLY with information explicitly present in this JSON data.
2. If any field (costs, timelines, document lists, common mistakes) is null, empty, or unverified in the JSON, DO NOT INVENT OR GUESS IT. Say plainly: "This detail has not yet been verified by our team. Please click 'Talk to us' to speak with Babanawo Consults."
3. NEVER state fees, timelines, legal requirements, or deadlines unless they are explicitly present in the data.
4. When describing steps, always cite the Step Number (e.g., "Step 1: Obtain Ghana Card").
5. Only provide links from the "url" values in the data. Do NOT mention or invent other URLs.
6. For anything outside this specific journey, say: "I can only answer questions about the steps in this journey. For custom advice, please click 'Talk to us'."
7. If you cannot provide a full answer from the data, explicitly include the phrase "TALK_TO_US_RECOMMENDED" on a separate line at the very end of your response.

JOURNEY DATA:
${JSON.stringify(journey, null, 2)}
`;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: question }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 600,
        },
      });

      const text = response.text || '';
      const requiresHuman = text.includes('TALK_TO_US_RECOMMENDED') ||
        text.toLowerCase().includes('not yet been verified') ||
        text.toLowerCase().includes('outside this specific journey');

      const cleanedText = text.replace('TALK_TO_US_RECOMMENDED', '').trim();

      if (requiresHuman) {
        await this.logUnanswered(journey.id, question, cleanedText);
      }

      return {
        answer: cleanedText,
        canAnswer: !requiresHuman,
      };
    } catch (err) {
      console.error('Gemini API call failed:', err);
      await this.logUnanswered(journey.id, question, 'Gemini API call error: ' + (err as Error).message);
      return {
        answer: 'We could not process this question right now. Please tap "Talk to us" to contact our advisory team directly.',
        canAnswer: false,
      };
    }
  }
}
