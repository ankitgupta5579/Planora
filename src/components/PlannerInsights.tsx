import React from 'react';
import { EventPlan } from '../types/event';
import {
  generatePlannerInsights,
  PlannerInsight,
  PlannerInsightSeverity,
} from '../utils/plannerInsights';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

interface PlannerInsightsProps {
  plan: EventPlan;
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
  today?: Date;
}

const SEVERITY_CONFIG: Record<
  PlannerInsightSeverity,
  {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    iconColor: string;
  }
> = {
  critical: {
    border: 'border-rose-500/40',
    bg: 'bg-rose-950/20',
    badgeBg: 'bg-rose-500/20 border-rose-500/40',
    badgeText: 'text-rose-300',
    badgeLabel: 'Critical',
    icon: AlertCircle,
    iconColor: 'text-rose-400',
  },
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    badgeBg: 'bg-amber-500/20 border-amber-500/40',
    badgeText: 'text-amber-300',
    badgeLabel: 'Attention',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  info: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/20',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40',
    badgeText: 'text-cyan-300',
    badgeLabel: 'Notice',
    icon: Info,
    iconColor: 'text-cyan-400',
  },
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    badgeLabel: 'On Track',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
};

export const PlannerInsights: React.FC<PlannerInsightsProps> = ({
  plan,
  onNavigateTab,
  today,
}) => {
  const insights = generatePlannerInsights(plan, today);

  if (insights.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="planner-insights-heading"
      className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Lightbulb className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="planner-insights-heading"
              className="text-base font-bold text-white flex items-center gap-2"
            >
              <span>Planner Insights</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {insights.length}
              </span>
            </h2>
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Proactive recommendations based on current plan status
        </span>
      </div>

      <ul className="space-y-3" role="list">
        {insights.map((insight: PlannerInsight) => {
          const config = SEVERITY_CONFIG[insight.severity];
          const Icon = config.icon;

          return (
            <li
              key={insight.id}
              className={`p-4 rounded-xl border ${config.border} ${config.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeText}`}
                    >
                      {config.badgeLabel}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {insight.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>

              {insight.action && (
                <div className="shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => onNavigateTab(insight.action!.tab)}
                    aria-label={`${insight.action.label}: ${insight.title}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <span>{insight.action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
