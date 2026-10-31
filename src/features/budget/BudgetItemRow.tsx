import React from 'react';
import { BudgetItem } from '../../types/event';
import { getBudgetItemVariance } from '../../utils/eventCalculators';
import { Check, Trash2 } from 'lucide-react';

export interface BudgetItemRowProps {
  item: BudgetItem;
  currency: string;
  onOpenEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (item: BudgetItem) => void;
}

/**
 * Accessible table row representing a single budget ledger entry.
 */
export const BudgetItemRow: React.FC<BudgetItemRowProps> = ({
  item,
  currency,
  onOpenEdit,
  onDelete,
  onTogglePaid,
}) => {
  const variance = getBudgetItemVariance(item);

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
      {/* Paid Status Toggle */}
      <td className="py-3 px-4">
        <button
          type="button"
          onClick={() => onTogglePaid(item)}
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

      {/* Title & Notes */}
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-100">{item.title}</div>
        {item.notes && <div className="text-xs text-slate-300 line-clamp-1">{item.notes}</div>}
      </td>

      {/* Category */}
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium text-xs uppercase border border-slate-700">
          {item.category}
        </span>
      </td>

      {/* Allocated Amount */}
      <td className="py-3 px-4 text-right font-medium text-slate-100">
        {currency}
        {item.allocatedAmount.toLocaleString()}
      </td>

      {/* Actual Amount */}
      <td className="py-3 px-4 text-right font-medium text-slate-100">
        {currency}
        {item.actualAmount.toLocaleString()}
      </td>

      {/* Variance */}
      <td className="py-3 px-4 text-right font-medium">
        {variance.status === 'over' ? (
          <span className="text-rose-400 font-bold inline-flex items-center gap-1">
            Over by {currency}
            {variance.amount.toLocaleString()}
          </span>
        ) : variance.status === 'under' ? (
          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Under by {currency}
            {variance.amount.toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-400">On Budget</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.title}`}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
