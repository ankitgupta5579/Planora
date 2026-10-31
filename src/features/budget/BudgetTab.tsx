import React from 'react';
import { EventPlan, BudgetItem } from '../../types/event';
import { useBudget } from './useBudget';
import { BudgetSummaryCards } from './BudgetSummaryCards';
import { BudgetCategoryBreakdown } from './BudgetCategoryBreakdown';
import { BudgetItemRow } from './BudgetItemRow';
import { BudgetModal } from './BudgetModal';
import { Plus, Wand2, Search } from 'lucide-react';

export interface BudgetTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

const CATEGORIES: BudgetItem['category'][] = [
  'venue',
  'catering',
  'decor',
  'photography',
  'entertainment',
  'attire',
  'favors',
  'logistics',
  'marketing',
  'permits',
  'contingency',
  'other',
];

/**
 * Budget and cashflow management tab with automatic allocation rebalancing and variance tracking.
 */
export const BudgetTab: React.FC<BudgetTabProps> = ({ plan, onUpdatePlan }) => {
  const budgetState = useBudget({ plan, onUpdatePlan });

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <BudgetSummaryCards
        metrics={budgetState.metrics}
        currency={plan.currency}
        uncommittedCash={budgetState.uncommittedCash}
      />

      {/* Category Progress Breakdown */}
      <BudgetCategoryBreakdown
        categoryBreakdown={budgetState.categoryBreakdown}
        totalBudget={plan.totalBudget}
        currency={plan.currency}
      />

      {/* Control Bar: Filter, Rebalance, Add Item */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search budget items by title or note"
              placeholder="Search expenses..."
              value={budgetState.searchTerm}
              onChange={(e) => budgetState.setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label htmlFor="budget-category-filter" className="sr-only">
            Filter expenses by category
          </label>
          <select
            id="budget-category-filter"
            value={budgetState.selectedCategory}
            onChange={(e) => budgetState.setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={budgetState.handleAutoRebalance}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Rebalance</span>
          </button>

          <button
            type="button"
            onClick={budgetState.openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Allocated</th>
                <th className="py-3 px-4 text-right">Actual Spent</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgetState.filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No budget items match your filter.
                  </td>
                </tr>
              ) : (
                budgetState.filteredItems.map((item) => (
                  <BudgetItemRow
                    key={item.id}
                    item={item}
                    currency={plan.currency}
                    onOpenEdit={budgetState.openEditModal}
                    onDelete={budgetState.handleDeleteItem}
                    onTogglePaid={budgetState.handleTogglePaid}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <BudgetModal
        isOpen={budgetState.showAddModal}
        onClose={() => budgetState.setShowAddModal(false)}
        onSubmit={budgetState.handleSaveItem}
        isEdit={Boolean(budgetState.editItem)}
        currency={plan.currency}
        categories={CATEGORIES}
        formCategory={budgetState.formCategory}
        setFormCategory={budgetState.setFormCategory}
        formTitle={budgetState.formTitle}
        setFormTitle={budgetState.setFormTitle}
        formAllocated={budgetState.formAllocated}
        setFormAllocated={budgetState.setFormAllocated}
        formActual={budgetState.formActual}
        setFormActual={budgetState.setFormActual}
        formNotes={budgetState.formNotes}
        setFormNotes={budgetState.setFormNotes}
        formPaid={budgetState.formPaid}
        setFormPaid={budgetState.setFormPaid}
      />
    </div>
  );
};
