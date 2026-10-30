import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { PlannerInsights } from './PlannerInsights';
import { 
  calculateBudgetMetrics, 
  calculateTimelineProgress, 
  calculateVendorFinancials, 
  calculateGuestStats,
  calculateDaysRemaining,
  formatLocalDate,
} from '../utils/eventCalculators';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface EventOverviewTabProps {
  plan: EventPlan;
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
  onOpenAiChat: () => void;
  onOpenSpeechModal: () => void;
}

export const EventOverviewTab: React.FC<EventOverviewTabProps> = ({
  plan,
  onNavigateTab,
  onOpenAiChat,
  onOpenSpeechModal,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const budgetMetrics = calculateBudgetMetrics(plan.budgetItems, plan.totalBudget);
  const timelineProgress = calculateTimelineProgress(plan.timelineItems);
  const vendorFinancials = calculateVendorFinancials(plan.vendors);
  const guestStats = calculateGuestStats(plan.guests);
  const daysLeft = calculateDaysRemaining(plan.date);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const getVibeBadgeColor = (vibe: string) => {
    switch (vibe) {
      case 'elegant': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'bohemian': return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      case 'rustic': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'festive': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'modern': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default: return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    }
  };

  const upcomingTasks = plan.timelineItems.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full border ${getVibeBadgeColor(plan.vibe)}`}>
                {plan.vibe} Vibe
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {plan.type}
              </span>
              {daysLeft > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysLeft} days to go
                </span>
              ) : daysLeft === 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-900 animate-bounce">
                  🎉 Event is Today!
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-400">
                  Event Concluded
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {plan.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  {formatLocalDate(plan.date, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span>{plan.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{plan.guestCount} guests planned</span>
              </div>
            </div>
          </div>

          {/* Quick AI Action Card */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={onOpenAiChat}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ask AI Planner</span>
            </button>
            <button
              onClick={onOpenSpeechModal}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-pink-400" />
              <span>Invites & Speeches</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Mission Control Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget */}
        <div 
          onClick={() => onNavigateTab('budget')}
          className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Budget Spent</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {plan.currency}{budgetMetrics.totalSpent.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {plan.currency}{budgetMetrics.totalBudget.toLocaleString()}
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
            <span className={budgetMetrics.remainingCash < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              {budgetMetrics.remainingCash >= 0 ? `${plan.currency}${budgetMetrics.remainingCash.toLocaleString()} left` : 'Over budget'}
            </span>
          </div>
        </div>

        {/* Metric 2: Milestones Progress */}
        <div 
          onClick={() => onNavigateTab('timeline')}
          className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
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
        </div>

        {/* Metric 3: Vendors */}
        <div 
          onClick={() => onNavigateTab('vendors')}
          className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
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
              / {vendorFinancials.totalCount} locked
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Deposits paid: {plan.currency}{vendorFinancials.totalDepositsPaid.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bal: {plan.currency}{vendorFinancials.totalRemainingBalance.toLocaleString()}</span>
            <span className="text-purple-400 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Guests & RSVPs */}
        <div 
          onClick={() => onNavigateTab('guests')}
          className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-sm"
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
              headcount confirmed
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            {guestStats.totalAttending} attending • {guestStats.totalPending} pending
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target: {plan.guestCount} guests</span>
            <span className="text-pink-400 flex items-center gap-1">
              Guestlist <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Planner Insights Card */}
      <PlannerInsights plan={plan} onNavigateTab={onNavigateTab} />

      {/* Two Column Layout: Theme & Palette / Upcoming Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Creative Vision & Palette */}
        <div className="lg:col-span-2 space-y-6">
          {/* Creative Vision Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Creative Concept & Event Vision
              </h2>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Explore Ideas ({plan.ideas.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-800/40 p-4 rounded-xl border-l-2 border-indigo-500">
              "{plan.themeDescription}"
            </p>

            {/* Color Palette */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Curated Color Story
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {plan.colorPalette.map((color, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => copyToClipboard(color.hex)}
                    title={`Click to copy ${color.hex}`}
                    aria-label={`Copy color ${color.name} hex code ${color.hex}`}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-500 transition cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div 
                      className="w-full h-10 rounded-lg shadow-inner mb-2 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-xs font-semibold text-slate-200 truncate">{color.name}</div>
                    <div className="flex items-center justify-between text-xs text-slate-200 font-mono">
                      <span>{color.hex}</span>
                      {copiedHex === color.hex ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Idea Highlights */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Signature Touch Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.ideas.slice(0, 2).map((idea) => (
                <div key={idea.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-semibold text-indigo-200">{idea.title}</div>
                  <p className="text-xs text-slate-300 line-clamp-2">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Milestones & Quick Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Upcoming Milestones
              </h2>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Full Schedule
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-300 text-sm">
                🎉 All scheduled milestones are completed!
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{task.title}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-200 font-mono">
                        {task.timeLabel || task.phase}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{task.description}</p>
                    {task.assignedTo && (
                      <div className="text-xs text-indigo-300 font-medium pt-1">
                        Assigned: {task.assignedTo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Helper Tools */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Smart Planning Assistant</span>
            </div>
            <p className="text-xs text-slate-300">
              Need vendor contracts checked, dietary menu ideas, or a run-of-show speech?
            </p>
            <button
              onClick={onOpenAiChat}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Ask Event AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
