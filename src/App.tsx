import React from 'react';
import { usePlanoraApp } from './features/app/usePlanoraApp';
import { AppFooter } from './features/app/AppFooter';
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
import { ResetConfirmDialog } from './components/ResetConfirmDialog';
import { DeleteEventConfirmDialog } from './components/DeleteEventConfirmDialog';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const {
    events,
    activeEvent,
    activeTab,
    tabs,
    tabListRef,
    isWizardOpen,
    setIsWizardOpen,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    isSpeechModalOpen,
    setIsSpeechModalOpen,
    isExportOpen,
    setIsExportOpen,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleNavigateTab,
    handleSelectEvent,
    handleUpdatePlan,
    handlePlanCreated,
    handleResetSampleData,
    handleDeleteActiveEvent,
    handleTabKeyDown,
  } = usePlanoraApp();

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Loading Planora...</p>
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
        onOpenDeleteEvent={() => setIsDeleteConfirmOpen(true)}
        onNavigateHome={() => handleNavigateTab('overview')}
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
          tabIndex={0}
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
                onClick={() => handleNavigateTab(tab.key)}
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
          {/* Back to Home Navigation Bar for all pages apart from Home (overview) */}
          {activeTab !== 'overview' && (
            <div className="flex items-center justify-between mb-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => handleNavigateTab('overview')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-indigo-600/20 hover:border-indigo-500/50 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer shadow-sm group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Back to Home Overview"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home</span>
                <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">
                  • {activeEvent.title}
                </span>
              </button>

              <nav
                aria-label="Breadcrumb"
                className="text-xs text-slate-400 flex items-center gap-1.5 pr-1"
              >
                <button
                  type="button"
                  onClick={() => handleNavigateTab('overview')}
                  className="hover:text-indigo-400 text-slate-400 transition cursor-pointer font-medium"
                >
                  Home
                </button>
                <span aria-hidden="true" className="text-slate-600">
                  /
                </span>
                <span className="text-indigo-300 capitalize font-semibold">
                  {tabs.find((t) => t.key === activeTab)?.label || activeTab}
                </span>
              </nav>
            </div>
          )}

          {activeTab === 'overview' && (
            <EventOverviewTab
              plan={activeEvent}
              onNavigateTab={(t) => handleNavigateTab(t)}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
              onOpenSpeechModal={() => setIsSpeechModalOpen(true)}
              onOpenDeleteEvent={() => setIsDeleteConfirmOpen(true)}
              canDelete={events.length > 1}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab plan={activeEvent} onUpdatePlan={handleUpdatePlan} />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab plan={activeEvent} onUpdatePlan={handleUpdatePlan} />
          )}

          {activeTab === 'ideas' && (
            <IdeasTab
              plan={activeEvent}
              onUpdatePlan={handleUpdatePlan}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab plan={activeEvent} onUpdatePlan={handleUpdatePlan} />
          )}

          {/* Bottom Back to Home Button for convenient return on long pages */}
          {activeTab !== 'overview' && (
            <div className="pt-8 pb-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  handleNavigateTab('overview');
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold transition cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
                aria-label="Back to Home Overview"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home Overview</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <AppFooter onOpenResetConfirm={() => setIsResetConfirmOpen(true)} />

      {/* Modals & Drawers */}
      {isWizardOpen && (
        <EventWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onPlanCreated={handlePlanCreated}
        />
      )}

      <DeleteEventConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteActiveEvent}
        eventTitle={activeEvent?.title || 'Current Event'}
        canDelete={events.length > 1}
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

      <ResetConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          handleResetSampleData();
          setIsResetConfirmOpen(false);
        }}
      />
    </div>
  );
}
