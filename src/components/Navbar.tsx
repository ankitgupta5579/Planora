import React from 'react';
import { EventPlan } from '../types/event';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  Download, 
  MessageSquare, 
  Heart, 
  Cake, 
  Users, 
  Briefcase, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  onSelectEvent: (id: string) => void;
  onOpenWizard: () => void;
  onOpenAiChat: () => void;
  onOpenExport: () => void;
  onOpenSpeechModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenWizard,
  onOpenAiChat,
  onOpenExport,
  onOpenSpeechModal,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'wedding': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'birthday': return <Cake className="w-4 h-4 text-amber-500" />;
      case 'community': return <Users className="w-4 h-4 text-emerald-500" />;
      default: return <Briefcase className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                Celebration AI
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hidden sm:inline-block">
                Planner
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden md:block">
              Weddings • Birthdays • Festivals
            </p>
          </div>
        </div>

        {/* Center: Event Selector */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[200px] sm:max-w-[320px] justify-center">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="event-selector" className="sr-only">Select Active Event</label>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              {getEventIcon(activeEvent.type)}
            </div>
            <select
              id="event-selector"
              value={activeEvent.id}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="w-full appearance-none pl-8 pr-6 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-slate-200">
                  {ev.title}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-xs">
              ▼
            </div>
          </div>

          <button
            onClick={onOpenWizard}
            title="Create new AI planned event"
            aria-label="Create new celebration event"
            className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">New</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenSpeechModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Generate Invitations & Speeches"
            aria-label="Generate invitations and speeches"
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Invites</span>
          </button>

          <button
            onClick={onOpenExport}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Export Summary or Print"
            aria-label="Export event summary or print"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition cursor-pointer"
            title="Open AI Event Planner Assistant"
            aria-label="Open AI Event Planner Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
