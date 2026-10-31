import React from 'react';
import { RotateCcw } from 'lucide-react';

interface AppFooterProps {
  onOpenResetConfirm: () => void;
}

/**
 * Global application footer with branding and demo reset trigger.
 */
export const AppFooter: React.FC<AppFooterProps> = ({ onOpenResetConfirm }) => {
  return (
    <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
      <p className="font-medium text-slate-300">Planora · Plan today, celebrate tomorrow</p>
      <p className="mt-1 text-slate-400">
        GenAI-powered planning for weddings, birthdays and community events: budgets, timelines &
        vendors.
      </p>
      <div className="mt-3">
        <button
          type="button"
          onClick={onOpenResetConfirm}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-md border border-slate-700/60 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Reset demo data to fresh defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </footer>
  );
};
