import React from 'react';
import { TimelineItem } from '../../types/event';
import { CheckCircle2, Circle, Clock, User, Trash2 } from 'lucide-react';

export interface TimelineItemCardProps {
  item: TimelineItem;
  onToggleComplete: (item: TimelineItem) => void;
  onOpenEdit: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
}

const PHASE_BADGES: Record<TimelineItem['phase'], { label: string; badgeClass: string }> = {
  planning_early: { label: 'Months Out', badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  planning_mid: { label: 'Weeks Out', badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
  planning_final: { label: 'Final Month', badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  week_of: { label: 'Week Of', badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  day_of: { label: 'Day-Of', badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
};

/**
 * Accessible milestone card representing a planning action or day-of run-of-show entry.
 */
export const TimelineItemCard: React.FC<TimelineItemCardProps> = ({
  item,
  onToggleComplete,
  onOpenEdit,
  onDelete,
}) => {
  const phaseInfo = PHASE_BADGES[item.phase] || PHASE_BADGES.planning_mid;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
        item.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        {/* Toggle complete button */}
        <button
          type="button"
          role="checkbox"
          aria-checked={item.completed}
          aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
          onClick={() => onToggleComplete(item)}
          className="mt-0.5 text-slate-400 hover:text-white transition cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
        >
          {item.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-400 hover:text-slate-300" />
          )}
        </button>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${phaseInfo.badgeClass}`}
            >
              {phaseInfo.label}
            </span>

            {item.timeLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{item.timeLabel}</span>
              </span>
            )}

            {item.assignedTo && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md">
                <User className="w-3 h-3 text-purple-400" />
                <span>{item.assignedTo}</span>
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-bold ${
              item.completed ? 'line-through text-slate-300' : 'text-white'
            }`}
          >
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1">
        <button
          type="button"
          onClick={() => onOpenEdit(item)}
          className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete milestone: ${item.title}`}
          className="p-1 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
