import React from 'react';
import { EventPlan } from '../../types/event';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Sparkles,
  FileText,
  Trash2,
} from 'lucide-react';

export interface OverviewHeroProps {
  plan: EventPlan;
  formattedDate: string;
  daysRemaining: number;
  onOpenSpeechModal: () => void;
  onOpenAiChat: () => void;
  onOpenDeleteEvent?: () => void;
  canDelete?: boolean;
}

/**
 * Hero banner presenting event metadata, countdown countdown badge, and quick action controls.
 */
export const OverviewHero: React.FC<OverviewHeroProps> = ({
  plan,
  formattedDate,
  daysRemaining,
  onOpenSpeechModal,
  onOpenAiChat,
  onOpenDeleteEvent,
  canDelete = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {plan.vibe.toUpperCase()} {plan.type.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {daysRemaining > 0
                  ? `${daysRemaining} Days to Go`
                  : daysRemaining === 0
                    ? 'Happening Today!'
                    : 'Celebrated!'}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {plan.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-pink-400" />
              <span>{plan.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{plan.guestCount} Guests Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>
                {plan.currency}
                {plan.totalBudget.toLocaleString()} Total Budget
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap lg:flex-col items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSpeechModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-pink-400" />
            <span>Generate Speech & Invites</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Planner</span>
          </button>

          {canDelete && onOpenDeleteEvent && (
            <button
              type="button"
              onClick={onOpenDeleteEvent}
              aria-label="Delete celebration plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer border border-transparent hover:border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
