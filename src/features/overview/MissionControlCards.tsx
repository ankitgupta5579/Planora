import React from 'react';
import { EventPlan } from '../../types/event';
import {
  BudgetMetrics,
  TimelineProgress,
  VendorFinancials,
  GuestStats,
} from '../../utils/eventCalculators';
import { DollarSign, CheckCircle2, TrendingUp, Users, ArrowRight } from 'lucide-react';

export interface MissionControlCardsProps {
  plan: EventPlan;
  budgetMetrics: BudgetMetrics;
  timelineProgress: TimelineProgress;
  vendorFinancials: VendorFinancials;
  guestStats: GuestStats;
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
}

/**
 * 4 interactive mission control metric cards directing user to respective functional workspaces.
 */
export const MissionControlCards: React.FC<MissionControlCardsProps> = ({
  plan,
  budgetMetrics,
  timelineProgress,
  vendorFinancials,
  guestStats,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Budget */}
      <button
        type="button"
        onClick={() => onNavigateTab('budget')}
        className="text-left w-full p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Budget Spent</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {plan.currency}
          {budgetMetrics.totalSpent.toLocaleString()}
          <span className="text-xs font-normal text-slate-400 ml-1.5">
            / {plan.currency}
            {budgetMetrics.totalBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${budgetMetrics.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, budgetMetrics.spendPercentage)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{budgetMetrics.spendPercentage}% utilized</span>
          <span
            className={
              budgetMetrics.remainingCash < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'
            }
          >
            {budgetMetrics.remainingCash >= 0
              ? `${plan.currency}${budgetMetrics.remainingCash.toLocaleString()} left`
              : 'Over budget'}
          </span>
        </div>
      </button>

      {/* Metric 2: Milestones Progress */}
      <button
        type="button"
        onClick={() => onNavigateTab('timeline')}
        className="text-left w-full p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Milestones</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {timelineProgress.completed}
          <span className="text-xs font-normal text-slate-400 ml-1.5">
            / {timelineProgress.total} completed
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${timelineProgress.percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{timelineProgress.percentage}% prepared</span>
          <span className="text-indigo-400 flex items-center gap-1">
            View Schedule <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </button>

      {/* Metric 3: Vendors */}
      <button
        type="button"
        onClick={() => onNavigateTab('vendors')}
        className="text-left w-full p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Vendors & Team</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {vendorFinancials.bookedCount}
          <span className="text-xs font-normal text-slate-400 ml-1.5">
            / {vendorFinancials.totalCount} booked or signed
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Deposits paid: {plan.currency}
          {vendorFinancials.totalDepositsPaid.toLocaleString()}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Bal: {plan.currency}
            {vendorFinancials.totalRemainingBalance.toLocaleString()}
          </span>
          <span className="text-purple-400 flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </button>

      {/* Metric 4: Guests & RSVPs */}
      <button
        type="button"
        onClick={() => onNavigateTab('guests')}
        className="text-left w-full p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">RSVP Attendance</span>
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {guestStats.totalHeadcount}
          <span className="text-xs font-normal text-slate-400 ml-1.5">
            Confirmed headcount (people)
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          {guestStats.totalAttending} parties attending • {guestStats.totalPending} pending
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Target: {plan.guestCount} guests</span>
          <span className="text-pink-400 flex items-center gap-1">
            Guestlist <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </button>
    </div>
  );
};
