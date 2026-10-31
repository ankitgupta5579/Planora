import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, AiChatMessage } from '../types/event';
import { useFocusTrap } from '../utils/useFocusTrap';
import { getFallbackMessage, FallbackReason } from '../utils/fallbackMessages';
import { generateOfflineChatReply } from '../utils/chatFallback';
import { Send, User, X, Lightbulb, RefreshCw } from 'lucide-react';

function renderFormattedContent(text: string): React.ReactNode {
  // Safely renders **bold** segments without dangerouslySetInnerHTML or raw HTML injection
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

/**
 * Client-side abort timeout: 15s
 * Responsive limit ensuring users are never stalled waiting for replies.
 */
export const CLIENT_CHAT_TIMEOUT_MS = 15000;

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, plan }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your dedicated Planora AI assistant for ${plan.title}. 
I have real-time visibility into your budget (${plan.currency}${plan.totalBudget.toLocaleString()}), timeline (${plan.timelineItems.length} tasks), and ${plan.vendors.length} vendors. 
How can I assist your planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionSuggestions: [
        'How to cut 15% from catering without sacrificing quality?',
        'What should our bad weather contingency checklist be?',
        'Suggest 3 icebreaker games suitable for our guests',
        'Draft questions to ask before signing a venue contract',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const drawerRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, CLIENT_CHAT_TIMEOUT_MS);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text.trim(),
          eventContext: {
            title: plan.title,
            type: plan.type,
            vibe: plan.vibe,
            date: plan.date,
            location: plan.location,
            guestCount: plan.guestCount,
            totalBudget: plan.totalBudget,
            currency: plan.currency,
            totalAllocated: plan.budgetItems.reduce((acc, b) => acc + b.allocatedAmount, 0),
            totalSpent: plan.budgetItems.reduce((acc, b) => acc + b.actualAmount, 0),
          },
        }),
      });

      const data = await res.json();
      let fallbackNote = '';
      if (data.isFallback) {
        fallbackNote = getFallbackMessage(data.fallbackReason || 'error');
      }
      const prefix = fallbackNote ? `${fallbackNote}\n\n` : '';
      const assistantMsg: AiChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: `${prefix}${data.reply || 'Here is what I recommend for your celebration.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const isTimeout = controller.signal.aborted;
      const fallbackReason: FallbackReason = isTimeout ? 'timeout' : 'error';
      const note = getFallbackMessage(fallbackReason);
      const offline = generateOfflineChatReply(text.trim(), {
        title: plan.title,
        type: plan.type,
        guestCount: plan.guestCount,
        totalBudget: plan.totalBudget,
        currency: plan.currency,
        totalAllocated: plan.budgetItems.reduce((acc, b) => acc + b.allocatedAmount, 0),
        totalSpent: plan.budgetItems.reduce((acc, b) => acc + b.actualAmount, 0),
      });
      const errorMsg: AiChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `${note}\n\n${offline.reply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestions: offline.suggestions,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-drawer-title"
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-slate-900 border-l border-slate-700/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <img
              src="/planora-icon.svg"
              alt=""
              aria-hidden="true"
              width={36}
              height={36}
              className="w-9 h-9 shrink-0 rounded-xl"
            />
            <div>
              <div
                id="ai-drawer-title"
                className="text-sm font-bold text-white flex items-center gap-2"
              >
                <span>AI Planning Consultant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-200">Contextual Advisor for {plan.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close assistant drawer"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List with aria-live="polite" */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[88%]">
                {msg.role === 'assistant' && (
                  <img
                    src="/planora-icon.svg"
                    alt=""
                    aria-hidden="true"
                    width={28}
                    height={28}
                    className="w-7 h-7 shrink-0 rounded-lg mt-0.5"
                  />
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-sm whitespace-pre-wrap'
                  }`}
                >
                  {renderFormattedContent(msg.content)}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              <span className="text-xs text-slate-300 mt-1 px-1">{msg.timestamp}</span>

              {/* Suggestions */}
              {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                  {msg.actionSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/90 text-xs text-indigo-200 text-left transition cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              className="flex items-center gap-2 text-xs text-indigo-300 bg-slate-800/50 p-3 rounded-xl w-fit"
              role="status"
              aria-live="polite"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Analyzing event context and generating recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="ai-chat-input" className="sr-only">
              Ask AI Planner a question
            </label>
            <input
              id="ai-chat-input"
              type="text"
              maxLength={1000}
              placeholder="Ask anything about budgets, contracts, timelines..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message to AI planner"
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition cursor-pointer shadow-md shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
