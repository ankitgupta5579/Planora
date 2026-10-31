import { useState } from 'react';
import { EventPlan, BudgetItem } from '../../types/event';
import {
  calculateBudgetMetrics,
  rebalanceBudgetItems,
  calculateUncommittedCash,
  calculateOutstandingVendorBalances,
} from '../../utils/eventCalculators';
import { safeConfetti } from '../../utils/motion';

export interface UseBudgetProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export function useBudget({ plan, onUpdatePlan }: UseBudgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetItem['category']>('catering');
  const [formTitle, setFormTitle] = useState('');
  const [formAllocated, setFormAllocated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPaid, setFormPaid] = useState(false);

  const metrics = calculateBudgetMetrics(plan.budgetItems, plan.totalBudget);
  const uncommittedCash = calculateUncommittedCash(plan);
  const outstandingVendorBalances = calculateOutstandingVendorBalances(plan.vendors);

  const filteredItems = plan.budgetItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryBreakdown = plan.budgetItems.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.allocatedAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  const openAddModal = () => {
    setEditItem(null);
    setFormCategory('catering');
    setFormTitle('');
    setFormAllocated('');
    setFormActual('');
    setFormNotes('');
    setFormPaid(false);
    setShowAddModal(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditItem(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormAllocated(item.allocatedAmount.toString());
    setFormActual(item.actualAmount.toString());
    setFormNotes(item.notes || '');
    setFormPaid(Boolean(item.isPaid));
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const allocatedAmount = parseFloat(formAllocated) || 0;
    const actualAmount = parseFloat(formActual) || 0;

    let updatedItems: BudgetItem[];

    if (editItem) {
      updatedItems = plan.budgetItems.map((b) =>
        b.id === editItem.id
          ? {
              ...b,
              category: formCategory,
              title: formTitle.trim(),
              allocatedAmount,
              actualAmount,
              notes: formNotes.trim() || undefined,
              isPaid: formPaid,
            }
          : b
      );
    } else {
      const newItem: BudgetItem = {
        id: 'b-' + Date.now(),
        category: formCategory,
        title: formTitle.trim(),
        allocatedAmount,
        actualAmount,
        notes: formNotes.trim() || undefined,
        isPaid: formPaid,
      };
      updatedItems = [...plan.budgetItems, newItem];
    }

    onUpdatePlan({ ...plan, budgetItems: updatedItems });
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.budgetItems.filter((b) => b.id !== id);
    onUpdatePlan({ ...plan, budgetItems: updated });
  };

  const handleTogglePaid = (item: BudgetItem) => {
    const updated = plan.budgetItems.map((b) =>
      b.id === item.id ? { ...b, isPaid: !b.isPaid } : b
    );
    onUpdatePlan({ ...plan, budgetItems: updated });
  };

  const handleAutoRebalance = () => {
    const rebalanced = rebalanceBudgetItems(plan.budgetItems, plan.totalBudget);
    onUpdatePlan({ ...plan, budgetItems: rebalanced });
    safeConfetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showAddModal,
    setShowAddModal,
    editItem,
    formCategory,
    setFormCategory,
    formTitle,
    setFormTitle,
    formAllocated,
    setFormAllocated,
    formActual,
    setFormActual,
    formNotes,
    setFormNotes,
    formPaid,
    setFormPaid,
    metrics,
    uncommittedCash,
    outstandingVendorBalances,
    filteredItems,
    categoryBreakdown,
    openAddModal,
    openEditModal,
    handleSaveItem,
    handleDeleteItem,
    handleTogglePaid,
    handleAutoRebalance,
  };
}
