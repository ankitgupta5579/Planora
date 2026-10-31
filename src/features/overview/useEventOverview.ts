import { useState } from 'react';
import { EventPlan } from '../../types/event';
import {
  calculateBudgetMetrics,
  calculateTimelineProgress,
  calculateVendorFinancials,
  calculateGuestStats,
  calculateDaysRemaining,
  formatLocalDate,
} from '../../utils/eventCalculators';

export interface UseEventOverviewProps {
  plan: EventPlan;
}

export function useEventOverview({ plan }: UseEventOverviewProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const budgetMetrics = calculateBudgetMetrics(plan.budgetItems, plan.totalBudget);
  const timelineProgress = calculateTimelineProgress(plan.timelineItems);
  const vendorFinancials = calculateVendorFinancials(plan.vendors);
  const guestStats = calculateGuestStats(plan.guests);
  const daysRemaining = calculateDaysRemaining(plan.date);
  const formattedDate = formatLocalDate(plan.date);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return {
    copiedHex,
    budgetMetrics,
    timelineProgress,
    vendorFinancials,
    guestStats,
    daysRemaining,
    formattedDate,
    handleCopyHex,
  };
}
