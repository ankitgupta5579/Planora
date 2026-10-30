import React, { useState, useEffect, useRef } from 'react';
import { EventPlan } from './types/event';
import { 
  loadSavedEvents, 
  saveAllEvents, 
  getActiveEventId, 
  setActiveEventId 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { EventOverviewTab } from './components/EventOverviewTab';
import { BudgetTab } from './components/BudgetTab';
import { TimelineTab } from './components/TimelineTab';
import { VendorsTab } from './components/VendorsTab';
import { IdeasTab } from './components/IdeasTab';
import { GuestsTab } from './components/GuestsTab';
import { EventWizardModal } from './components/EventWizardModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { SpeechInviteModal } from './components/SpeechInviteModal';
import { ExportModal } from './components/ExportModal';
import { 
  LayoutDashboard, 
  DollarSign, 
  Clock, 
  Building2, 
  Sparkles, 
  Users 
} from 'lucide-react';

type TabKey = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests';

export default function App() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const tabListRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const loaded = loadSavedEvents();
    setEvents(loaded);
    const initialId = getActiveEventId(loaded);
    setActiveId(initialId);
  }, []);

  const activeEvent = events.find((e) => e.id === activeId) || events[0];

  const handleSelectEvent = (id: string) => {
    setActiveId(id);
    setActiveEventId(id);
  };

  const handleUpdatePlan = (updatedPlan: EventPlan) => {
    const updatedList = events.map((e) => (e.id === updatedPlan.id ? updatedPlan : e));
    setEvents(updatedList);
    saveAllEvents(updatedList);
  };

  const handlePlanCreated = (newPlan: EventPlan) => {
    const updatedList = [newPlan, ...events];
    setEvents(updatedList);
    setActiveId(newPlan.id);
    setActiveEventId(newPlan.id);
    saveAllEvents(updatedList);
    setActiveTab('overview');
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = activeEvent ? [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'timeline', label: 'Timeline & Schedule', icon: <Clock className="w-4 h-4" />, count: activeEvent.timelineItems.length },
    { key: 'vendors', label: 'Vendors', icon: <Building2 className="w-4 h-4" />, count: activeEvent.vendors.length },
    { key: 'ideas', label: 'Ideas & Themes', icon: <Sparkles className="w-4 h-4" />, count: activeEvent.ideas.length },
    { key: 'guests', label: 'Guests & RSVPs', icon: <Users className="w-4 h-4" />, count: activeEvent.guests.length },
  ] : [];

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== -1) {
      const nextKey = tabs[nextIndex].key;
      setActiveTab(nextKey);
      const tabButton = document.getElementById(`tab-${nextKey}`);
      tabButton?.focus();
    }
  };

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Loading Celebration Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Skip to Main Content Link for Screen Readers & Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenAiChat={() => setIsAiDrawerOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSpeechModal={() => setIsSpeechModalOpen(true)}
      />

      {/* Main Container */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none"
      >
        {/* Tab Navigation with Accessible Arrow-Key Support */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Event sections"
          onKeyDown={handleTabKeyDown}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin border-b border-slate-800"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition whitespace-nowrap cursor-pointer border-b-2 -mb-[2px] ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60 shadow-sm'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/30'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
                      isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="pt-2 focus:outline-none"
        >
          {activeTab === 'overview' && (
            <EventOverviewTab
              plan={activeEvent}
              onNavigateTab={(t) => setActiveTab(t)}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
              onOpenSpeechModal={() => setIsSpeechModalOpen(true)}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-300">
          Celebration & Event Planner
        </p>
        <p className="mt-1 text-slate-400">
          Organize Weddings, Birthdays, Community Events with AI Budgets, Timelines & Vendors.
        </p>
      </footer>

      {/* Modals & Drawers */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPlanCreated={handlePlanCreated}
      />

      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        plan={activeEvent}
      />

      <SpeechInviteModal
        isOpen={isSpeechModalOpen}
        onClose={() => setIsSpeechModalOpen(false)}
        plan={activeEvent}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={activeEvent}
      />
    </div>
  );
}
