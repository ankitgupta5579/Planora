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
  const categoryBreakdown: Record<string, { allocated: number; actual: number; count: number }> = {};

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
  const spendPercentage = safeTotalBudget > 0 ? Math.min(100, Math.round((totalSpent / safeTotalBudget) * 100)) : 0;
  const allocatedPercentage = safeTotalBudget > 0 ? Math.min(100, Math.round((totalAllocated / safeTotalBudget) * 100)) : 0;
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

export function rebalanceBudgetItems(items: BudgetItem[], totalBudget: number): BudgetItem[] {
  const currentTotal = items.reduce((sum, item) => sum + (Number(item.allocatedAmount) || 0), 0);
  if (currentTotal === 0 || totalBudget <= 0) return items;

  const ratio = totalBudget / currentTotal;
  return items.map((item) => ({
    ...item,
    allocatedAmount: Math.round((Number(item.allocatedAmount) || 0) * ratio),
  }));
}

export function calculateTimelineProgress(items: TimelineItem[]): {
  total: number;
  completed: number;
  percentage: number;
  byPhase: Record<string, { total: number; completed: number }>;
} {
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

export function calculateVendorFinancials(vendors: VendorItem[]): {
  totalQuotes: number;
  totalDepositsPaid: number;
  totalRemainingBalance: number;
  bookedCount: number;
  totalCount: number;
} {
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

export function calculateGuestStats(guests: GuestItem[]): {
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
  totalHeadcount: number; // including plusOnes
  dietaryCounts: Record<string, number>;
} {
  let totalAttending = 0;
  let totalDeclined = 0;
  let totalPending = 0;
  let totalHeadcount = 0;
  const dietaryCounts: Record<string, number> = {};

  for (const guest of guests) {
    if (guest.rsvpStatus === 'attending') {
      totalAttending++;
      totalHeadcount += 1 + (Number(guest.plusOnes) || 0);
    } else if (guest.rsvpStatus === 'declined') {
      totalDeclined++;
    } else {
      totalPending++;
    }

    if (guest.dietaryRestrictions && guest.dietaryRestrictions.trim() !== '') {
      const diet = guest.dietaryRestrictions.trim().toLowerCase();
      dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
    }
  }

  return {
    totalInvited: guests.length,
    totalAttending,
    totalDeclined,
    totalPending,
    totalHeadcount,
    dietaryCounts,
  };
}

export function calculateDaysRemaining(targetDate: string, fromDate = new Date()): number {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = target.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / msPerDay);
}
