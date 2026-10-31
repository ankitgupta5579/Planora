import React from 'react';
import { EventPlan, TimelineItem } from '../../types/event';
import { useTimeline } from './useTimeline';
import { TimelineItemCard } from './TimelineItemCard';
import { TimelineModal } from './TimelineModal';
import { Plus } from 'lucide-react';

export interface TimelineTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenAiChat?: () => void;
}

const PHASES: { id: TimelineItem['phase']; label: string }[] = [
  { id: 'planning_early', label: 'Early Phase (Months Out)' },
  { id: 'planning_mid', label: 'Mid Planning (Weeks Out)' },
  { id: 'planning_final', label: 'Final Month' },
  { id: 'week_of', label: 'Week Of Event' },
  { id: 'day_of', label: 'Day-Of Run-of-Show' },
];

const FILTER_PHASES: { id: TimelineItem['phase'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Milestones' },
  { id: 'planning_early', label: 'Months Out' },
  { id: 'planning_mid', label: 'Weeks Out' },
  { id: 'planning_final', label: 'Final Month' },
  { id: 'week_of', label: 'Week Of' },
  { id: 'day_of', label: 'Day-Of' },
];

/**
 * Interactive timeline and day-of schedule orchestrator tab.
 */
export const TimelineTab: React.FC<TimelineTabProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const timelineState = useTimeline({ plan, onUpdatePlan });

  return (
    <div className="space-y-6">
      {/* Top Progress Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Milestone Progress</h3>
            <p className="text-xs text-slate-300">
              Track critical deadlines from early conception through the final day-of celebration.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-400">
              {timelineState.progress.completed}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {' '}
              / {timelineState.progress.total} completed ({timelineState.progress.percentage}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${timelineState.progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Phase Filter Tabs */}
        <div
          role="tablist"
          tabIndex={0}
          aria-label="Filter timeline milestones by phase"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
        >
          {FILTER_PHASES.map((tab) => {
            const count =
              tab.id === 'all'
                ? plan.timelineItems.length
                : plan.timelineItems.filter((t) => t.phase === tab.id).length;
            const isActive = !timelineState.isDayOfOnly && timelineState.selectedPhase === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  timelineState.setIsDayOfOnly(false);
                  timelineState.setSelectedPhase(tab.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => timelineState.setIsDayOfOnly(!timelineState.isDayOfOnly)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
              timelineState.isDayOfOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {timelineState.isDayOfOnly ? '✓ Day-Of View Active' : 'Filter Day-Of Run-of-Show'}
          </button>

          <button
            type="button"
            onClick={timelineState.openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Milestone List */}
      {timelineState.filteredItems.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <p className="text-sm text-slate-300 font-medium">No schedule items in this phase.</p>
          <button
            type="button"
            onClick={timelineState.openAddModal}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Add your first milestone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {timelineState.filteredItems.map((item) => (
            <TimelineItemCard
              key={item.id}
              item={item}
              onToggleComplete={timelineState.handleToggleComplete}
              onOpenEdit={timelineState.openEditModal}
              onDelete={timelineState.handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      <TimelineModal
        isOpen={timelineState.showAddModal}
        onClose={() => timelineState.setShowAddModal(false)}
        onSubmit={timelineState.handleSaveItem}
        isEdit={Boolean(timelineState.editItem)}
        phases={PHASES}
        formPhase={timelineState.formPhase}
        setFormPhase={timelineState.setFormPhase}
        formTimeLabel={timelineState.formTimeLabel}
        setFormTimeLabel={timelineState.setFormTimeLabel}
        formTitle={timelineState.formTitle}
        setFormTitle={timelineState.setFormTitle}
        formDescription={timelineState.formDescription}
        setFormDescription={timelineState.setFormDescription}
        formAssignedTo={timelineState.formAssignedTo}
        setFormAssignedTo={timelineState.setFormAssignedTo}
      />
    </div>
  );
};
