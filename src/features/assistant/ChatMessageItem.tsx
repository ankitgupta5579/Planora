import React from 'react';
import { AiChatMessage } from '../../types/event';
import { User, Lightbulb } from 'lucide-react';

interface ChatMessageItemProps {
  message: AiChatMessage;
  onSelectSuggestion: (sug: string) => void;
}

function renderFormattedContent(text: string): React.ReactNode {
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

/**
 * Renders an individual chat bubble with avatars, formatted markdown-bold, and action suggestions.
 */
export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectSuggestion,
}) => {
  return (
    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div className="flex items-start gap-2 max-w-[88%]">
        {message.role === 'assistant' && (
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
            message.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
              : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-sm whitespace-pre-wrap'
          }`}
        >
          {renderFormattedContent(message.content)}
        </div>

        {message.role === 'user' && (
          <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      <span className="text-xs text-slate-300 mt-1 px-1">{message.timestamp}</span>

      {message.actionSuggestions && message.actionSuggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
          {message.actionSuggestions.map((sug, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onSelectSuggestion(sug)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/90 text-xs text-indigo-200 text-left transition cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
            >
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{sug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
