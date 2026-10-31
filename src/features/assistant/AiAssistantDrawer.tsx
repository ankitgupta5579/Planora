import React, { useRef, useEffect } from 'react';
import { EventPlan } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { Send, X, RefreshCw } from 'lucide-react';
import { useAiChat, CLIENT_CHAT_TIMEOUT_MS } from './useAiChat';
import { ChatMessageItem } from './ChatMessageItem';

export { CLIENT_CHAT_TIMEOUT_MS };

export interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

/**
 * Slide-over drawer presenting the AI planning consultant with context-aware recommendations.
 */
export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, plan }) => {
  const { messages, inputMessage, setInputMessage, isLoading, handleSendMessage } = useAiChat({
    plan,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

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
              <div id="ai-drawer-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Planning Consultant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-200">Contextual Advisor for {plan.title}</p>
            </div>
          </div>

          <button
            type="button"
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
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onSelectSuggestion={(sug) => handleSendMessage(sug)}
            />
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
