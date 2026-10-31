import React from 'react';
import { BudgetMetrics } from '../../utils/eventCalculators';
import { AlertCircle } from 'lucide-react';

export interface BudgetSummaryCardsProps {
  metrics: BudgetMetrics;
  currency: string;
  uncommittedCash: number;
}

/**
 * Renders the top financial summary cards and over-budget alert banners.
 */
export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  metrics,
  currency,
  uncommittedCash,
}) => {
  return (
    <div className="space-y-4">
      {metrics.isOverBudget && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-xs"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Over Budget Alert: </span>
            Actual expenditures exceed the allocated total by {currency}
            {(metrics.totalSpent - metrics.totalBudget).toLocaleString()}. Review items or rebalance
            allocations.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Budget
          </span>
          <div className="text-2xl font-bold text-white">
            {currency}
            {metrics.totalBudget.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Total cap configured</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Allocated Planned
          </span>
          <div className="text-2xl font-bold text-indigo-400">
            {currency}
            {metrics.totalAllocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Across all item categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Actual Spent
          </span>
          <div
            className={`text-2xl font-bold ${metrics.isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}
          >
            {currency}
            {metrics.totalSpent.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">
            {metrics.spendPercentage}% of total budget
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Uncommitted Cash
          </span>
          <div
            className={`text-2xl font-bold ${uncommittedCash < 0 ? 'text-rose-400' : 'text-amber-400'}`}
          >
            {currency}
            {uncommittedCash.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">
            {uncommittedCash >= 0 ? 'Buffer remaining' : 'Deficit'}
          </span>
        </div>
      </div>
    </div>
  );
};
