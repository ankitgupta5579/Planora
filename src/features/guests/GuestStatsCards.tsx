import React from 'react';
import { Users, UserCheck, UserX, Clock, UtensilsCrossed } from 'lucide-react';
import { GuestStats } from '../../utils/eventCalculators';

export interface GuestStatsCardsProps {
  stats: GuestStats;
  targetCount: number;
}

/**
 * Top summary cards displaying attendance, RSVPs, capacity progress, and dietary alerts.
 */
export const GuestStatsCards: React.FC<GuestStatsCardsProps> = ({ stats, targetCount }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total Headcount */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Confirmed</span>
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {stats.totalHeadcount}{' '}
          <span className="text-xs font-normal text-slate-400">/ {targetCount} target</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {stats.totalAttending} parties attending (+{stats.totalPlusOnes} plus-ones)
        </span>
      </div>

      {/* Attending Parties */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Attending</span>
          <UserCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400">{stats.totalAttending}</div>
        <span className="text-[11px] text-slate-400">Confirmed yes</span>
      </div>

      {/* Pending RSVPs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Awaiting</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-400">{stats.totalPending}</div>
        <span className="text-[11px] text-slate-400">Responses pending</span>
      </div>

      {/* Declined */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Declined</span>
          <UserX className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold text-rose-400">{stats.totalDeclined}</div>
        <span className="text-[11px] text-slate-400">Cannot attend</span>
      </div>

      {/* Dietary Needs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Dietary Alerts</span>
          <UtensilsCrossed className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-400">
          {Object.keys(stats.dietaryCounts).length}
        </div>
        <span className="text-[11px] text-slate-400">Special menu requests</span>
      </div>
    </div>
  );
};
