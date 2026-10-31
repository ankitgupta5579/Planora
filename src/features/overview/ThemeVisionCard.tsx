import React from 'react';
import { EventPlan } from '../../types/event';
import { Sparkles, ArrowRight, Check, Copy } from 'lucide-react';

export interface ThemeVisionCardProps {
  plan: EventPlan;
  copiedHex: string | null;
  onCopyHex: (hex: string) => void;
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
}

/**
 * Creative theme overview card displaying vision description, color palette, and sample touches.
 */
export const ThemeVisionCard: React.FC<ThemeVisionCardProps> = ({
  plan,
  copiedHex,
  onCopyHex,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Creative Vision Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Creative Concept & Event Vision
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('ideas')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            Explore Ideas ({plan.ideas.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-800/40 p-4 rounded-xl border-l-2 border-indigo-500">
          &ldquo;{plan.themeDescription}&rdquo;
        </p>

        {/* Color Palette */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Curated Color Story
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {plan.colorPalette.map((color, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onCopyHex(color.hex)}
                title={`Click to copy ${color.hex}`}
                aria-label={`Copy color ${color.name} hex code ${color.hex}`}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-500 transition cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div
                  className="w-full h-10 rounded-lg shadow-inner mb-2 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-xs font-semibold text-slate-200 truncate">{color.name}</div>
                <div className="flex items-center justify-between text-xs text-slate-200 font-mono">
                  <span>{color.hex}</span>
                  {copiedHex === color.hex ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Idea Highlights */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Signature Touch Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plan.ideas.slice(0, 2).map((idea) => (
            <div
              key={idea.id}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5"
            >
              <div className="text-xs font-semibold text-indigo-200">{idea.title}</div>
              <p className="text-xs text-slate-300 line-clamp-2">{idea.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
