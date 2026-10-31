import React from 'react';
import { GuestItem } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { X } from 'lucide-react';

export interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  formName: string;
  setFormName: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formGroup: GuestItem['group'];
  setFormGroup: (val: GuestItem['group']) => void;
  formRsvp: GuestItem['rsvpStatus'];
  setFormRsvp: (val: GuestItem['rsvpStatus']) => void;
  formPlusOnes: string;
  setFormPlusOnes: (val: string) => void;
  formDiet: string;
  setFormDiet: (val: string) => void;
  formTable: string;
  setFormTable: (val: string) => void;
}

const GROUPS: { id: GuestItem['group']; label: string }[] = [
  { id: 'family', label: 'Family' },
  { id: 'friends', label: 'Friends' },
  { id: 'colleagues', label: 'Colleagues' },
  { id: 'vip', label: 'VIP' },
  { id: 'general', label: 'General' },
];

const RSVP_STATUSES: { id: GuestItem['rsvpStatus']; label: string }[] = [
  { id: 'attending', label: 'Attending' },
  { id: 'pending', label: 'Pending Response' },
  { id: 'declined', label: 'Declined' },
];

/**
 * Accessible modal dialog for adding or editing a guest.
 */
export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  formName,
  setFormName,
  formEmail,
  setFormEmail,
  formGroup,
  setFormGroup,
  formRsvp,
  setFormRsvp,
  formPlusOnes,
  setFormPlusOnes,
  formDiet,
  setFormDiet,
  formTable,
  setFormTable,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto focus:outline-none relative"
      >
        <div className="flex items-center justify-between">
          <h3 id="guest-modal-title" className="text-lg font-bold text-white">
            {isEdit ? 'Edit Guest' : 'Add New Guest'}
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
            <label htmlFor="guest-name-input" className="block text-slate-200 font-medium mb-1">
              Guest Name *
            </label>
            <input
              id="guest-name-input"
              type="text"
              required
              placeholder="e.g. Dr. Jane Doe"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="guest-email-input" className="block text-slate-200 font-medium mb-1">
              Email Address
            </label>
            <input
              id="guest-email-input"
              type="email"
              placeholder="jane@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="guest-group-select" className="block text-slate-200 font-medium mb-1">
                Group
              </label>
              <select
                id="guest-group-select"
                value={formGroup}
                onChange={(e) => setFormGroup(e.target.value as GuestItem['group'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guest-rsvp-select" className="block text-slate-200 font-medium mb-1">
                RSVP Status
              </label>
              <select
                id="guest-rsvp-select"
                value={formRsvp}
                onChange={(e) => setFormRsvp(e.target.value as GuestItem['rsvpStatus'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {RSVP_STATUSES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="guest-plus-ones-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Plus-Ones (+# of guests)
              </label>
              <input
                id="guest-plus-ones-input"
                type="number"
                min="0"
                max="10"
                value={formPlusOnes}
                onChange={(e) => setFormPlusOnes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="guest-table-input" className="block text-slate-200 font-medium mb-1">
                Table Assignment
              </label>
              <input
                id="guest-table-input"
                type="text"
                placeholder="Table 4"
                value={formTable}
                onChange={(e) => setFormTable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guest-diet-input" className="block text-slate-200 font-medium mb-1">
              Dietary Restrictions / Allergies
            </label>
            <input
              id="guest-diet-input"
              type="text"
              placeholder="e.g. Gluten-free, Vegan, Peanut allergy"
              value={formDiet}
              onChange={(e) => setFormDiet(e.target.value)}
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
              {isEdit ? 'Save Guest' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
