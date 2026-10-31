import React from 'react';
import { GuestItem } from '../../types/event';
import { Trash2 } from 'lucide-react';

export interface GuestRowProps {
  guest: GuestItem;
  onOpenEdit: (guest: GuestItem) => void;
  onDelete: (id: string) => void;
  onRsvpChange: (guestId: string, status: GuestItem['rsvpStatus']) => void;
  onTableChange: (guestId: string, table: string) => void;
}

const RSVP_OPTIONS: { id: GuestItem['rsvpStatus']; label: string; badge: string }[] = [
  { id: 'attending', label: 'Attending', badge: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'pending', label: 'Pending', badge: 'bg-amber-500/20 text-amber-300' },
  { id: 'declined', label: 'Declined', badge: 'bg-rose-500/20 text-rose-300' },
];

const GROUP_STYLES: Record<GuestItem['group'], string> = {
  family: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  friends: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  colleagues: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  vip: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  general: 'bg-slate-700/30 text-slate-300 border-slate-700',
};

/**
 * Accessible table row representing a single guest with inline RSVP and seating updates.
 */
export const GuestRow: React.FC<GuestRowProps> = ({
  guest,
  onOpenEdit,
  onDelete,
  onRsvpChange,
  onTableChange,
}) => {
  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
      {/* Name & Contact */}
      <td className="py-3 px-4">
        <div className="font-semibold text-white">{guest.name}</div>
        {guest.email && <span className="text-[11px] text-slate-300">{guest.email}</span>}
      </td>

      {/* Group */}
      <td className="py-3 px-4">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
            GROUP_STYLES[guest.group] || GROUP_STYLES.general
          }`}
        >
          {guest.group}
        </span>
      </td>

      {/* RSVP Status dropdown */}
      <td className="py-3 px-4">
        <label htmlFor={`guest-rsvp-${guest.id}`} className="sr-only">
          RSVP status for {guest.name}
        </label>
        <select
          id={`guest-rsvp-${guest.id}`}
          value={guest.rsvpStatus}
          onChange={(e) => onRsvpChange(guest.id, e.target.value as GuestItem['rsvpStatus'])}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            RSVP_OPTIONS.find((r) => r.id === guest.rsvpStatus)?.badge || 'text-slate-300'
          }`}
        >
          {RSVP_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      </td>

      {/* Headcount / Plus Ones */}
      <td className="py-3 px-4 text-center font-medium text-slate-200">
        {guest.rsvpStatus === 'attending' ? (
          <span className="text-white font-bold">{1 + guest.plusOnes}</span>
        ) : (
          <span className="text-slate-400">0</span>
        )}
        {guest.plusOnes > 0 && (
          <span className="text-[11px] text-slate-400 block">(+{guest.plusOnes} guest)</span>
        )}
      </td>

      {/* Table / Seating inline input */}
      <td className="py-3 px-4">
        <label htmlFor={`guest-table-${guest.id}`} className="sr-only">
          Table number for {guest.name}
        </label>
        <input
          id={`guest-table-${guest.id}`}
          type="text"
          placeholder="Unassigned"
          value={guest.tableNumber || ''}
          onChange={(e) => onTableChange(guest.id, e.target.value)}
          className="w-24 px-2 py-1 rounded bg-slate-900/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </td>

      {/* Dietary Restrictions */}
      <td className="py-3 px-4">
        {guest.dietaryRestrictions && guest.dietaryRestrictions.toLowerCase() !== 'none' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] border border-purple-500/20 font-medium">
            {guest.dietaryRestrictions}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Standard</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEdit(guest)}
            className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(guest.id)}
            aria-label={`Delete guest: ${guest.name}`}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
