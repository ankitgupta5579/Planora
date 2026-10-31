import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardStep2LogisticsProps {
  title: string;
  setTitle: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  guestCount: string;
  setGuestCount: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  totalBudget: string;
  setTotalBudget: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Step 2: Logistics, dates, guest count, location, and target budget.
 */
export const WizardStep2Logistics: React.FC<WizardStep2LogisticsProps> = ({
  title,
  setTitle,
  date,
  setDate,
  guestCount,
  setGuestCount,
  location,
  setLocation,
  currency,
  setCurrency,
  totalBudget,
  setTotalBudget,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <label htmlFor="wizard-title-input" className="block text-slate-200 font-semibold mb-1">
          Celebration Title *
        </label>
        <input
          id="wizard-title-input"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Maya & Leo's Vineyard Wedding"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="wizard-date-input" className="block text-slate-200 font-semibold mb-1">
            Event Date *
          </label>
          <input
            id="wizard-date-input"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="wizard-guest-count-input"
            className="block text-slate-200 font-semibold mb-1"
          >
            Target Guest Count (1-5000) *
          </label>
          <input
            id="wizard-guest-count-input"
            type="number"
            min="1"
            max="5000"
            required
            placeholder="100"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="wizard-location-input" className="block text-slate-200 font-semibold mb-1">
          City / Venue Location *
        </label>
        <input
          id="wizard-location-input"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Monterey Bay Seaside Lawn, CA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label
            htmlFor="wizard-currency-select"
            className="block text-slate-200 font-semibold mb-1"
          >
            Currency
          </label>
          <select
            id="wizard-currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="₹">INR (₹)</option>
            <option value="C$">CAD (C$)</option>
            <option value="A$">AUD (A$)</option>
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor="wizard-budget-input" className="block text-slate-200 font-semibold mb-1">
            Total Target Budget ({currency}) *
          </label>
          <input
            id="wizard-budget-input"
            type="number"
            min="100"
            required
            placeholder="20000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition"
        >
          <span>Next: Vibe & Aesthetics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
