import React, { useState } from 'react';
import { EventPlan, GuestItem } from '../types/event';
import { calculateGuestStats } from '../utils/eventCalculators';
import { useFocusTrap } from '../utils/useFocusTrap';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  UtensilsCrossed, 
  X 
} from 'lucide-react';

interface GuestsTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({ plan, onUpdatePlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuest, setEditGuest] = useState<GuestItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGroup, setFormGroup] = useState<GuestItem['group']>('friends');
  const [formRsvp, setFormRsvp] = useState<GuestItem['rsvpStatus']>('pending');
  const [formPlusOnes, setFormPlusOnes] = useState('0');
  const [formDiet, setFormDiet] = useState('');
  const [formTable, setFormTable] = useState('');

  const modalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));
  const stats = calculateGuestStats(plan.guests);

  const groups: GuestItem['group'][] = ['family', 'friends', 'colleagues', 'vip', 'general'];

  const handleInlineTableChange = (guestId: string, newTable: string) => {
    const updated = plan.guests.map((g) =>
      g.id === guestId ? { ...g, tableNumber: newTable } : g
    );
    onUpdatePlan({ ...plan, guests: updated, updatedAt: new Date().toISOString() });
  };

  const handleDeleteGuest = (id: string) => {
    const updated = plan.guests.filter((g) => g.id !== id);
    onUpdatePlan({ ...plan, guests: updated, updatedAt: new Date().toISOString() });
  };

  const openAddModal = () => {
    setEditGuest(null);
    setFormName('');
    setFormEmail('');
    setFormGroup('friends');
    setFormRsvp('pending');
    setFormPlusOnes('0');
    setFormDiet('');
    setFormTable('');
    setShowAddModal(true);
  };

  const openEditModal = (guest: GuestItem) => {
    setEditGuest(guest);
    setFormName(guest.name);
    setFormEmail(guest.email || '');
    setFormGroup(guest.group);
    setFormRsvp(guest.rsvpStatus);
    setFormPlusOnes(String(guest.plusOnes || 0));
    setFormDiet(guest.dietaryRestrictions || '');
    setFormTable(guest.tableNumber || '');
    setShowAddModal(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const plusOnes = Math.max(0, parseInt(formPlusOnes, 10) || 0);

    if (editGuest) {
      const updated = plan.guests.map((g) =>
        g.id === editGuest.id
          ? {
              ...g,
              name: formName.trim(),
              email: formEmail.trim(),
              group: formGroup,
              rsvpStatus: formRsvp,
              plusOnes,
              dietaryRestrictions: formDiet.trim(),
              tableNumber: formTable.trim(),
            }
          : g
      );
      onUpdatePlan({ ...plan, guests: updated, updatedAt: new Date().toISOString() });
    } else {
      const newGuest: GuestItem = {
        id: 'g-' + Date.now(),
        name: formName.trim(),
        email: formEmail.trim(),
        group: formGroup,
        rsvpStatus: formRsvp,
        plusOnes,
        dietaryRestrictions: formDiet.trim(),
        tableNumber: formTable.trim(),
      };
      onUpdatePlan({ ...plan, guests: [...plan.guests, newGuest], updatedAt: new Date().toISOString() });
    }

    setShowAddModal(false);
  };

  const filteredGuests = plan.guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.dietaryRestrictions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.rsvpStatus === statusFilter;
    const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold uppercase">Total Headcount</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalHeadcount}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            Target capacity: {plan.guestCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold uppercase">Confirmed Attending</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.totalAttending}</div>
          <div className="text-xs text-slate-300 mt-0.5">Invitations accepted</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold uppercase">Pending RSVPs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.totalPending}</div>
          <div className="text-xs text-slate-300 mt-0.5">Awaiting response</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold uppercase">Declined</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300">{stats.totalDeclined}</div>
          <div className="text-xs text-slate-300 mt-0.5">Unable to attend</div>
        </div>
      </div>

      {/* Dietary Needs Banner */}
      {(() => {
        const validDietaryEntries = Object.entries(stats.dietaryCounts).filter(
          ([diet]) => diet.toLowerCase() !== 'none' && diet.toLowerCase() !== 'no' && diet.toLowerCase() !== 'standard'
        );
        return (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5 text-pink-400" />
              <span>Special Dietary Requirements for Catering</span>
            </div>
            {validDietaryEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {validDietaryEntries.map(([diet, count]) => (
                  <span
                    key={diet}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 capitalize"
                  >
                    {diet}: <strong className="text-pink-400">{count}</strong>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No special dietary requirements recorded.
              </p>
            )}
          </div>
        );
      })()}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <label htmlFor="guest-search-input" className="sr-only">
              Search guests by name or diet
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="guest-search-input"
              type="text"
              placeholder="Search guests by name or diet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="guest-status-filter" className="sr-only">
              Filter guests by RSVP status
            </label>
            <select
              id="guest-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All RSVPs</option>
              <option value="attending">Attending</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <label htmlFor="guest-group-filter" className="sr-only">
              Filter guests by group
            </label>
            <select
              id="guest-group-filter"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          aria-label="Add guest to list"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/80 text-slate-200 uppercase text-xs font-semibold tracking-wider border-b border-slate-700">
            <tr>
              <th scope="col" className="py-3 px-4">Guest Name</th>
              <th scope="col" className="py-3 px-4">Group</th>
              <th scope="col" className="py-3 px-4">RSVP Status</th>
              <th scope="col" className="py-3 px-4 text-center">Plus-Ones</th>
              <th scope="col" className="py-3 px-4">Dietary Notes</th>
              <th scope="col" className="py-3 px-4">Table / Seat</th>
              <th scope="col" className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-300">
                  No guests match the search or filter.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => {
                const getStatusPill = () => {
                  switch (guest.rsvpStatus) {
                    case 'attending':
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs">
                          Attending
                        </span>
                      );
                    case 'declined':
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold text-xs">
                          Declined
                        </span>
                      );
                    default:
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs">
                          Pending
                        </span>
                      );
                  }
                };

                return (
                  <tr key={guest.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{guest.name}</div>
                      {guest.email && (
                        <div className="text-xs text-slate-300">{guest.email}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 uppercase text-xs font-medium border border-slate-700">
                        {guest.group}
                      </span>
                    </td>

                    <td className="py-3 px-4">{getStatusPill()}</td>

                    <td className="py-3 px-4 text-center font-mono">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes}` : '—'}
                    </td>

                    <td className="py-3 px-4">
                      {guest.dietaryRestrictions ? (
                        <span className="text-pink-300 font-medium">
                          {guest.dietaryRestrictions}
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      <label htmlFor={`guest-table-${guest.id}`} className="sr-only">
                        Table or seat for {guest.name}
                      </label>
                      <input
                        id={`guest-table-${guest.id}`}
                        type="text"
                        placeholder="Table / Seat"
                        value={guest.tableNumber || ''}
                        onChange={(e) => handleInlineTableChange(guest.id, e.target.value)}
                        className="w-28 px-2 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(guest)}
                          aria-label={`Edit guest details: ${guest.name}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded px-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          aria-label={`Delete guest: ${guest.name}`}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Guest Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-modal-title"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
          >
            <div className="flex items-center justify-between">
              <h3 id="guest-modal-title" className="text-lg font-bold text-white">
                {editGuest ? 'Edit Guest Details' : 'Add Guest to List'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
              <div>
                <label htmlFor="guest-name-input" className="block text-slate-200 font-medium mb-1">
                  Full Name *
                </label>
                <input
                  id="guest-name-input"
                  type="text"
                  required
                  placeholder="e.g. David Harrison"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guest-email-input" className="block text-slate-200 font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="guest-email-input"
                    type="email"
                    placeholder="david@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="guest-group-select" className="block text-slate-200 font-medium mb-1">
                    Group
                  </label>
                  <select
                    id="guest-group-select"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value as GuestItem['group'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {groups.map((g) => (
                      <option key={g} value={g}>{g.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guest-rsvp-select" className="block text-slate-200 font-medium mb-1">
                    RSVP Status
                  </label>
                  <select
                    id="guest-rsvp-select"
                    value={formRsvp}
                    onChange={(e) => setFormRsvp(e.target.value as GuestItem['rsvpStatus'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guest-plusones-input" className="block text-slate-200 font-medium mb-1">
                    Plus-Ones Count
                  </label>
                  <input
                    id="guest-plusones-input"
                    type="number"
                    min="0"
                    max="10"
                    value={formPlusOnes}
                    onChange={(e) => setFormPlusOnes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guest-diet-input" className="block text-slate-200 font-medium mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    id="guest-diet-input"
                    type="text"
                    placeholder="e.g. Vegetarian, Nut Allergy"
                    value={formDiet}
                    onChange={(e) => setFormDiet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="guest-table-input" className="block text-slate-200 font-medium mb-1">
                    Table Assignment
                  </label>
                  <input
                    id="guest-table-input"
                    type="text"
                    placeholder="e.g. Table 4"
                    value={formTable}
                    onChange={(e) => setFormTable(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {editGuest ? 'Save Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
