import React from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface DeleteEventConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  canDelete?: boolean;
}

export const DeleteEventConfirmDialog: React.FC<DeleteEventConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  canDelete = true,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-event-dialog-title"
        aria-describedby="delete-event-dialog-description"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative text-slate-100 z-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            {canDelete ? (
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1.5 pr-6">
            <h2 id="delete-event-dialog-title" className="text-base font-bold text-white">
              {canDelete ? `Delete "${eventTitle}"?` : 'Cannot Delete Last Event'}
            </h2>
            <p
              id="delete-event-dialog-description"
              className="text-xs text-slate-300 leading-relaxed"
            >
              {canDelete
                ? `Are you sure you want to permanently delete this event? All associated budget items, timeline milestones, vendor contacts, and guest lists will be removed.`
                : `Planora requires at least one active event. You cannot delete the only remaining event. To replace it, please create a new event first or reset demo data.`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {canDelete ? 'Cancel' : 'Close'}
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Delete Event</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
