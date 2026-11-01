import { useState, useMemo } from 'react';
import { EventPlan, GuestItem, GuestGroup, GuestRsvpStatus } from '../../types/event';
import { calculateGuestStats, GuestStats } from '../../utils/eventCalculators';

/**
 * Props for useGuests domain hook.
 */
export interface UseGuestsProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

/**
 * Return contract for useGuests hook.
 */
export interface UseGuestsReturn {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  groupFilter: string;
  setGroupFilter: (g: string) => void;
  showAddModal: boolean;
  setShowAddModal: (open: boolean) => void;
  showCsvModal: boolean;
  setShowCsvModal: (open: boolean) => void;
  editGuest: GuestItem | null;
  formName: string;
  setFormName: (n: string) => void;
  formEmail: string;
  setFormEmail: (e: string) => void;
  formGroup: GuestGroup;
  setFormGroup: (g: GuestGroup) => void;
  formRsvp: GuestRsvpStatus;
  setFormRsvp: (r: GuestRsvpStatus) => void;
  formPlusOnes: string;
  setFormPlusOnes: (p: string) => void;
  formDiet: string;
  setFormDiet: (d: string) => void;
  formTable: string;
  setFormTable: (t: string) => void;
  stats: GuestStats;
  filteredGuests: GuestItem[];
  handleInlineTableChange: (guestId: string, newTable: string) => void;
  handleRsvpChange: (guestId: string, newStatus: GuestRsvpStatus) => void;
  openAddModal: () => void;
  openEditModal: (guest: GuestItem) => void;
  handleSaveGuest: (e: React.FormEvent) => void;
  handleDeleteGuest: (id: string) => void;
  handleBulkImportCsv: (importedGuests: GuestItem[]) => void;
}

/**
 * Domain hook managing guest roster, RSVPs, dietary tags, table assignments, and CSV imports.
 *
 * @param props - Event plan and persistence callback
 * @returns Fully typed guest management state and actions
 */
export function useGuests({ plan, onUpdatePlan }: UseGuestsProps): UseGuestsReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editGuest, setEditGuest] = useState<GuestItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGroup, setFormGroup] = useState<GuestGroup>('friends');
  const [formRsvp, setFormRsvp] = useState<GuestRsvpStatus>('pending');
  const [formPlusOnes, setFormPlusOnes] = useState('0');
  const [formDiet, setFormDiet] = useState('');
  const [formTable, setFormTable] = useState('');

  const stats = useMemo(() => calculateGuestStats(plan.guests), [plan.guests]);

  const filteredGuests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return plan.guests.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        (g.email && g.email.toLowerCase().includes(q)) ||
        (g.tableNumber && g.tableNumber.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || g.rsvpStatus === statusFilter;
      const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [plan.guests, searchTerm, statusFilter, groupFilter]);

  const handleInlineTableChange = (guestId: string, newTable: string) => {
    const updated = plan.guests.map((g) =>
      g.id === guestId ? { ...g, tableNumber: newTable } : g
    );
    onUpdatePlan({ ...plan, guests: updated });
  };

  const handleRsvpChange = (guestId: string, newStatus: GuestRsvpStatus) => {
    const updated = plan.guests.map((g) =>
      g.id === guestId ? { ...g, rsvpStatus: newStatus } : g
    );
    onUpdatePlan({ ...plan, guests: updated });
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
    setFormPlusOnes(guest.plusOnes.toString());
    setFormDiet(guest.dietaryRestrictions || '');
    setFormTable(guest.tableNumber || '');
    setShowAddModal(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updatedGuests: GuestItem[];

    if (editGuest) {
      updatedGuests = plan.guests.map((g) =>
        g.id === editGuest.id
          ? {
              ...g,
              name: formName.trim(),
              email: formEmail.trim() || undefined,
              group: formGroup,
              rsvpStatus: formRsvp,
              plusOnes: parseInt(formPlusOnes, 10) || 0,
              dietaryRestrictions: formDiet.trim() || undefined,
              tableNumber: formTable.trim() || undefined,
            }
          : g
      );
    } else {
      const newGuest: GuestItem = {
        id: 'g-' + Date.now(),
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        group: formGroup,
        rsvpStatus: formRsvp,
        plusOnes: parseInt(formPlusOnes, 10) || 0,
        dietaryRestrictions: formDiet.trim() || undefined,
        tableNumber: formTable.trim() || undefined,
      };
      updatedGuests = [...plan.guests, newGuest];
    }

    onUpdatePlan({ ...plan, guests: updatedGuests });
    setShowAddModal(false);
  };

  const handleDeleteGuest = (id: string) => {
    const updated = plan.guests.filter((g) => g.id !== id);
    onUpdatePlan({ ...plan, guests: updated });
  };

  const handleBulkImportCsv = (importedGuests: GuestItem[]) => {
    const updated = [...plan.guests, ...importedGuests];
    onUpdatePlan({ ...plan, guests: updated });
    setShowCsvModal(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    showAddModal,
    setShowAddModal,
    showCsvModal,
    setShowCsvModal,
    editGuest,
    formName,
    setFormName,
    formEmail,
    setFormEmail,
    formGroup,
    setFormGroup,
    formRsvp,
    setFormRsvp,
    formPlusOnes,
    setFormPlusOnes,
    formDiet,
    setFormDiet,
    formTable,
    setFormTable,
    stats,
    filteredGuests,
    handleInlineTableChange,
    handleRsvpChange,
    openAddModal,
    openEditModal,
    handleSaveGuest,
    handleDeleteGuest,
    handleBulkImportCsv,
  };
}
