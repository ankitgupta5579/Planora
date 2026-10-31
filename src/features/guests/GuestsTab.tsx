import React from 'react';
import { EventPlan, GuestItem } from '../../types/event';
import { useGuests } from './useGuests';
import { GuestStatsCards } from './GuestStatsCards';
import { GuestRow } from './GuestRow';
import { GuestModal } from './GuestModal';
import { CsvImportModal } from '../../components/CsvImportModal';
import { Plus, Search, Upload } from 'lucide-react';

export interface GuestsTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

const STATUS_FILTERS: { id: GuestItem['rsvpStatus'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All RSVPs' },
  { id: 'attending', label: 'Attending' },
  { id: 'pending', label: 'Pending' },
  { id: 'declined', label: 'Declined' },
];

const GROUP_FILTERS: { id: GuestItem['group'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Groups' },
  { id: 'family', label: 'Family' },
  { id: 'friends', label: 'Friends' },
  { id: 'colleagues', label: 'Colleagues' },
  { id: 'vip', label: 'VIP' },
  { id: 'general', label: 'General' },
];

/**
 * Guest list and RSVP management tab with CSV import, dietary tracking, and seating arrangement.
 */
export const GuestsTab: React.FC<GuestsTabProps> = ({ plan, onUpdatePlan }) => {
  const guestsState = useGuests({ plan, onUpdatePlan });

  return (
    <div className="space-y-6">
      {/* 5-Card Mission Control Stats */}
      <GuestStatsCards stats={guestsState.stats} targetCount={plan.guestCount} />

      {/* Action Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search guests by name, email, or table"
              placeholder="Search name, email, table..."
              value={guestsState.searchTerm}
              onChange={(e) => guestsState.setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label htmlFor="guest-status-filter" className="sr-only">
            Filter by RSVP status
          </label>
          <select
            id="guest-status-filter"
            value={guestsState.statusFilter}
            onChange={(e) => guestsState.setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <label htmlFor="guest-group-filter" className="sr-only">
            Filter by guest group
          </label>
          <select
            id="guest-group-filter"
            value={guestsState.groupFilter}
            onChange={(e) => guestsState.setGroupFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {GROUP_FILTERS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => guestsState.setShowCsvModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={guestsState.openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Group</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4">Table / Seating</th>
                <th className="py-3 px-4">Dietary Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guestsState.filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No guests found matching your filters.
                  </td>
                </tr>
              ) : (
                guestsState.filteredGuests.map((guest) => (
                  <GuestRow
                    key={guest.id}
                    guest={guest}
                    onOpenEdit={guestsState.openEditModal}
                    onDelete={guestsState.handleDeleteGuest}
                    onRsvpChange={guestsState.handleRsvpChange}
                    onTableChange={guestsState.handleInlineTableChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      <GuestModal
        isOpen={guestsState.showAddModal}
        onClose={() => guestsState.setShowAddModal(false)}
        onSubmit={guestsState.handleSaveGuest}
        isEdit={Boolean(guestsState.editGuest)}
        formName={guestsState.formName}
        setFormName={guestsState.setFormName}
        formEmail={guestsState.formEmail}
        setFormEmail={guestsState.setFormEmail}
        formGroup={guestsState.formGroup}
        setFormGroup={guestsState.setFormGroup}
        formRsvp={guestsState.formRsvp}
        setFormRsvp={guestsState.setFormRsvp}
        formPlusOnes={guestsState.formPlusOnes}
        setFormPlusOnes={guestsState.setFormPlusOnes}
        formDiet={guestsState.formDiet}
        setFormDiet={guestsState.setFormDiet}
        formTable={guestsState.formTable}
        setFormTable={guestsState.setFormTable}
      />

      {/* CSV Bulk Import Modal */}
      <CsvImportModal
        isOpen={guestsState.showCsvModal}
        onClose={() => guestsState.setShowCsvModal(false)}
        onImport={guestsState.handleBulkImportCsv}
        existingGuests={plan.guests}
      />
    </div>
  );
};
