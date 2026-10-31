import React from 'react';

export interface BudgetCategoryBreakdownProps {
  categoryBreakdown: Record<string, number>;
  totalBudget: number;
  currency: string;
}

/**
 * Visual breakdown of budget allocations across event categories with percentage progress bars.
 */
export const BudgetCategoryBreakdown: React.FC<BudgetCategoryBreakdownProps> = ({
  categoryBreakdown,
  totalBudget,
  currency,
}) => {
  const categories = Object.keys(categoryBreakdown);
  if (categories.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Category Allocations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const amount = categoryBreakdown[cat] || 0;
          const percentage = totalBudget > 0 ? Math.round((amount / totalBudget) * 100) : 0;

          return (
            <div
              key={cat}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 capitalize">{cat}</span>
                <span className="text-slate-400 font-medium">
                  {currency}
                  {amount.toLocaleString()} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
