import React, { useState } from 'react';
import { EventPlan, BudgetItem } from '../types/event';
import {
  calculateBudgetMetrics,
  rebalanceBudgetItems,
  getBudgetItemVariance,
  calculateUncommittedCash,
  calculateOutstandingVendorBalances,
} from '../utils/eventCalculators';
import { useFocusTrap } from '../utils/useFocusTrap';
import { safeConfetti } from '../utils/motion';
import { Plus, Trash2, AlertCircle, Wand2, Search, Check, Clock, X } from 'lucide-react';

interface BudgetTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ plan, onUpdatePlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetItem['category']>('catering');
  const [formTitle, setFormTitle] = useState('');
  const [formAllocated, setFormAllocated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPaid, setFormPaid] = useState(false);

  const modalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));
  const metrics = calculateBudgetMetrics(plan.budgetItems, plan.totalBudget);
  const uncommittedCash = calculateUncommittedCash(plan);
  const outstandingVendorBalances = calculateOutstandingVendorBalances(plan.vendors);

  const categories: BudgetItem['category'][] = [
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

  const handleTogglePaid = (item: BudgetItem) => {
    const updated = plan.budgetItems.map((b) =>
      b.id === item.id ? { ...b, isPaid: !b.isPaid } : b
    );
    onUpdatePlan({ ...plan, budgetItems: updated, updatedAt: new Date().toISOString() });

    if (!item.isPaid) {
      safeConfetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.budgetItems.filter((b) => b.id !== id);
    onUpdatePlan({ ...plan, budgetItems: updated, updatedAt: new Date().toISOString() });
  };

  const handleRebalance = () => {
    const rebalanced = rebalanceBudgetItems(plan.budgetItems, plan.totalBudget);
    onUpdatePlan({ ...plan, budgetItems: rebalanced, updatedAt: new Date().toISOString() });
    safeConfetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormCategory('catering');
    setFormTitle('');
    setFormAllocated('');
    setFormActual('');
    setFormNotes('');
    setFormPaid(false);
    setShowAddModal(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditItem(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormAllocated(String(item.allocatedAmount));
    setFormActual(String(item.actualAmount));
    setFormNotes(item.notes || '');
    setFormPaid(item.isPaid);
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const allocatedAmount = Math.max(0, Number(formAllocated) || 0);
    const actualAmount = Math.max(0, Number(formActual) || 0);

    if (editItem) {
      const updated = plan.budgetItems.map((b) =>
        b.id === editItem.id
          ? {
              ...b,
              category: formCategory,
              title: formTitle.trim(),
              allocatedAmount,
              actualAmount,
              isPaid: formPaid,
              notes: formNotes.trim(),
            }
          : b
      );
      onUpdatePlan({ ...plan, budgetItems: updated, updatedAt: new Date().toISOString() });
    } else {
      const newItem: BudgetItem = {
        id: 'b-' + Date.now(),
        category: formCategory,
        title: formTitle.trim(),
        allocatedAmount,
        actualAmount,
        isPaid: formPaid,
        notes: formNotes.trim(),
      };
      onUpdatePlan({
        ...plan,
        budgetItems: [...plan.budgetItems, newItem],
        updatedAt: new Date().toISOString(),
      });
    }

    setShowAddModal(false);
  };

  const filteredItems = plan.budgetItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Total Budget Target
          </div>
          <div className="text-2xl font-bold text-white">
            {plan.currency}
            {plan.totalBudget.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Set overall ceiling</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Allocated Planned
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {plan.currency}
            {metrics.totalAllocated.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.allocatedPercentage}% of total budget
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Actual Spent to Date
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {plan.currency}
            {metrics.totalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">{metrics.spendPercentage}% disbursed</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Unspent budget
          </div>
          <div className="text-2xl font-bold">
            {metrics.remainingCash >= 0 ? (
              <span className="text-slate-100">
                {plan.currency}
                {metrics.remainingCash.toLocaleString()}
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
                Over limit by {plan.currency}
                {Math.abs(metrics.remainingCash).toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.remainingCash >= 0
              ? 'Remaining before commitments'
              : '⚠️ Exceeds total budget cap'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Uncommitted cash
          </div>
          <div className="text-2xl font-bold">
            {uncommittedCash > 0 ? (
              <span className="text-emerald-400">
                {plan.currency}
                {uncommittedCash.toLocaleString()}
              </span>
            ) : uncommittedCash < 0 ? (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />-{plan.currency}
                {Math.abs(uncommittedCash).toLocaleString()}
              </span>
            ) : (
              <span className="text-slate-100">{plan.currency}0</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            after {plan.currency}
            {outstandingVendorBalances.toLocaleString()} vendor balances due
          </div>
        </div>
      </div>

      {/* Over Budget Notice with aria-live="polite" */}
      {metrics.isOverBudget && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-rose-200">Budget Limit Exceeded</h4>
              <p className="text-xs text-rose-300">
                Current expenses or allocations exceed your total budget cap of {plan.currency}
                {plan.totalBudget.toLocaleString()}.
              </p>
            </div>
          </div>
          <button
            onClick={handleRebalance}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-Rebalance Allocations</span>
          </button>
        </div>
      )}

      {/* Control Bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <label htmlFor="budget-search-input" className="sr-only">
              Search budget expenses
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="budget-search-input"
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <label htmlFor="budget-category-filter" className="sr-only">
              Filter expenses by category
            </label>
            <select
              id="budget-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRebalance}
            title="Proportionally scale allocated amounts to match target budget"
            aria-label="Proportionally auto-rebalance allocations to match target budget"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Rebalance</span>
          </button>

          <button
            onClick={openAddModal}
            aria-label="Add new expense item"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/80 text-slate-200 uppercase text-xs font-semibold tracking-wider border-b border-slate-700">
            <tr>
              <th scope="col" className="py-3 px-4">
                Status
              </th>
              <th scope="col" className="py-3 px-4">
                Item & Details
              </th>
              <th scope="col" className="py-3 px-4">
                Category
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Allocated
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actual Spent
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Variance
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-300">
                  No budget items match your filter.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePaid(item)}
                        aria-label={`Toggle payment status for ${item.title}. Currently ${
                          item.isPaid ? 'Paid' : item.actualAmount > 0 ? 'Deposit Paid' : 'Unpaid'
                        }`}
                        className="flex items-center gap-1.5 cursor-pointer text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        {item.isPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" /> Paid
                          </span>
                        ) : item.actualAmount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-xs flex items-center gap-1">
                            Deposit Paid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium text-xs hover:text-white">
                            Unpaid
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      {item.notes && (
                        <div className="text-xs text-slate-300 line-clamp-1">{item.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium text-xs uppercase border border-slate-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-100">
                      {plan.currency}
                      {item.allocatedAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-100">
                      {plan.currency}
                      {item.actualAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-medium">
                      {(() => {
                        const v = getBudgetItemVariance(item);
                        if (v.status === 'over') {
                          return (
                            <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                              Over by {plan.currency}
                              {v.amount.toLocaleString()}
                            </span>
                          );
                        }
                        if (v.status === 'under') {
                          return (
                            <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              Under by {plan.currency}
                              {v.amount.toLocaleString()}
                            </span>
                          );
                        }
                        if (v.status === 'balance_due') {
                          return (
                            <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                              Balance due {plan.currency}
                              {v.amount.toLocaleString()}
                            </span>
                          );
                        }
                        return (
                          <span className="text-slate-300 font-medium">
                            On target ({plan.currency}0)
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          aria-label={`Edit expense: ${item.title}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded px-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label={`Delete expense: ${item.title}`}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
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
                {editItem ? 'Edit Expense Item' : 'Add New Expense Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="expense-title-input"
                  className="block text-slate-200 font-medium mb-1"
                >
                  Item Title *
                </label>
                <input
                  id="expense-title-input"
                  type="text"
                  required
                  placeholder="e.g. Reception Dinner Buffet"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="expense-category-select"
                    className="block text-slate-200 font-medium mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="expense-category-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BudgetItem['category'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="expense-allocated-input"
                    className="block text-slate-200 font-medium mb-1"
                  >
                    Allocated ({plan.currency})
                  </label>
                  <input
                    id="expense-allocated-input"
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={formAllocated}
                    onChange={(e) => setFormAllocated(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="expense-actual-input"
                    className="block text-slate-200 font-medium mb-1"
                  >
                    Actual Spent ({plan.currency})
                  </label>
                  <input
                    id="expense-actual-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formActual}
                    onChange={(e) => setFormActual(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label
                    htmlFor="expense-paid-checkbox"
                    className="flex items-center gap-2 cursor-pointer text-slate-200"
                  >
                    <input
                      id="expense-paid-checkbox"
                      type="checkbox"
                      checked={formPaid}
                      onChange={(e) => setFormPaid(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-800 border-slate-700"
                    />
                    <span>Payment Settled (Paid)</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="expense-notes-textarea"
                  className="block text-slate-200 font-medium mb-1"
                >
                  Notes / Vendor References
                </label>
                <textarea
                  id="expense-notes-textarea"
                  rows={2}
                  placeholder="e.g. Deposit due 14 days prior; includes 18% gratuity"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {editItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
