import React from 'react';
import { VendorItem } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { X } from 'lucide-react';

export interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  currency: string;
  statuses: { id: VendorItem['status']; label: string }[];
  formCategory: string;
  setFormCategory: (val: string) => void;
  formName: string;
  setFormName: (val: string) => void;
  formContactName: string;
  setFormContactName: (val: string) => void;
  formPhone: string;
  setFormPhone: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formQuote: string;
  setFormQuote: (val: string) => void;
  formDeposit: string;
  setFormDeposit: (val: string) => void;
  formStatus: VendorItem['status'];
  setFormStatus: (val: VendorItem['status']) => void;
  formChecklistRaw: string;
  setFormChecklistRaw: (val: string) => void;
  formNotes: string;
  setFormNotes: (val: string) => void;
}

/**
 * Accessible modal dialog for adding or editing vendor details.
 */
export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  currency,
  statuses,
  formCategory,
  setFormCategory,
  formName,
  setFormName,
  formContactName,
  setFormContactName,
  formPhone,
  setFormPhone,
  formEmail,
  setFormEmail,
  formQuote,
  setFormQuote,
  formDeposit,
  setFormDeposit,
  formStatus,
  setFormStatus,
  formChecklistRaw,
  setFormChecklistRaw,
  formNotes,
  setFormNotes,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto focus:outline-none relative"
      >
        <div className="flex items-center justify-between">
          <h3 id="vendor-modal-title" className="text-lg font-bold text-white">
            {isEdit ? 'Edit Vendor Details' : 'Add New Vendor'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="vendor-category-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Category *
              </label>
              <input
                id="vendor-category-input"
                type="text"
                required
                placeholder="e.g. Catering, Photo, DJ"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="vendor-name-input" className="block text-slate-200 font-medium mb-1">
                Company / Vendor Name *
              </label>
              <input
                id="vendor-name-input"
                type="text"
                required
                placeholder="e.g. Pacific Sound & Lights"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="vendor-contact-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Contact Rep
              </label>
              <input
                id="vendor-contact-input"
                type="text"
                placeholder="Marcus"
                value={formContactName}
                onChange={(e) => setFormContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="vendor-phone-input" className="block text-slate-200 font-medium mb-1">
                Phone
              </label>
              <input
                id="vendor-phone-input"
                type="text"
                placeholder="555-0199"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="vendor-email-input" className="block text-slate-200 font-medium mb-1">
                Email
              </label>
              <input
                id="vendor-email-input"
                type="email"
                placeholder="sales@..."
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="vendor-quote-input" className="block text-slate-200 font-medium mb-1">
                Quote ({currency})
              </label>
              <input
                id="vendor-quote-input"
                type="number"
                min="0"
                placeholder="3000"
                value={formQuote}
                onChange={(e) => setFormQuote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="vendor-deposit-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Deposit Paid
              </label>
              <input
                id="vendor-deposit-input"
                type="number"
                min="0"
                placeholder="1000"
                value={formDeposit}
                onChange={(e) => setFormDeposit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="vendor-status-modal-select"
                className="block text-slate-200 font-medium mb-1"
              >
                Status
              </label>
              <select
                id="vendor-status-modal-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as VendorItem['status'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="vendor-checklist-textarea"
              className="block text-slate-200 font-medium mb-1"
            >
              Action Checklist (one item per line)
            </label>
            <textarea
              id="vendor-checklist-textarea"
              rows={3}
              placeholder="Review quotes&#10;Verify insurance liability&#10;Pay deposit"
              value={formChecklistRaw}
              onChange={(e) => setFormChecklistRaw(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="vendor-notes-textarea" className="block text-slate-200 font-medium mb-1">
              Notes & Scope Details
            </label>
            <textarea
              id="vendor-notes-textarea"
              rows={2}
              placeholder="Includes delivery and 2 crew setup technicians."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
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
              {isEdit ? 'Save Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
