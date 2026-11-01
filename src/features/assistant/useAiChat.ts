import { useState, useRef, useEffect } from 'react';
import { EventPlan, AiChatMessage } from '../../types/event';
import { getFallbackMessage, FallbackReason } from '../../utils/fallbackMessages';
import { generateOfflineChatReply } from '../../utils/chatFallback';

export const CLIENT_CHAT_TIMEOUT_MS = 15000;

/**
 * Props for useAiChat hook.
 */
export interface UseAiChatProps {
  plan: EventPlan;
}

/**
 * Return contract for useAiChat hook.
 */
export interface UseAiChatReturn {
  messages: AiChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  handleSendMessage: (textToSend?: string) => Promise<void>;
}

/**
 * Custom hook managing conversational AI state, network calls, timeouts, and offline fallbacks.
 *
 * @param props - Event plan context
 * @returns Fully typed chat assistant state and actions
 */
export function useAiChat({ plan }: UseAiChatProps): UseAiChatReturn {
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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    handleSendMessage,
  };
}
