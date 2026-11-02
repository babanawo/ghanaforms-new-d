import React, { useState } from 'react';
import { Bot, Send, MessageSquare, AlertCircle, Sparkles, MessageSquareQuote } from 'lucide-react';
import type { Journey } from '../types/journey.js';

interface AssistantChatProps {
  journey: Journey;
  onOpenTalkToUs: (customQuestion?: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  canAnswer?: boolean;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ journey, onOpenTalkToUs }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I can answer questions specifically regarding the steps, forms, and official agencies for "${journey.title}". If information isn't yet verified in our data, I'll direct you to our Babanawo Consults advisory team.`,
      canAnswer: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'What do I need for Step 1?',
    'Where do I reserve a business name?',
    'Do I need GIPC registration if I am Ghanaian?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journey_id: journey.id,
          question: q,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Could not retrieve answer. Please click "Talk to us" to speak with our consultants.',
            canAnswer: false,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            canAnswer: data.can_answer,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network connection error. Please use "Talk to us" for direct assistance.',
          canAnswer: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F6837]/10 text-[#0F6837] dark:text-emerald-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Ghana Forms Assistant
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Grounded exclusively in this journey's verified data
            </p>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-stone-50/40 dark:bg-stone-800/20 border-b border-stone-100 dark:border-stone-800/60 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 py-0.5">Ask:</span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(sq)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-600/50 hover:text-amber-700 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0F6837] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/50 dark:border-stone-700'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>

            {/* If assistant couldn't fully answer or recommends human advice */}
            {msg.role === 'assistant' && msg.canAnswer === false && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => onOpenTalkToUs(messages[i - 1]?.content)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#0F6837] dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-colors"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  <span>Talk to Babanawo Consults about this</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-stone-400 italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting verified journey data...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this journey's steps..."
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F6837]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3 py-2 rounded-lg bg-[#0F6837] hover:bg-[#0c562e] disabled:opacity-40 text-white transition-colors"
            aria-label="Send question"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Disclaimer under chat box */}
        <p className="mt-2 text-[10px] text-stone-400 dark:text-stone-500 text-center leading-normal">
          Answers are strictly grounded in our verified journey database. Questions with unverified data are logged for our advisory team.
        </p>
      </div>
    </div>
  );
};
