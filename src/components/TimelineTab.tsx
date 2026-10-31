import React, { useState } from 'react';
import { EventPlan, TimelineItem } from '../types/event';
import { calculateTimelineProgress } from '../utils/eventCalculators';
import { useFocusTrap } from '../utils/useFocusTrap';
import { safeConfetti } from '../utils/motion';
import { CheckCircle2, Circle, Plus, Clock, User, Trash2, X } from 'lucide-react';

interface TimelineTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenAiChat: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  plan,
  onUpdatePlan,
  onOpenAiChat: _onOpenAiChat,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [isDayOfOnly, setIsDayOfOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);

  // Form states
  const [formPhase, setFormPhase] = useState<TimelineItem['phase']>('planning_mid');
  const [formTimeLabel, setFormTimeLabel] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');

  const modalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));
  const progress = calculateTimelineProgress(plan.timelineItems);

  const phases: { id: TimelineItem['phase']; label: string }[] = [
    { id: 'planning_early', label: 'Early Phase (Months Out)' },
    { id: 'planning_mid', label: 'Mid Planning (Weeks Out)' },
    { id: 'planning_final', label: 'Final Month' },
    { id: 'week_of', label: 'Week Of Event' },
    { id: 'day_of', label: 'Day-Of Run-of-Show' },
  ];

  const handleToggleComplete = (item: TimelineItem) => {
    const updated = plan.timelineItems.map((t) =>
      t.id === item.id ? { ...t, completed: !t.completed } : t
    );
    onUpdatePlan({ ...plan, timelineItems: updated, updatedAt: new Date().toISOString() });

    if (!item.completed) {
      safeConfetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.timelineItems.filter((t) => t.id !== id);
    onUpdatePlan({ ...plan, timelineItems: updated, updatedAt: new Date().toISOString() });
  };

  const openAddModal = (defaultPhase?: TimelineItem['phase']) => {
    setEditItem(null);
    setFormPhase(defaultPhase || 'planning_mid');
    setFormTimeLabel('');
    setFormTitle('');
    setFormDescription('');
    setFormAssignedTo('');
    setShowAddModal(true);
  };

  const openEditModal = (item: TimelineItem) => {
    setEditItem(item);
    setFormPhase(item.phase);
    setFormTimeLabel(item.timeLabel || '');
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormAssignedTo(item.assignedTo || '');
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editItem) {
      const updated = plan.timelineItems.map((t) =>
        t.id === editItem.id
          ? {
              ...t,
              phase: formPhase,
              timeLabel: formTimeLabel.trim(),
              title: formTitle.trim(),
              description: formDescription.trim(),
              assignedTo: formAssignedTo.trim(),
            }
          : t
      );
      onUpdatePlan({ ...plan, timelineItems: updated, updatedAt: new Date().toISOString() });
    } else {
      const newItem: TimelineItem = {
        id: 't-' + Date.now(),
        phase: formPhase,
        timeLabel: formTimeLabel.trim() || (formPhase === 'day_of' ? '12:00 PM' : 'Milestone'),
        title: formTitle.trim(),
        description: formDescription.trim(),
        assignedTo: formAssignedTo.trim(),
        completed: false,
      };
      onUpdatePlan({
        ...plan,
        timelineItems: [...plan.timelineItems, newItem],
        updatedAt: new Date().toISOString(),
      });
    }

    setShowAddModal(false);
  };

  const filteredItems = plan.timelineItems.filter((item) => {
    if (isDayOfOnly) return item.phase === 'day_of';
    if (selectedPhase === 'all') return true;
    return item.phase === selectedPhase;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Header */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Event Timeline & Milestones
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300">
              {progress.completed} of {progress.total} tasks completed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isDayOfOnly ? '⏱️ Day-Of Run-of-Show Minute Schedule' : 'Master Planning Roadmap'}
          </h2>
          <div className="w-full sm:w-80 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDayOfOnly(!isDayOfOnly)}
            aria-pressed={isDayOfOnly}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDayOfOnly
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isDayOfOnly ? 'Show Full Roadmap' : 'Day-Of Schedule Only'}</span>
          </button>

          <button
            onClick={() => openAddModal(isDayOfOnly ? 'day_of' : undefined)}
            aria-label="Add new milestone or schedule item"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Phase Filters (when not in Day-Of only mode) */}
      {!isDayOfOnly && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selectedPhase === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Phases ({plan.timelineItems.length})
          </button>
          {phases.map((p) => {
            const count = plan.timelineItems.filter((t) => t.phase === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPhase(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedPhase === p.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {p.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
            No items in this timeline phase yet.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                item.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600 shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(item)}
                aria-label={`Mark task as ${item.completed ? 'incomplete' : 'completed'}: ${item.title}`}
                className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-400 cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-indigo-200 border border-slate-700">
                      {item.timeLabel || item.phase}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.assignedTo && (
                      <span className="text-xs text-slate-200 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3 text-indigo-400" />
                        {item.assignedTo}
                      </span>
                    )}
                    <button
                      onClick={() => openEditModal(item)}
                      aria-label={`Edit milestone: ${item.title}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      aria-label={`Delete milestone: ${item.title}`}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p
                    className={`text-xs ${
                      item.completed ? 'text-slate-400' : 'text-slate-300'
                    } leading-relaxed`}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Milestone Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeline-modal-title"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
          >
            <div className="flex items-center justify-between">
              <h3 id="timeline-modal-title" className="text-lg font-bold text-white">
                {editItem ? 'Edit Milestone / Schedule' : 'Add New Milestone'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="milestone-title-input"
                  className="block text-slate-200 font-medium mb-1"
                >
                  Title *
                </label>
                <input
                  id="milestone-title-input"
                  type="text"
                  required
                  placeholder="e.g. Wedding Cake Delivery & Staging"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="milestone-phase-select"
                    className="block text-slate-200 font-medium mb-1"
                  >
                    Phase
                  </label>
                  <select
                    id="milestone-phase-select"
                    value={formPhase}
                    onChange={(e) => setFormPhase(e.target.value as TimelineItem['phase'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="milestone-time-input"
                    className="block text-slate-200 font-medium mb-1"
                  >
                    Time / Date Label
                  </label>
                  <input
                    id="milestone-time-input"
                    type="text"
                    placeholder="e.g. 02:00 PM or 3 Weeks Out"
                    value={formTimeLabel}
                    onChange={(e) => setFormTimeLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="milestone-assignee-input"
                  className="block text-slate-200 font-medium mb-1"
                >
                  Assigned Person / Role
                </label>
                <input
                  id="milestone-assignee-input"
                  type="text"
                  placeholder="e.g. Best Man, Event Producer, Sarah"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="milestone-details-textarea"
                  className="block text-slate-200 font-medium mb-1"
                >
                  Details & Instructions
                </label>
                <textarea
                  id="milestone-details-textarea"
                  rows={2}
                  placeholder="e.g. Confirm refrigeration space in the venue kitchen."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {editItem ? 'Save Milestone' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
