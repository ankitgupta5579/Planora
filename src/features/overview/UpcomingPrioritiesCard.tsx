import React from 'react';
import { TimelineItem } from '../../types/event';
import { Clock } from 'lucide-react';

export interface UpcomingPrioritiesCardProps {
  timelineItems: TimelineItem[];
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
}

/**
 * Priority sidebar widget highlighting the next 3 uncompleted milestones and schedule status.
 */
export const UpcomingPrioritiesCard: React.FC<UpcomingPrioritiesCardProps> = ({
  timelineItems,
  onNavigateTab,
}) => {
  const upcomingTasks = timelineItems.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Upcoming Milestones
        </h2>
        <button
          type="button"
          onClick={() => onNavigateTab('timeline')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          Full Schedule
        </button>
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="text-center py-6 text-slate-300 text-sm">
          🎉 All scheduled milestones are completed!
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{task.title}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-200 font-mono">
                  {task.timeLabel || task.phase}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
