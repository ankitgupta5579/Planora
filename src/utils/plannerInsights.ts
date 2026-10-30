import { EventPlan } from '../types/event';
import {
  calculateDaysRemaining,
  calculateBudgetMetrics,
  calculateGuestStats,
  calculateVendorFinancials,
} from './eventCalculators';

export type PlannerInsightSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface PlannerInsight {
  id: string;
  severity: PlannerInsightSeverity;
  title: string;
  message: string;
  action?: {
    label: string;
    tab: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests';
  };
}

export const BUDGET_WARNING_THRESHOLD_PCT = 85;
export const CONTINGENCY_DRAWDOWN_THRESHOLD_PCT = 50;
export const CONTINGENCY_WARNING_DAYS_AHEAD = 30;
export const GUEST_RESPONSE_MIN_HEADCOUNT_PCT = 25;
export const GUEST_RESPONSE_WARNING_DAYS_AHEAD = 45;
export const VENDOR_RESEARCH_WARNING_DAYS_AHEAD = 30;
export const DAY_OF_CRITICAL_DAYS_AHEAD = 7;
export const MAX_INSIGHTS_DISPLAYED = 5;

const SEVERITY_ORDER: Record<PlannerInsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
};

export function generatePlannerInsights(event: EventPlan, today: Date = new Date()): PlannerInsight[] {
  const insights: PlannerInsight[] = [];
  const daysRemaining = calculateDaysRemaining(event.date, today);
  const currency = event.currency || '$';

  // Calculators
  const budgetMetrics = calculateBudgetMetrics(event.budgetItems || [], event.totalBudget || 0);
  const guestStats = calculateGuestStats(event.guests || []);
  const vendorFin = calculateVendorFinancials(event.vendors || []);

  // 1. Event Passed
  if (daysRemaining < 0) {
    if (vendorFin.totalRemainingBalance > 0) {
      insights.push({
        id: 'insight-post-vendor-balance',
        severity: 'warning',
        title: 'Post-Event Vendor Balances Remaining',
        message: `${currency}${vendorFin.totalRemainingBalance.toLocaleString()} remains unpaid across vendor contracts following the event date.`,
        action: { label: 'Review Balances', tab: 'vendors' },
      });
    }

    insights.push({
      id: 'insight-event-concluded',
      severity: 'info',
      title: 'Event Successfully Concluded',
      message: `The event took place ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago. Finalize accounting records or export the summary.`,
      action: { label: 'View Summary', tab: 'budget' },
    });

    return insights.slice(0, MAX_INSIGHTS_DISPLAYED);
  }

  // 2. Day-Of Event
  if (daysRemaining === 0) {
    const incompleteDayOf = (event.timelineItems || []).filter(
      (t) => t.phase === 'day_of' && !t.completed
    );

    if (incompleteDayOf.length > 0) {
      insights.push({
        id: 'insight-day-of-incomplete',
        severity: 'warning',
        title: 'Day-Of Schedule Milestones Pending',
        message: `${incompleteDayOf.length} day-of milestone${incompleteDayOf.length === 1 ? '' : 's'} remain incomplete for today's run of show.`,
        action: { label: 'View Schedule', tab: 'timeline' },
      });
    }

    insights.push({
      id: 'insight-day-of-celebration',
      severity: 'success',
      title: 'Today is Celebration Day!',
      message: 'All preparations converge today. Confirm vendor arrivals and guide your guests through a memorable experience.',
      action: { label: 'Day-Of Schedule', tab: 'timeline' },
    });

    return insights.slice(0, MAX_INSIGHTS_DISPLAYED);
  }

  // 3. Active Event Checks (daysRemaining > 0)

  // 3a. Total Budget Overflow
  if (event.totalBudget > 0 && budgetMetrics.totalSpent > event.totalBudget) {
    const overage = budgetMetrics.totalSpent - event.totalBudget;
    insights.push({
      id: 'insight-budget-overflow',
      severity: 'critical',
      title: 'Total Budget Cap Exceeded',
      message: `Actual expenses (${currency}${budgetMetrics.totalSpent.toLocaleString()}) exceed your total budget cap of ${currency}${event.totalBudget.toLocaleString()} by ${currency}${overage.toLocaleString()}.`,
      action: { label: 'Review Overruns', tab: 'budget' },
    });
  } else if (
    event.totalBudget > 0 &&
    budgetMetrics.spendPercentage >= BUDGET_WARNING_THRESHOLD_PCT &&
    daysRemaining <= 30
  ) {
    insights.push({
      id: 'insight-budget-pace-warning',
      severity: 'warning',
      title: 'High Budget Utilization Pace',
      message: `${budgetMetrics.spendPercentage}% of total budget (${currency}${budgetMetrics.totalSpent.toLocaleString()}) is spent with ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left.`,
      action: { label: 'Audit Expenses', tab: 'budget' },
    });
  }

  // 3b. Over-Allocation or Under-Allocation
  if (event.totalBudget > 0 && budgetMetrics.totalAllocated !== event.totalBudget) {
    const delta = Math.abs(budgetMetrics.totalAllocated - event.totalBudget);
    if (budgetMetrics.totalAllocated > event.totalBudget) {
      insights.push({
        id: 'insight-over-allocated',
        severity: 'warning',
        title: 'Allocations Exceed Budget Ceiling',
        message: `Allocated line items exceed your total budget by ${currency}${delta.toLocaleString()}. Auto-rebalance items to fit within the ceiling.`,
        action: { label: 'Rebalance Budget', tab: 'budget' },
      });
    } else {
      insights.push({
        id: 'insight-under-allocated',
        severity: 'info',
        title: 'Unallocated Budget Reserve',
        message: `${currency}${delta.toLocaleString()} of total budget remains unallocated. Assign this buffer to key vendor categories.`,
        action: { label: 'Allocate Funds', tab: 'budget' },
      });
    }
  }

  // 3c. Contingency Drawdown Check
  const contingencyItem = (event.budgetItems || []).find((b) => b.category === 'contingency');
  if (contingencyItem && contingencyItem.allocatedAmount > 0) {
    const drawdownPct = Math.round((contingencyItem.actualAmount / contingencyItem.allocatedAmount) * 100);
    if (drawdownPct >= CONTINGENCY_DRAWDOWN_THRESHOLD_PCT && daysRemaining >= CONTINGENCY_WARNING_DAYS_AHEAD) {
      insights.push({
        id: 'insight-contingency-drawdown',
        severity: 'warning',
        title: 'Early Contingency Drawdown',
        message: `Emergency reserve is ${drawdownPct}% utilized (${currency}${contingencyItem.actualAmount.toLocaleString()}) with ${daysRemaining} days still remaining.`,
        action: { label: 'Inspect Contingency', tab: 'budget' },
      });
    }
  }

  // 3d. Guest Response Rate Check
  if (event.guestCount > 0 && daysRemaining <= GUEST_RESPONSE_WARNING_DAYS_AHEAD) {
    const confirmedPct = Math.round((guestStats.totalHeadcount / event.guestCount) * 100);
    if (confirmedPct < GUEST_RESPONSE_MIN_HEADCOUNT_PCT) {
      insights.push({
        id: 'insight-guest-response-lag',
        severity: 'warning',
        title: 'Low Confirmed RSVP Headcount',
        message: `Only ${guestStats.totalHeadcount} of ${event.guestCount} target attendees (${confirmedPct}%) are confirmed with ${daysRemaining} days remaining.`,
        action: { label: 'Follow Up RSVPs', tab: 'guests' },
      });
    }
  }

  // 3e. Unbooked Vendors with <= 30 Days Left
  if (daysRemaining <= VENDOR_RESEARCH_WARNING_DAYS_AHEAD) {
    const unbooked = (event.vendors || []).filter(
      (v) => v.status === 'researching' || v.status === 'contacted'
    );
    if (unbooked.length > 0) {
      const names = unbooked.map((v) => v.name).slice(0, 3).join(', ');
      insights.push({
        id: 'insight-unbooked-vendors',
        severity: 'warning',
        title: 'Unbooked Vendor Services',
        message: `${unbooked.length} vendor${unbooked.length === 1 ? '' : 's'} (${names}) remain uncontracted with ${daysRemaining} days to go.`,
        action: { label: 'Finalize Vendors', tab: 'vendors' },
      });
    }
  }

  // 3f. Outstanding Vendor Balances Info
  if (vendorFin.totalRemainingBalance > 0) {
    insights.push({
      id: 'insight-vendor-balance-due',
      severity: 'info',
      title: 'Outstanding Vendor Balances',
      message: `${currency}${vendorFin.totalRemainingBalance.toLocaleString()} in remaining vendor payments is due prior to event commencement.`,
      action: { label: 'View Payments', tab: 'vendors' },
    });
  }

  // 3g. Timeline Schedule Checks
  if (daysRemaining <= DAY_OF_CRITICAL_DAYS_AHEAD) {
    const incompleteDayOf = (event.timelineItems || []).filter(
      (t) => t.phase === 'day_of' && !t.completed
    );
    if (incompleteDayOf.length > 0) {
      insights.push({
        id: 'insight-day-of-incomplete-near',
        severity: 'warning',
        title: 'Day-Of Run of Show Incomplete',
        message: `${incompleteDayOf.length} day-of milestone${incompleteDayOf.length === 1 ? '' : 's'} remain incomplete with only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left.`,
        action: { label: 'Review Run of Show', tab: 'timeline' },
      });
    }
  } else if (daysRemaining <= 14) {
    const incompleteEarly = (event.timelineItems || []).filter(
      (t) => (t.phase === 'planning_early' || t.phase === 'planning_mid') && !t.completed
    );
    if (incompleteEarly.length > 0) {
      insights.push({
        id: 'insight-overdue-milestones',
        severity: 'warning',
        title: 'Overdue Early Planning Milestones',
        message: `${incompleteEarly.length} earlier phase milestone${incompleteEarly.length === 1 ? '' : 's'} remain open 2 weeks prior to event.`,
        action: { label: 'Catch Up Milestones', tab: 'timeline' },
      });
    }
  }

  // 4. Fallback Success Insight if no critical or warning was triggered
  const hasAlert = insights.some((i) => i.severity === 'critical' || i.severity === 'warning');
  if (!hasAlert) {
    insights.push({
      id: 'insight-on-track',
      severity: 'success',
      title: 'Celebration Planning on Track',
      message: `Your budget pacing and milestone progress are healthy for ${daysRemaining} days remaining.`,
      action: { label: 'Explore Ideas', tab: 'ideas' },
    });
  }

  // Sort by severity (critical first) and cap
  return insights
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, MAX_INSIGHTS_DISPLAYED);
}
