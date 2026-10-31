import test from 'node:test';
import assert from 'node:assert';
import {
  calculateBudgetMetrics,
  calculateTimelineProgress,
  calculateVendorFinancials,
  calculateGuestStats,
  getBudgetItemVariance,
} from '../utils/eventCalculators';
import { BudgetItem, TimelineItem, VendorItem, GuestItem } from '../types/event';

test('features/budget: calculates variance and budget item statuses accurately', () => {
  const itemUnder: BudgetItem = {
    id: 'b-1',
    category: 'venue',
    title: 'Main Hall',
    allocatedAmount: 5000,
    actualAmount: 4200,
    isPaid: true,
  };
  const varianceUnder = getBudgetItemVariance(itemUnder);
  assert.strictEqual(varianceUnder.status, 'under');
  assert.strictEqual(varianceUnder.amount, 800);

  const itemBalanceDue: BudgetItem = {
    id: 'b-2',
    category: 'catering',
    title: 'Dinner Buffet',
    allocatedAmount: 6000,
    actualAmount: 2000,
    isPaid: false,
  };
  const varianceBalance = getBudgetItemVariance(itemBalanceDue);
  assert.strictEqual(varianceBalance.status, 'balance_due');
  assert.strictEqual(varianceBalance.amount, 4000);

  const itemOver: BudgetItem = {
    id: 'b-3',
    category: 'decor',
    title: 'Floral Arches',
    allocatedAmount: 1500,
    actualAmount: 1900,
    isPaid: true,
  };
  const varianceOver = getBudgetItemVariance(itemOver);
  assert.strictEqual(varianceOver.status, 'over');
  assert.strictEqual(varianceOver.amount, 400);

  const metrics = calculateBudgetMetrics([itemUnder, itemBalanceDue, itemOver], 15000);
  assert.strictEqual(metrics.totalAllocated, 12500);
  assert.strictEqual(metrics.totalSpent, 8100);
  assert.strictEqual(metrics.remainingCash, 6900);
  assert.strictEqual(metrics.isOverBudget, false);
});

test('features/timeline: calculates chronological milestone progress by phase', () => {
  const items: TimelineItem[] = [
    {
      id: 't-1',
      phase: 'planning_early',
      timeLabel: '3 Months Out',
      title: 'Book Venue',
      description: 'Sign contract and pay deposit',
      completed: true,
    },
    {
      id: 't-2',
      phase: 'planning_mid',
      timeLabel: '1 Month Out',
      title: 'Send Invitations',
      description: 'Mail RSVP cards',
      completed: false,
    },
    {
      id: 't-3',
      phase: 'day_of',
      timeLabel: '10:00 AM',
      title: 'Vendor Load-in',
      description: 'Floral delivery and setup',
      completed: false,
    },
  ];

  const progress = calculateTimelineProgress(items);
  assert.strictEqual(progress.total, 3);
  assert.strictEqual(progress.completed, 1);
  assert.strictEqual(progress.percentage, 33);
  assert.strictEqual(progress.byPhase['planning_early'].completed, 1);
  assert.strictEqual(progress.byPhase['planning_mid'].completed, 0);
});

test('features/vendors: computes quotes, deposits paid, and remaining liabilities', () => {
  const vendors: VendorItem[] = [
    {
      id: 'v-1',
      category: 'photography',
      name: 'Lens & Light',
      contactName: 'Sarah',
      email: 'sarah@example.com',
      phone: '555-0101',
      quoteAmount: 3500,
      depositPaid: 1000,
      status: 'contract_signed',
      notes: 'Includes engagement session',
      checklist: ['Sign contract', 'Pay deposit'],
    },
    {
      id: 'v-2',
      category: 'music',
      name: 'Vinyl DJ Collective',
      contactName: 'DJ Marcus',
      email: 'marcus@example.com',
      phone: '555-0102',
      quoteAmount: 2000,
      depositPaid: 500,
      status: 'booked',
      notes: 'Full sound setup',
      checklist: ['Final playlist'],
    },
    {
      id: 'v-3',
      category: 'catering',
      name: 'Farm to Fork Bistro',
      contactName: 'Chef Pierre',
      email: 'pierre@example.com',
      phone: '555-0103',
      quoteAmount: 8000,
      depositPaid: 0,
      status: 'contacted',
      notes: 'Tasting scheduled',
      checklist: ['Menu tasting'],
    },
  ];

  const financials = calculateVendorFinancials(vendors);
  assert.strictEqual(financials.totalQuotes, 13500);
  assert.strictEqual(financials.totalDepositsPaid, 1500);
  assert.strictEqual(financials.totalRemainingBalance, 12000);
  assert.strictEqual(financials.bookedCount, 2);
  assert.strictEqual(financials.totalCount, 3);
});

test('features/guests: calculates headcounts with plus-ones and dietary restrictions', () => {
  const guests: GuestItem[] = [
    {
      id: 'g-1',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      group: 'family',
      rsvpStatus: 'attending',
      plusOnes: 1,
      tableNumber: 'Table 1',
      dietaryRestrictions: 'Vegetarian',
    },
    {
      id: 'g-2',
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      group: 'friends',
      rsvpStatus: 'attending',
      plusOnes: 0,
      tableNumber: 'Table 1',
      dietaryRestrictions: 'Gluten-Free',
    },
    {
      id: 'g-3',
      name: 'Chloe Bennett',
      email: 'chloe@example.com',
      group: 'friends',
      rsvpStatus: 'declined',
      plusOnes: 0,
    },
    {
      id: 'g-4',
      name: 'David Kim',
      email: 'david@example.com',
      group: 'colleagues',
      rsvpStatus: 'pending',
      plusOnes: 1,
    },
  ];

  const stats = calculateGuestStats(guests);
  assert.strictEqual(stats.totalInvited, 4);
  assert.strictEqual(stats.totalAttending, 2);
  assert.strictEqual(stats.totalDeclined, 1);
  assert.strictEqual(stats.totalPending, 1);
  assert.strictEqual(stats.totalPlusOnes, 1);
  assert.strictEqual(stats.totalHeadcount, 3); // 2 attending + 1 plusOne
  assert.strictEqual(stats.dietaryCounts['vegetarian'], 1);
  assert.strictEqual(stats.dietaryCounts['gluten-free'], 1);
});
