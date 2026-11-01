import { BudgetItem, TimelineItem, VendorItem, GuestItem } from '../types/event';

/**
 * Aggregated financial summary of all allocated and spent funds.
 */
export interface BudgetMetrics {
  /** Maximum authorized budget cap in event currency. */
  totalBudget: number;
  /** Total sum of all line item allocations. */
  totalAllocated: number;
  /** Total sum of actual expenses logged or paid. */
  totalSpent: number;
  /** Remaining unallocated budget available for new line items. */
  unallocated: number;
  /** Liquid unspent cash remaining against total budget cap. */
  remainingCash: number;
  /** Percentage of authorized budget spent (clamped between 0 and 100). */
  spendPercentage: number;
  /** Percentage of authorized budget allocated (clamped between 0 and 100). */
  allocatedPercentage: number;
  /** Flag indicating whether spent or allocated funds exceed total budget cap. */
  isOverBudget: boolean;
  /** Breakdown aggregated by budget category. */
  categoryBreakdown: Record<string, { allocated: number; actual: number; count: number }>;
}

/**
 * Calculates deterministic budget metrics across line items.
 *
 * @param items - List of budget line items
 * @param totalBudget - Total authorized event budget
 * @returns Complete BudgetMetrics summary object
 * @complexity O(n) where n is the number of budget items
 */
export function calculateBudgetMetrics(
  items: readonly BudgetItem[],
  totalBudget: number
): BudgetMetrics {
  const safeTotalBudget = Math.max(0, totalBudget);
  let totalAllocated = 0;
  let totalSpent = 0;
  const categoryBreakdown: Record<string, { allocated: number; actual: number; count: number }> =
    {};

  for (const item of items) {
    const allocated = Number(item.allocatedAmount) || 0;
    const actual = Number(item.actualAmount) || 0;
    totalAllocated += allocated;
    totalSpent += actual;

    const cat = item.category || 'other';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { allocated: 0, actual: 0, count: 0 };
    }
    categoryBreakdown[cat].allocated += allocated;
    categoryBreakdown[cat].actual += actual;
    categoryBreakdown[cat].count += 1;
  }

  const unallocated = Math.max(0, safeTotalBudget - totalAllocated);
  const remainingCash = safeTotalBudget - totalSpent;
  const spendPercentage =
    safeTotalBudget > 0 ? Math.min(100, Math.round((totalSpent / safeTotalBudget) * 100)) : 0;
  const allocatedPercentage =
    safeTotalBudget > 0 ? Math.min(100, Math.round((totalAllocated / safeTotalBudget) * 100)) : 0;
  const isOverBudget = totalSpent > safeTotalBudget || totalAllocated > safeTotalBudget;

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalSpent,
    unallocated,
    remainingCash,
    spendPercentage,
    allocatedPercentage,
    isOverBudget,
    categoryBreakdown,
  };
}

/**
 * Status indicator for item-level budget variance.
 */
export type BudgetItemVarianceStatus = 'balance_due' | 'under' | 'over' | 'on_target';

/**
 * Variance result evaluating individual budget line items.
 */
export interface BudgetItemVarianceResult {
  status: BudgetItemVarianceStatus;
  amount: number;
  label: string;
}

/**
 * Evaluates the financial variance of an individual budget line item.
 *
 * Logic:
 * - If actual > allocated: 'over' (Over by $X)
 * - If actual < allocated:
 *     - If item is marked fully paid: 'under' (Under by $X)
 *     - If item is deposit/partially paid (isPaid === false): 'balance_due' (Balance due $X)
 * - If actual === allocated: 'on_target' (On target ($0))
 *
 * @param item - Target budget line item
 * @returns Status, amount, and human-readable label
 */
export function getBudgetItemVariance(item: BudgetItem): BudgetItemVarianceResult {
  const allocated = Number(item.allocatedAmount) || 0;
  const actual = Number(item.actualAmount) || 0;
  const diff = allocated - actual;

  if (actual > allocated) {
    return {
      status: 'over',
      amount: actual - allocated,
      label: 'Over by',
    };
  }

  if (actual < allocated) {
    if (item.isPaid) {
      return {
        status: 'under',
        amount: diff,
        label: 'Under by',
      };
    }
    return {
      status: 'balance_due',
      amount: diff,
      label: 'Balance due',
    };
  }

  return {
    status: 'on_target',
    amount: 0,
    label: 'On target ($0)',
  };
}

/**
 * Normalizes and proportions budget item allocations to match total target budget.
 * Handles rounding residuals on the final line item to ensure exact integer sum matching.
 *
 * @param items - Budget items to rebalance
 * @param totalBudget - Target total budget to scale toward
 * @returns New array of rebalanced BudgetItem copies
 */
export function normalizeBudgetItems(
  items: readonly BudgetItem[],
  totalBudget: number
): BudgetItem[] {
  const targetBudget = Math.max(0, Math.round(totalBudget));
  if (!items || items.length === 0) {
    if (targetBudget === 0) return [];
    return [
      {
        id: 'b-1',
        category: 'contingency',
        title: 'Emergency & General Contingency',
        allocatedAmount: targetBudget,
        actualAmount: 0,
        isPaid: false,
        notes: 'Initial allocation',
      },
    ];
  }

  const currentTotal = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.allocatedAmount) || 0),
    0
  );

  if (currentTotal === 0) {
    const count = items.length;
    const baseShare = Math.floor(targetBudget / count);
    let running = 0;
    return items.map((item, idx) => {
      const isLast = idx === count - 1;
      const allocated = isLast ? Math.max(0, targetBudget - running) : baseShare;
      running += allocated;
      return {
        ...item,
        allocatedAmount: allocated,
      };
    });
  }

  const ratio = targetBudget / currentTotal;
  let runningAllocated = 0;

  return items.map((item, idx) => {
    const isLast = idx === items.length - 1;
    const rawAllocated = Math.max(0, Number(item.allocatedAmount) || 0);
    const allocated = isLast
      ? Math.max(0, targetBudget - runningAllocated)
      : Math.round(rawAllocated * ratio);

    runningAllocated += allocated;
    return {
      ...item,
      allocatedAmount: allocated,
    };
  });
}

/**
 * Rebalances budget items across categories proportionally.
 *
 * @param items - Budget items to normalize
 * @param totalBudget - Target event budget
 * @returns Proportional budget items
 */
export function rebalanceBudgetItems(
  items: readonly BudgetItem[],
  totalBudget: number
): BudgetItem[] {
  return normalizeBudgetItems(items, totalBudget);
}

/**
 * Progress tracking aggregate for schedule and milestone completion.
 */
export interface TimelineProgress {
  total: number;
  completed: number;
  percentage: number;
  byPhase: Record<string, { total: number; completed: number }>;
}

/**
 * Computes milestone and schedule completion statistics.
 *
 * @param items - Event timeline items
 * @returns Aggregated progress by phase and overall percentage
 */
export function calculateTimelineProgress(items: readonly TimelineItem[]): TimelineProgress {
  const total = items.length;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0, byPhase: {} };
  }

  let completed = 0;
  const byPhase: Record<string, { total: number; completed: number }> = {};

  for (const item of items) {
    if (item.completed) completed++;
    const ph = item.phase;
    if (!byPhase[ph]) {
      byPhase[ph] = { total: 0, completed: 0 };
    }
    byPhase[ph].total += 1;
    if (item.completed) byPhase[ph].completed += 1;
  }

  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage, byPhase };
}

/**
 * Financial metrics across contracted and prospective vendors.
 */
export interface VendorFinancials {
  totalQuotes: number;
  totalDepositsPaid: number;
  totalRemainingBalance: number;
  bookedCount: number;
  totalCount: number;
}

/**
 * Aggregates vendor quotes, deposits paid, and pending balances.
 *
 * @param vendors - Event vendor list
 * @returns VendorFinancials breakdown
 */
export function calculateVendorFinancials(vendors: readonly VendorItem[]): VendorFinancials {
  let totalQuotes = 0;
  let totalDepositsPaid = 0;
  let bookedCount = 0;

  for (const vendor of vendors) {
    totalQuotes += Number(vendor.quoteAmount) || 0;
    totalDepositsPaid += Number(vendor.depositPaid) || 0;
    if (vendor.status === 'booked' || vendor.status === 'contract_signed') {
      bookedCount++;
    }
  }

  const totalRemainingBalance = Math.max(0, totalQuotes - totalDepositsPaid);

  return {
    totalQuotes,
    totalDepositsPaid,
    totalRemainingBalance,
    bookedCount,
    totalCount: vendors.length,
  };
}

/**
 * Calculates total outstanding balances owed to vendors (excluding declined vendors).
 *
 * @param vendors - Array of vendor items
 * @returns Total pending balance in currency units
 */
export function calculateOutstandingVendorBalances(
  vendors: readonly VendorItem[] = []
): number {
  return vendors.reduce((sum, v) => {
    if (v.status === 'declined') return sum;
    const quote = Number(v.quoteAmount) || 0;
    const deposit = Number(v.depositPaid) || 0;
    return sum + Math.max(0, quote - deposit);
  }, 0);
}

/**
 * Calculates uncommitted cash:
 * totalBudget - totalSpent - outstandingVendorBalances
 * Never clamped below 0 unless truly overcommitted (returns a negative number so overcommitment can be flagged).
 *
 * @param event - Event context with totalBudget, budgetItems, and vendors
 * @returns Liquid uncommitted balance
 */
export function calculateUncommittedCash(event: {
  totalBudget: number;
  budgetItems?: readonly BudgetItem[];
  vendors?: readonly VendorItem[];
}): number {
  const safeTotalBudget = Number(event.totalBudget) || 0;
  const totalSpent = (event.budgetItems || []).reduce(
    (sum, item) => sum + (Number(item.actualAmount) || 0),
    0
  );
  const outstandingVendorBalances = calculateOutstandingVendorBalances(event.vendors);
  return safeTotalBudget - totalSpent - outstandingVendorBalances;
}

/**
 * RSVP and headcount metrics including dietary restriction breakdown.
 */
export interface GuestStats {
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
  totalPlusOnes: number;
  totalHeadcount: number;
  dietaryCounts: Record<string, number>;
}

/**
 * Computes guest attendance statistics, confirmed headcount including plus-ones,
 * and aggregated dietary requirement tallies.
 *
 * @param guests - List of invited guests
 * @returns Complete GuestStats summary
 */
export function calculateGuestStats(guests: readonly GuestItem[]): GuestStats {
  let totalAttending = 0;
  let totalDeclined = 0;
  let totalPending = 0;
  let totalPlusOnes = 0;
  let totalHeadcount = 0;
  const dietaryCounts: Record<string, number> = {};

  for (const guest of guests) {
    if (guest.rsvpStatus === 'attending') {
      totalAttending++;
      const plus = Number(guest.plusOnes) || 0;
      totalPlusOnes += plus;
      totalHeadcount += 1 + plus;
    } else if (guest.rsvpStatus === 'declined') {
      totalDeclined++;
    } else {
      totalPending++;
    }

    if (guest.dietaryRestrictions && guest.dietaryRestrictions.trim() !== '') {
      const diet = guest.dietaryRestrictions.trim().toLowerCase();
      if (
        diet !== 'none' &&
        diet !== 'no' &&
        diet !== 'n/a' &&
        diet !== 'standard' &&
        diet !== 'nil'
      ) {
        dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
      }
    }
  }

  return {
    totalInvited: guests.length,
    totalAttending,
    totalDeclined,
    totalPending,
    totalPlusOnes,
    totalHeadcount,
    dietaryCounts,
  };
}

export { parseLocalDate, formatLocalDate, calculateDaysRemaining } from './dates';
