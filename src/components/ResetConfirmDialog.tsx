import React from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

export interface ResetConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
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
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 pr-6">
            <h2 id="reset-dialog-title" className="text-base font-bold text-white">
              Reset Demo Data
            </h2>
            <p id="reset-dialog-description" className="text-xs text-slate-300 leading-relaxed">
              This will erase all saved events in this browser and restore the sample events.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset All Events</span>
          </button>
        </div>
      </div>
    </div>
  );
};
