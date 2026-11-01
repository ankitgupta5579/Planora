import { useState, useMemo } from 'react';
import { EventPlan, BudgetItem, BudgetCategory } from '../../types/event';
import {
  calculateBudgetMetrics,
  rebalanceBudgetItems,
  calculateUncommittedCash,
  calculateOutstandingVendorBalances,
  BudgetMetrics,
} from '../../utils/eventCalculators';
import { safeConfetti } from '../../utils/motion';

/**
 * Props passed to the useBudget domain hook.
 */
export interface UseBudgetProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

/**
 * Return interface for the useBudget custom hook.
 */
export interface UseBudgetReturn {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  showAddModal: boolean;
  setShowAddModal: (open: boolean) => void;
  editItem: BudgetItem | null;
  formCategory: BudgetCategory;
  setFormCategory: (c: BudgetCategory) => void;
  formTitle: string;
  setFormTitle: (t: string) => void;
  formAllocated: string;
  setFormAllocated: (a: string) => void;
  formActual: string;
  setFormActual: (a: string) => void;
  formNotes: string;
  setFormNotes: (n: string) => void;
  formPaid: boolean;
  setFormPaid: (p: boolean) => void;
  metrics: BudgetMetrics;
  uncommittedCash: number;
  outstandingVendorBalances: number;
  filteredItems: BudgetItem[];
  categoryBreakdown: Record<string, number>;
  openAddModal: () => void;
  openEditModal: (item: BudgetItem) => void;
  handleSaveItem: (e: React.FormEvent) => void;
  handleDeleteItem: (id: string) => void;
  handleTogglePaid: (item: BudgetItem) => void;
  handleAutoRebalance: () => void;
}

/**
 * Custom domain hook for comprehensive budget ledger management.
 * Manages line item mutations, deterministic calculations, filtering, and auto-rebalancing.
 *
 * @param props - Event plan and persistence callback
 * @returns Fully typed ledger state and actions
 */
export function useBudget({ plan, onUpdatePlan }: UseBudgetProps): UseBudgetReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<BudgetCategory>('catering');
  const [formTitle, setFormTitle] = useState('');
  const [formAllocated, setFormAllocated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPaid, setFormPaid] = useState(false);

  const metrics = useMemo(
    () => calculateBudgetMetrics(plan.budgetItems, plan.totalBudget),
    [plan.budgetItems, plan.totalBudget]
  );

  const uncommittedCash = useMemo(
    () => calculateUncommittedCash(plan),
    [plan]
  );

  const outstandingVendorBalances = useMemo(
    () => calculateOutstandingVendorBalances(plan.vendors),
    [plan.vendors]
  );

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return plan.budgetItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [plan.budgetItems, searchTerm, selectedCategory]);

  const categoryBreakdown = useMemo(() => {
    return plan.budgetItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.allocatedAmount;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [plan.budgetItems]);

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
