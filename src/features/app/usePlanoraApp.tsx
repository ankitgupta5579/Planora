import React, { useState, useEffect, useRef } from 'react';
import { EventPlan } from '../../types/event';
import {
  loadSavedEvents,
  saveAllEvents,
  getActiveEventId,
  setActiveEventId,
  resetToSampleEvents,
} from '../../utils/storage';
import {
  LayoutDashboard,
  DollarSign,
  Clock,
  Building2,
  Sparkles,
  Users,
} from 'lucide-react';

export type TabKey = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests';

export const VALID_TABS: TabKey[] = ['overview', 'budget', 'timeline', 'vendors', 'ideas', 'guests'];

export function getTabFromHash(): TabKey {
  if (typeof window === 'undefined') return 'overview';
  const raw = window.location.hash.replace(/^#/, '').toLowerCase().trim();
  return VALID_TABS.includes(raw as TabKey) ? (raw as TabKey) : 'overview';
}

export interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

/**
 * Custom hook encapsulating core application state, event selection, routing, and dialog states.
 */
export function usePlanoraApp() {
  const [events, setEvents] = useState<EventPlan[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadSavedEvents();
  });
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const loaded = loadSavedEvents();
    return getActiveEventId(loaded);
  });
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromHash());

  // Modal Dialogs State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const tabListRef = useRef<HTMLDivElement>(null);

  // Synchronize browser history and hash navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getTabFromHash();
      setActiveTab(currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    if (typeof window !== 'undefined' && !window.location.hash) {
      window.history.replaceState({ tab: 'overview' }, '', '#overview');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigateTab = (tab: TabKey, pushHistory = true) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && pushHistory) {
      const targetHash = tab === 'overview' ? '#overview' : `#${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState({ tab }, '', targetHash);
      }
    }
  };

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
    handleNavigateTab('overview');
  };

  const handleResetSampleData = () => {
    const fresh = resetToSampleEvents();
    setEvents(fresh);
    if (fresh.length > 0) {
      setActiveId(fresh[0].id);
    }
  };

  const handleDeleteActiveEvent = () => {
    if (!activeEvent || events.length <= 1) return;
    const remaining = events.filter((e) => e.id !== activeEvent.id);
    setEvents(remaining);
    saveAllEvents(remaining);
    if (remaining.length > 0) {
      setActiveId(remaining[0].id);
      setActiveEventId(remaining[0].id);
    }
  };

  const tabs: TabItem[] = activeEvent
    ? [
        { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { key: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
        {
          key: 'timeline',
          label: 'Timeline & Schedule',
          icon: <Clock className="w-4 h-4" />,
          count: activeEvent.timelineItems.length,
        },
        {
          key: 'vendors',
          label: 'Vendors',
          icon: <Building2 className="w-4 h-4" />,
          count: activeEvent.vendors.length,
        },
        {
          key: 'ideas',
          label: 'Ideas & Themes',
          icon: <Sparkles className="w-4 h-4" />,
          count: activeEvent.ideas.length,
        },
        {
          key: 'guests',
          label: 'Guests & RSVPs',
          icon: <Users className="w-4 h-4" />,
          count: activeEvent.guests.length,
        },
      ]
    : [];

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
      handleNavigateTab(nextKey);
      const tabButton = document.getElementById(`tab-${nextKey}`);
      tabButton?.focus();
    }
  };

  return {
    events,
    activeId,
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
  };
}
