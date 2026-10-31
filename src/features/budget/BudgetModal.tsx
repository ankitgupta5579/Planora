import React from 'react';
import { BudgetItem } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { X } from 'lucide-react';

export interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  currency: string;
  categories: BudgetItem['category'][];
  formCategory: BudgetItem['category'];
  setFormCategory: (val: BudgetItem['category']) => void;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formAllocated: string;
  setFormAllocated: (val: string) => void;
  formActual: string;
  setFormActual: (val: string) => void;
  formNotes: string;
  setFormNotes: (val: string) => void;
  formPaid: boolean;
  setFormPaid: (val: boolean) => void;
}

/**
 * Accessible modal dialog for adding or modifying budget allocations and actual costs.
 */
export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  currency,
  categories,
  formCategory,
  setFormCategory,
  formTitle,
  setFormTitle,
  formAllocated,
  setFormAllocated,
  formActual,
  setFormActual,
  formNotes,
  setFormNotes,
  formPaid,
  setFormPaid,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
      >
        <div className="flex items-center justify-between">
          <h3 id="budget-modal-title" className="text-lg font-bold text-white">
            {isEdit ? 'Edit Budget Item' : 'Add New Budget Item'}
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
            <label htmlFor="budget-title-input" className="block text-slate-200 font-medium mb-1">
              Item Title *
            </label>
            <input
              id="budget-title-input"
              type="text"
              required
              placeholder="e.g. Wedding Cake & Dessert Bar"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="budget-category-select" className="block text-slate-200 font-medium mb-1">
              Category
            </label>
            <select
              id="budget-category-select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as BudgetItem['category'])}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="budget-allocated-input"
                className="block text-slate-200 font-medium mb-1"
              >
                Allocated Amount ({currency}) *
              </label>
              <input
                id="budget-allocated-input"
                type="number"
                min="0"
                step="any"
                required
                placeholder="1500"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="budget-actual-input" className="block text-slate-200 font-medium mb-1">
                Actual Spent ({currency})
              </label>
              <input
                id="budget-actual-input"
                type="number"
                min="0"
                step="any"
                placeholder="1200"
                value={formActual}
                onChange={(e) => setFormActual(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="budget-notes-input" className="block text-slate-200 font-medium mb-1">
              Notes
            </label>
            <input
              id="budget-notes-input"
              type="text"
              placeholder="e.g. Deposit paid on May 3"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="budget-paid-checkbox"
              type="checkbox"
              checked={formPaid}
              onChange={(e) => setFormPaid(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="budget-paid-checkbox" className="text-slate-200 font-medium cursor-pointer">
              Mark this expense as fully paid
            </label>
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
              {isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
