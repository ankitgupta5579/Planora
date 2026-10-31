import React from 'react';
import { EventPlan } from '../../types/event';
import { PlannerInsights } from '../../components/PlannerInsights';
import { useEventOverview } from './useEventOverview';
import { OverviewHero } from './OverviewHero';
import { MissionControlCards } from './MissionControlCards';
import { ThemeVisionCard } from './ThemeVisionCard';
import { UpcomingPrioritiesCard } from './UpcomingPrioritiesCard';

export interface EventOverviewTabProps {
  plan: EventPlan;
  onNavigateTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests') => void;
  onOpenAiChat: () => void;
  onOpenSpeechModal: () => void;
  onOpenDeleteEvent?: () => void;
  canDelete?: boolean;
}

/**
 * Event Mission Control dashboard providing an executive overview of countdown, budget,
 * timeline, vendor team, attendance, and creative vision.
 */
export const EventOverviewTab: React.FC<EventOverviewTabProps> = ({
  plan,
  onNavigateTab,
  onOpenAiChat,
  onOpenSpeechModal,
  onOpenDeleteEvent,
  canDelete = false,
}) => {
  const overview = useEventOverview({ plan });

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <OverviewHero
        plan={plan}
        formattedDate={overview.formattedDate}
        daysRemaining={overview.daysRemaining}
        onOpenSpeechModal={onOpenSpeechModal}
        onOpenAiChat={onOpenAiChat}
        onOpenDeleteEvent={onOpenDeleteEvent}
        canDelete={canDelete}
      />

      {/* 4 Mission Control Metric Cards */}
      <MissionControlCards
        plan={plan}
        budgetMetrics={overview.budgetMetrics}
        timelineProgress={overview.timelineProgress}
        vendorFinancials={overview.vendorFinancials}
        guestStats={overview.guestStats}
        onNavigateTab={onNavigateTab}
      />

      {/* Planner Insights Proactive Recommendations */}
      <PlannerInsights plan={plan} onNavigateTab={onNavigateTab} />

      {/* Two Column Layout: Creative Vision & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThemeVisionCard
            plan={plan}
            copiedHex={overview.copiedHex}
            onCopyHex={overview.handleCopyHex}
            onNavigateTab={onNavigateTab}
          />
        </div>

        <div className="space-y-6">
          <UpcomingPrioritiesCard
            timelineItems={plan.timelineItems}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>
    </div>
  );
};
