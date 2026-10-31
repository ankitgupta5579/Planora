import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetMetrics,
  rebalanceBudgetItems,
  calculateTimelineProgress,
  calculateVendorFinancials,
  calculateGuestStats,
  calculateDaysRemaining,
  getBudgetItemVariance,
  calculateUncommittedCash,
  calculateOutstandingVendorBalances,
} from './eventCalculators';
import { BudgetItem, TimelineItem, VendorItem, GuestItem } from '../types/event';

test('calculateBudgetMetrics correctly computes totals, balances, and percentages', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'venue',
      title: 'Main Hall',
      allocatedAmount: 5000,
      actualAmount: 4800,
      isPaid: true,
    },
    {
      id: '2',
      category: 'catering',
      title: 'Buffet Dinner',
      allocatedAmount: 3000,
      actualAmount: 3200,
      isPaid: false,
    },
    {
      id: '3',
      category: 'decor',
      title: 'Floral Arrangements',
      allocatedAmount: 1000,
      actualAmount: 800,
      isPaid: true,
    },
  ];
  const totalBudget = 10000;
  const metrics = calculateBudgetMetrics(items, totalBudget);

  assert.equal(metrics.totalBudget, 10000);
  assert.equal(metrics.totalAllocated, 9000);
  assert.equal(metrics.totalSpent, 8800);
  assert.equal(metrics.unallocated, 1000);
  assert.equal(metrics.remainingCash, 1200);
  assert.equal(metrics.spendPercentage, 88);
  assert.equal(metrics.allocatedPercentage, 90);
  assert.equal(metrics.isOverBudget, false);
  assert.equal(metrics.categoryBreakdown['venue'].allocated, 5000);
  assert.equal(metrics.categoryBreakdown['venue'].actual, 4800);
});

test('calculateBudgetMetrics flags over budget when expenses exceed total cap', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'venue',
      title: 'Resort',
      allocatedAmount: 6000,
      actualAmount: 6500,
      isPaid: true,
    },
  ];
  const totalBudget = 5000;
  const metrics = calculateBudgetMetrics(items, totalBudget);

  assert.equal(metrics.isOverBudget, true);
  assert.equal(metrics.remainingCash, -1500);
  assert.equal(metrics.unallocated, 0);
});

test('rebalanceBudgetItems proportionally fits items into new target budget', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'venue',
      title: 'Hall',
      allocatedAmount: 4000,
      actualAmount: 0,
      isPaid: false,
    },
    {
      id: '2',
      category: 'catering',
      title: 'Food',
      allocatedAmount: 6000,
      actualAmount: 0,
      isPaid: false,
    },
  ]; // Total 10,000
  const newBudget = 5000; // Half
  const rebalanced = rebalanceBudgetItems(items, newBudget);

  assert.equal(rebalanced[0].allocatedAmount, 2000);
  assert.equal(rebalanced[1].allocatedAmount, 3000);
});

test('calculateTimelineProgress calculates overall and per-phase progress', () => {
  const items: TimelineItem[] = [
    { id: '1', phase: 'planning_early', title: 'Book Venue', description: '', completed: true },
    { id: '2', phase: 'planning_early', title: 'Set Date', description: '', completed: true },
    { id: '3', phase: 'planning_mid', title: 'Send Invites', description: '', completed: false },
    { id: '4', phase: 'day_of', title: 'Soundcheck', description: '', completed: false },
  ];
  const progress = calculateTimelineProgress(items);

  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 2);
  assert.equal(progress.percentage, 50);
  assert.equal(progress.byPhase['planning_early'].completed, 2);
  assert.equal(progress.byPhase['planning_early'].total, 2);
  assert.equal(progress.byPhase['planning_mid'].completed, 0);
  assert.equal(progress.byPhase['planning_mid'].total, 1);
});

test('calculateVendorFinancials aggregates quotes, deposits, and balances', () => {
  const vendors: VendorItem[] = [
    {
      id: 'v1',
      category: 'Catering',
      name: 'Gourmet Chefs',
      quoteAmount: 4000,
      depositPaid: 1500,
      status: 'contract_signed',
      checklist: ['Tasting', 'Menu finalized'],
    },
    {
      id: 'v2',
      category: 'Photography',
      name: 'Lens Magic',
      quoteAmount: 2500,
      depositPaid: 500,
      status: 'booked',
      checklist: ['Shot list'],
    },
    {
      id: 'v3',
      category: 'Music',
      name: 'DJ Spark',
      quoteAmount: 1200,
      depositPaid: 0,
      status: 'contacted',
      checklist: [],
    },
  ];
  const financials = calculateVendorFinancials(vendors);

  assert.equal(financials.totalQuotes, 7700);
  assert.equal(financials.totalDepositsPaid, 2000);
  assert.equal(financials.totalRemainingBalance, 5700);
  assert.equal(financials.bookedCount, 2);
  assert.equal(financials.totalCount, 3);
});

test('calculateGuestStats accurately tabulates headcount with plus-ones and dietary preferences', () => {
  const guests: GuestItem[] = [
    {
      id: 'g1',
      name: 'Alice',
      rsvpStatus: 'attending',
      plusOnes: 1,
      dietaryRestrictions: 'Vegetarian',
      group: 'friends',
    },
    {
      id: 'g2',
      name: 'Bob',
      rsvpStatus: 'attending',
      plusOnes: 0,
      dietaryRestrictions: 'Vegan',
      group: 'family',
    },
    {
      id: 'g3',
      name: 'Charlie',
      rsvpStatus: 'declined',
      plusOnes: 2,
      dietaryRestrictions: 'Gluten-Free',
      group: 'colleagues',
    },
    {
      id: 'g4',
      name: 'Dana',
      rsvpStatus: 'pending',
      plusOnes: 0,
      dietaryRestrictions: 'vegetarian',
      group: 'friends',
    },
    {
      id: 'g5',
      name: 'Evan',
      rsvpStatus: 'attending',
      plusOnes: 0,
      dietaryRestrictions: 'None',
      group: 'friends',
    },
  ];
  const stats = calculateGuestStats(guests);

  assert.equal(stats.totalInvited, 5);
  assert.equal(stats.totalAttending, 3);
  assert.equal(stats.totalDeclined, 1);
  assert.equal(stats.totalPending, 1);
  // Headcount: Alice(1+1) + Bob(1+0) + Evan(1+0) = 4
  assert.equal(stats.totalHeadcount, 4);
  assert.equal(stats.dietaryCounts['vegetarian'], 2);
  assert.equal(stats.dietaryCounts['vegan'], 1);
  assert.equal(stats.dietaryCounts['none'], undefined);
});

test('calculateDaysRemaining returns correct difference', () => {
  const base = new Date('2026-11-01T12:00:00Z');
  const target = '2026-11-11T12:00:00Z';
  const days = calculateDaysRemaining(target, base);
  assert.equal(days, 10);
});

test('getBudgetItemVariance: deposit-paid item is balance_due and NOT under', () => {
  const depositPaidItem: BudgetItem = {
    id: 'b-deposit',
    category: 'catering',
    title: 'Catering 50% deposit',
    allocatedAmount: 8000,
    actualAmount: 4000,
    isPaid: false,
  };
  const variance = getBudgetItemVariance(depositPaidItem);
  assert.equal(variance.status, 'balance_due');
  assert.notEqual(variance.status, 'under');
  assert.equal(variance.amount, 4000);
  assert.equal(variance.label, 'Balance due');
});

test('getBudgetItemVariance: fully paid under/over/on-target semantics', () => {
  // Fully paid under
  const fullyPaidUnder: BudgetItem = {
    id: 'b-under',
    category: 'favors',
    title: 'Favors completed under budget',
    allocatedAmount: 600,
    actualAmount: 450,
    isPaid: true,
  };
  const vUnder = getBudgetItemVariance(fullyPaidUnder);
  assert.equal(vUnder.status, 'under');
  assert.equal(vUnder.amount, 150);
  assert.equal(vUnder.label, 'Under by');

  // Over budget
  const overBudget: BudgetItem = {
    id: 'b-over',
    category: 'decor',
    title: 'Floral arches extra order',
    allocatedAmount: 2000,
    actualAmount: 2400,
    isPaid: true,
  };
  const vOver = getBudgetItemVariance(overBudget);
  assert.equal(vOver.status, 'over');
  assert.equal(vOver.amount, 400);
  assert.equal(vOver.label, 'Over by');

  // On target
  const onTarget: BudgetItem = {
    id: 'b-exact',
    category: 'venue',
    title: 'Exact hall rental',
    allocatedAmount: 5000,
    actualAmount: 5000,
    isPaid: true,
  };
  const vTarget = getBudgetItemVariance(onTarget);
  assert.equal(vTarget.status, 'on_target');
  assert.equal(vTarget.amount, 0);
  assert.equal(vTarget.label, 'On target ($0)');
});

test('calculateUncommittedCash: zero, partial and overcommitted vendor balance cases', () => {
  // 1. Zero vendor balances case
  const eventZero = {
    totalBudget: 10000,
    budgetItems: [
      {
        id: '1',
        category: 'venue' as const,
        title: 'Hall',
        allocatedAmount: 4000,
        actualAmount: 4000,
        isPaid: true,
      },
    ],
    vendors: [
      {
        id: 'v1',
        category: 'Venue',
        name: 'Grand Hall',
        quoteAmount: 4000,
        depositPaid: 4000,
        status: 'contract_signed' as const,
        checklist: [],
      },
    ],
  };
  assert.equal(calculateOutstandingVendorBalances(eventZero.vendors), 0);
  assert.equal(calculateUncommittedCash(eventZero), 6000);

  // 2. Partial vendor balances case (sample wedding test)
  const eventPartial = {
    totalBudget: 28000,
    budgetItems: [
      {
        id: 'b1',
        category: 'venue' as const,
        title: 'Pavilion',
        allocatedAmount: 7500,
        actualAmount: 7500,
        isPaid: true,
      },
      {
        id: 'b2',
        category: 'catering' as const,
        title: 'Catering',
        allocatedAmount: 8500,
        actualAmount: 4250,
        isPaid: false,
      },
      {
        id: 'b3',
        category: 'photography' as const,
        title: 'Photo',
        allocatedAmount: 3400,
        actualAmount: 3400,
        isPaid: true,
      },
      {
        id: 'b4',
        category: 'decor' as const,
        title: 'Decor',
        allocatedAmount: 2800,
        actualAmount: 1400,
        isPaid: false,
      },
      {
        id: 'b5',
        category: 'entertainment' as const,
        title: 'Music',
        allocatedAmount: 2200,
        actualAmount: 1100,
        isPaid: false,
      },
      {
        id: 'b6',
        category: 'favors' as const,
        title: 'Favors',
        allocatedAmount: 600,
        actualAmount: 550,
        isPaid: true,
      },
      {
        id: 'b7',
        category: 'logistics' as const,
        title: 'Shuttles',
        allocatedAmount: 1000,
        actualAmount: 0,
        isPaid: false,
      },
      {
        id: 'b8',
        category: 'contingency' as const,
        title: 'Emergency',
        allocatedAmount: 2000,
        actualAmount: 300,
        isPaid: false,
      },
    ],
    vendors: [
      {
        id: 'v1',
        category: 'Venue',
        name: 'Pavilion',
        quoteAmount: 7500,
        depositPaid: 7500,
        status: 'contract_signed' as const,
        checklist: [],
      },
      {
        id: 'v2',
        category: 'Catering',
        name: 'Catering',
        quoteAmount: 8500,
        depositPaid: 4250,
        status: 'booked' as const,
        checklist: [],
      },
      {
        id: 'v3',
        category: 'Photo',
        name: 'Photo',
        quoteAmount: 3400,
        depositPaid: 3400,
        status: 'contract_signed' as const,
        checklist: [],
      },
      {
        id: 'v4',
        category: 'Florist',
        name: 'Florist',
        quoteAmount: 2800,
        depositPaid: 1400,
        status: 'booked' as const,
        checklist: [],
      },
      {
        id: 'v5',
        category: 'DJ',
        name: 'DJ',
        quoteAmount: 2200,
        depositPaid: 1100,
        status: 'booked' as const,
        checklist: [],
      },
      {
        id: 'v6',
        category: 'Transit',
        name: 'Shuttles',
        quoteAmount: 1000,
        depositPaid: 0,
        status: 'contacted' as const,
        checklist: [],
      },
    ],
  };
  // totalSpent = 18500, outstanding = 7750, uncommitted = 28000 - 18500 - 7750 = 1750
  assert.equal(calculateOutstandingVendorBalances(eventPartial.vendors), 7750);
  assert.equal(calculateUncommittedCash(eventPartial), 1750);

  // 3. Overcommitted case: balances + spent exceed total budget -> returns negative number
  const eventOver = {
    totalBudget: 20000,
    budgetItems: [
      {
        id: '1',
        category: 'venue' as const,
        title: 'Hall',
        allocatedAmount: 10000,
        actualAmount: 14000,
        isPaid: false,
      },
    ],
    vendors: [
      {
        id: 'v1',
        category: 'Venue',
        name: 'Hall',
        quoteAmount: 14000,
        depositPaid: 5000,
        status: 'booked' as const,
        checklist: [],
      },
    ],
  };
  // totalSpent = 14000, outstanding = 9000, uncommitted = 20000 - 14000 - 9000 = -3000
  assert.equal(calculateOutstandingVendorBalances(eventOver.vendors), 9000);
  const uncommitted = calculateUncommittedCash(eventOver);
  assert.equal(uncommitted, -3000);
  assert.equal(uncommitted < 0, true);
});
