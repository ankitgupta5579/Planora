import React from 'react';
import { TimelineItem } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { X } from 'lucide-react';

export interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  phases: { id: TimelineItem['phase']; label: string }[];
  formPhase: TimelineItem['phase'];
  setFormPhase: (val: TimelineItem['phase']) => void;
  formTimeLabel: string;
  setFormTimeLabel: (val: string) => void;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formAssignedTo: string;
  setFormAssignedTo: (val: string) => void;
}

/**
 * Accessible modal dialog for adding or modifying schedule items.
 */
export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  phases,
  formPhase,
  setFormPhase,
  formTimeLabel,
  setFormTimeLabel,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formAssignedTo,
  setFormAssignedTo,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
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
            {isEdit ? 'Edit Milestone' : 'Add New Milestone'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="timeline-phase-select"
              className="block text-slate-200 font-medium mb-1"
            >
              Planning Phase
            </label>
            <select
              id="timeline-phase-select"
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
            <label htmlFor="timeline-title-input" className="block text-slate-200 font-medium mb-1">
              Milestone Title *
            </label>
            <input
              id="timeline-title-input"
              type="text"
              required
              placeholder="e.g. Confirm Catering Menu"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="timeline-time-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Time / Date Label
              </label>
              <input
                id="timeline-time-input"
                type="text"
                placeholder="e.g. 6 Weeks Before or 4:00 PM"
                value={formTimeLabel}
                onChange={(e) => setFormTimeLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="timeline-assignee-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Assigned Lead
              </label>
              <input
                id="timeline-assignee-input"
                type="text"
                placeholder="e.g. Event Host / Coordinator"
                value={formAssignedTo}
                onChange={(e) => setFormAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="timeline-desc-textarea"
              className="block text-slate-200 font-medium mb-1"
            >
              Description & Specifics
            </label>
            <textarea
              id="timeline-desc-textarea"
              rows={3}
              placeholder="Provide context, links, or instructions..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isEdit ? 'Save Changes' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
