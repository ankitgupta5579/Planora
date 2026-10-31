import React from 'react';
import { EventType } from '../../types/event';
import { Heart, Cake, Users, Briefcase, Check, ArrowRight } from 'lucide-react';

interface WizardStep1TypeProps {
  eventType: EventType;
  onSelectType: (type: EventType) => void;
  onNext: () => void;
}

const EVENT_TYPES: { type: EventType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    type: 'wedding',
    label: 'Wedding Celebration',
    desc: 'Ceremony, reception dinner, vows, florals, photography & toasts',
    icon: <Heart className="w-5 h-5 text-rose-400" />,
  },
  {
    type: 'birthday',
    label: 'Birthday Milestone',
    desc: 'Themed parties, milestone birthdays, dynamic music & activities',
    icon: <Cake className="w-5 h-5 text-amber-400" />,
  },
  {
    type: 'community',
    label: 'Community Event / Festival',
    desc: 'Town fairs, charity runs, local concerts, block parties & permits',
    icon: <Users className="w-5 h-5 text-emerald-400" />,
  },
  {
    type: 'corporate',
    label: 'Corporate & Milestone Gala',
    desc: 'Product launches, annual retreats, award galas & team summits',
    icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
  },
];

/**
 * Step 1: Select celebration vertical.
 */
export const WizardStep1Type: React.FC<WizardStep1TypeProps> = ({
  eventType,
  onSelectType,
  onNext,
}) => {
  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Celebration Type"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {EVENT_TYPES.map((et) => {
          const isSelected = eventType === et.type;
          return (
            <button
              type="button"
              key={et.type}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectType(et.type)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {et.icon}
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-white">{et.label}</div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{et.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Next: Logistics & Budget</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
