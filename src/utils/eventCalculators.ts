import { BudgetItem, TimelineItem, VendorItem, GuestItem } from '../types/event';

export interface BudgetMetrics {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  unallocated: number;
  remainingCash: number;
  spendPercentage: number;
  allocatedPercentage: number;
  isOverBudget: boolean;
  categoryBreakdown: Record<string, { allocated: number; actual: number; count: number }>;
}

export function calculateBudgetMetrics(items: BudgetItem[], totalBudget: number): BudgetMetrics {
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

export type BudgetItemVarianceStatus = 'balance_due' | 'under' | 'over' | 'on_target';

export interface BudgetItemVarianceResult {
  status: BudgetItemVarianceStatus;
  amount: number;
  label: string;
}

/**
 * Evaluates the financial variance of a budget line item.
 * - If actual > allocated: 'over' (Over by $X)
 * - If actual < allocated:
 *     - If item is fully paid: 'under' (Under by $X)
 *     - If item is deposit paid / partial (isPaid is false): 'balance_due' (Balance due $X)
 * - If actual === allocated: 'on_target' (On target ($0))
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

export function normalizeBudgetItems(items: BudgetItem[], totalBudget: number): BudgetItem[] {
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

export function rebalanceBudgetItems(items: BudgetItem[], totalBudget: number): BudgetItem[] {
  return normalizeBudgetItems(items, totalBudget);
}

export interface TimelineProgress {
  total: number;
  completed: number;
  percentage: number;
  byPhase: Record<string, { total: number; completed: number }>;
}

export function calculateTimelineProgress(items: TimelineItem[]): TimelineProgress {
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

export interface VendorFinancials {
  totalQuotes: number;
  totalDepositsPaid: number;
  totalRemainingBalance: number;
  bookedCount: number;
  totalCount: number;
}

export function calculateVendorFinancials(vendors: VendorItem[]): VendorFinancials {
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
 */
export function calculateOutstandingVendorBalances(vendors: VendorItem[] = []): number {
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
 */
export function calculateUncommittedCash(event: {
  totalBudget: number;
  budgetItems?: BudgetItem[];
  vendors?: VendorItem[];
}): number {
  const safeTotalBudget = Number(event.totalBudget) || 0;
  const totalSpent = (event.budgetItems || []).reduce(
    (sum, item) => sum + (Number(item.actualAmount) || 0),
    0
  );
  const outstandingVendorBalances = calculateOutstandingVendorBalances(event.vendors);
  return safeTotalBudget - totalSpent - outstandingVendorBalances;
}

export interface GuestStats {
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
  totalPlusOnes: number;
  totalHeadcount: number; // including plusOnes
  dietaryCounts: Record<string, number>;
}

export function calculateGuestStats(guests: GuestItem[]): GuestStats {
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
