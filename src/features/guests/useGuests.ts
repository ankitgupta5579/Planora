import { useState } from 'react';
import { EventPlan, GuestItem } from '../../types/event';
import { calculateGuestStats } from '../../utils/eventCalculators';

export interface UseGuestsProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export function useGuests({ plan, onUpdatePlan }: UseGuestsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editGuest, setEditGuest] = useState<GuestItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGroup, setFormGroup] = useState<GuestItem['group']>('friends');
  const [formRsvp, setFormRsvp] = useState<GuestItem['rsvpStatus']>('pending');
  const [formPlusOnes, setFormPlusOnes] = useState('0');
  const [formDiet, setFormDiet] = useState('');
  const [formTable, setFormTable] = useState('');

  const stats = calculateGuestStats(plan.guests);

  const filteredGuests = plan.guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (g.tableNumber && g.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || g.rsvpStatus === statusFilter;
    const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const handleInlineTableChange = (guestId: string, newTable: string) => {
    const updated = plan.guests.map((g) =>
      g.id === guestId ? { ...g, tableNumber: newTable } : g
    );
    onUpdatePlan({ ...plan, guests: updated });
  };

  const handleRsvpChange = (guestId: string, newStatus: GuestItem['rsvpStatus']) => {
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
