import { useState, useMemo } from 'react';
import { EventPlan } from '../../types/event';
import {
  calculateBudgetMetrics,
  calculateTimelineProgress,
  calculateVendorFinancials,
  calculateGuestStats,
  calculateDaysRemaining,
  formatLocalDate,
  BudgetMetrics,
  TimelineProgress,
  VendorFinancials,
  GuestStats,
} from '../../utils/eventCalculators';

/**
 * Props for useEventOverview domain hook.
 */
export interface UseEventOverviewProps {
  plan: EventPlan;
}

/**
 * Return contract for useEventOverview hook.
 */
export interface UseEventOverviewReturn {
  copiedHex: string | null;
  budgetMetrics: BudgetMetrics;
  timelineProgress: TimelineProgress;
  vendorFinancials: VendorFinancials;
  guestStats: GuestStats;
  daysRemaining: number;
  formattedDate: string;
  handleCopyHex: (hex: string) => void;
}

/**
 * Domain hook providing aggregated mission control metrics and palette clipboard operations.
 *
 * @param props - Event plan record
 * @returns Fully typed executive overview metrics and actions
 */
export function useEventOverview({ plan }: UseEventOverviewProps): UseEventOverviewReturn {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const budgetMetrics = useMemo(
    () => calculateBudgetMetrics(plan.budgetItems, plan.totalBudget),
    [plan.budgetItems, plan.totalBudget]
  );

  const timelineProgress = useMemo(
    () => calculateTimelineProgress(plan.timelineItems),
    [plan.timelineItems]
  );

  const vendorFinancials = useMemo(
    () => calculateVendorFinancials(plan.vendors),
    [plan.vendors]
  );

  const guestStats = useMemo(
    () => calculateGuestStats(plan.guests),
    [plan.guests]
  );

  const daysRemaining = useMemo(
    () => calculateDaysRemaining(plan.date),
    [plan.date]
  );

  const formattedDate = useMemo(
    () => formatLocalDate(plan.date),
    [plan.date]
  );

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
