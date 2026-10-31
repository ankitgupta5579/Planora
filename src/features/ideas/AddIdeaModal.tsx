import React from 'react';
import { PersonalizedIdea } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { X } from 'lucide-react';

export interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formCategory: PersonalizedIdea['category'];
  setFormCategory: (val: PersonalizedIdea['category']) => void;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formTags: string;
  setFormTags: (val: string) => void;
}

const CATEGORY_CHOICES: { id: PersonalizedIdea['category']; label: string }[] = [
  { id: 'theme_decor', label: 'Theme & Decor' },
  { id: 'food_beverage', label: 'Food & Signature Drinks' },
  { id: 'entertainment', label: 'Entertainment & Games' },
  { id: 'guest_experience', label: 'Guest Experience & Keepsakes' },
  { id: 'sustainable_tip', label: 'Eco-Friendly & Zero Waste' },
];

/**
 * Accessible modal dialog for contributing a custom celebration touch or idea.
 */
export const AddIdeaModal: React.FC<AddIdeaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formCategory,
  setFormCategory,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formTags,
  setFormTags,
}) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-idea-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
      >
        <div className="flex items-center justify-between">
          <h3 id="add-idea-modal-title" className="text-lg font-bold text-white">
            Add Custom Idea or Touch
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
            <label htmlFor="idea-category-select" className="block text-slate-200 font-medium mb-1">
              Category
            </label>
            <select
              id="idea-category-select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as PersonalizedIdea['category'])}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORY_CHOICES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="idea-title-input" className="block text-slate-200 font-medium mb-1">
              Concept Title *
            </label>
            <input
              id="idea-title-input"
              type="text"
              required
              placeholder="e.g. Polaroid Guestbook Station"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="idea-desc-textarea" className="block text-slate-200 font-medium mb-1">
              Description & How to Execute
            </label>
            <textarea
              id="idea-desc-textarea"
              rows={3}
              placeholder="Guests snap candid photos and pin them with personal notes..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="idea-tags-input" className="block text-slate-200 font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              id="idea-tags-input"
              type="text"
              placeholder="Interactive, Keepsake, Photo"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
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
              Add Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
