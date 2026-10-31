import React from 'react';
import { EventVibe } from '../../types/event';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface WizardStep3VibeProps {
  vibe: EventVibe;
  setVibe: (v: EventVibe) => void;
  specialRequests: string;
  setSpecialRequests: (s: string) => void;
  onBack: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  isGenerating: boolean;
}

const VIBES: { id: EventVibe; label: string; previewColor: string }[] = [
  { id: 'elegant', label: 'Elegant & Luxe', previewColor: '#D4AF37' },
  { id: 'rustic', label: 'Rustic & Natural', previewColor: '#879782' },
  { id: 'modern', label: 'Modern Minimalist', previewColor: '#06B6D4' },
  { id: 'bohemian', label: 'Bohemian & Free', previewColor: '#C86D51' },
  { id: 'festive', label: 'Vibrant & Festive', previewColor: '#FF6B6B' },
  { id: 'casual', label: 'Casual & Relaxed', previewColor: '#3B82F6' },
  { id: 'futuristic', label: 'Neon & Futuristic', previewColor: '#A855F7' },
  { id: 'vintage', label: 'Vintage Nostalgia', previewColor: '#C5A059' },
  { id: 'cozy', label: 'Warm & Cozy', previewColor: '#D97706' },
];

/**
 * Step 3 of Event Creation Wizard: Aesthetic vibe and special requests.
 */
export const WizardStep3Vibe: React.FC<WizardStep3VibeProps> = ({
  vibe,
  setVibe,
  specialRequests,
  setSpecialRequests,
  onBack,
  onSubmit,
  isGenerating,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      <div>
        <div id="vibe-group-label" className="block text-slate-200 font-semibold mb-2">
          Select Aesthetic / Atmosphere *
        </div>
        <div role="radiogroup" aria-labelledby="vibe-group-label" className="grid grid-cols-3 gap-2">
          {VIBES.map((v) => {
            const isSelected = vibe === v.id;
            return (
              <button
                type="button"
                key={v.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setVibe(v.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: v.previewColor }}
                />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="wizard-special-requests" className="block text-slate-200 font-semibold mb-1">
          Special Requests, Dietary Constraints or Specific Ideas
        </label>
        <textarea
          id="wizard-special-requests"
          rows={3}
          maxLength={500}
          placeholder="e.g. Vegetarian/Vegan dinner requirement, outdoor lawn ceremony, live acoustic band, sparkler sendoff, sustainable zero-waste favors..."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isGenerating}
          onClick={() => onSubmit()}
          aria-label="Generate AI Master Plan"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xl shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>Generate AI Master Plan</span>
        </button>
      </div>
    </form>
  );
};
