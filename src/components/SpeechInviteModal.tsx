import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { useFocusTrap } from '../utils/useFocusTrap';
import { Sparkles, Copy, Check, Mic, Send } from 'lucide-react';

interface SpeechInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const SpeechInviteModal: React.FC<SpeechInviteModalProps> = ({ isOpen, onClose, plan }) => {
  const [activeType, setActiveType] = useState<'invitation' | 'speech'>('invitation');
  const [tone, setTone] = useState('heartfelt');
  const [recipient, setRecipient] = useState('Family and Cherished Friends');
  const [customDetails, setCustomDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputResult, setOutputResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsCopied(false);

    try {
      const res = await fetch('/api/ai/generate-invite-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: plan,
          requestType: activeType,
          tone,
          recipient,
          customDetails,
        }),
      });

      const data = await res.json();
      setOutputResult(data.result || 'Generated content ready.');
    } catch {
      setOutputResult(
        activeType === 'invitation'
          ? `✨ You're Cordially Invited! ✨\n\nPlease join us for ${plan.title} on ${plan.date} in ${plan.location}!\nWe would be honored by your presence. Please RSVP at your earliest convenience.`
          : `Dearest guests,\n\nWelcome to ${plan.title}. Standing together here in ${plan.location}, we are filled with immense joy and gratitude. Thank you each for traveling and sharing this extraordinary moment with us!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speech-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-5 my-8 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="speech-modal-title" className="text-lg font-bold text-white">
                AI Invites & Speeches Studio
              </h3>
              <p className="text-xs text-slate-300">Generate bespoke wording for {plan.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white text-sm cursor-pointer p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div
          role="tablist"
          aria-label="Content Mode"
          className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-800 text-xs font-semibold"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeType === 'invitation'}
            onClick={() => {
              setActiveType('invitation');
              setOutputResult('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              activeType === 'invitation'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Invitation Copy (WhatsApp / Email / Card)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeType === 'speech'}
            onClick={() => {
              setActiveType('speech');
              setOutputResult('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              activeType === 'speech'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speeches & Welcome Toasts</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label htmlFor="speech-tone-select" className="block text-slate-200 font-medium mb-1">
              Tone of Voice
            </label>
            <select
              id="speech-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="heartfelt">Warm & Heartfelt</option>
              <option value="elegant">Formal & Elegant</option>
              <option value="humorous">Fun, Lighthearted & Humorous</option>
              <option value="energetic">High-Energy & Celebratory</option>
              <option value="poetic">Poetic & Romantic</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="speech-recipient-input"
              className="block text-slate-200 font-medium mb-1"
            >
              {activeType === 'invitation' ? 'Recipient / Audience' : 'Speaker / Role'}
            </label>
            <input
              id="speech-recipient-input"
              type="text"
              maxLength={100}
              placeholder={
                activeType === 'invitation'
                  ? 'e.g. Friends & Family'
                  : 'e.g. Host, Maid of Honor, Best Man'
              }
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="speech-details-textarea"
            className="block text-slate-200 font-medium text-xs mb-1"
          >
            Personal Details & Inside Stories to Weave In
          </label>
          <textarea
            id="speech-details-textarea"
            rows={2}
            maxLength={500}
            placeholder={
              activeType === 'invitation'
                ? 'e.g. Dress code is cocktail coastal; mention RSVP link and dietary preference deadline.'
                : 'e.g. Mention how the couple first met in college, joke about Marcus getting lost on their first date, thank the parents.'
            }
            value={customDetails}
            onChange={(e) => setCustomDetails(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/20 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Sparkles className={`w-4 h-4 text-yellow-300 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>
            {isGenerating
              ? 'Crafting with Planora AI...'
              : `Generate ${activeType === 'invitation' ? 'Invitation' : 'Speech'}`}
          </span>
        </button>

        {/* Output Area */}
        {outputResult && (
          <div className="space-y-3 pt-2 border-t border-slate-800" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="speech-output-textarea" className="font-semibold text-slate-200">
                Generated Wording:
              </label>
              <button
                onClick={copyToClipboard}
                aria-label="Copy generated text to clipboard"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer transition shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="speech-output-textarea"
              rows={8}
              value={outputResult}
              onChange={(e) => setOutputResult(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
