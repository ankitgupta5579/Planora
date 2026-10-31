import { useState } from 'react';
import { EventPlan, TimelineItem } from '../../types/event';
import { calculateTimelineProgress } from '../../utils/eventCalculators';
import { safeConfetti } from '../../utils/motion';

export interface UseTimelineProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export function useTimeline({ plan, onUpdatePlan }: UseTimelineProps) {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [isDayOfOnly, setIsDayOfOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);

  // Form states
  const [formPhase, setFormPhase] = useState<TimelineItem['phase']>('planning_mid');
  const [formTimeLabel, setFormTimeLabel] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');

  const progress = calculateTimelineProgress(plan.timelineItems);

  const filteredItems = plan.timelineItems.filter((item) => {
    if (isDayOfOnly) {
      return item.phase === 'day_of';
    }
    if (selectedPhase === 'all') return true;
    return item.phase === selectedPhase;
  });

  const handleToggleComplete = (item: TimelineItem) => {
    const updated = plan.timelineItems.map((t) =>
      t.id === item.id ? { ...t, completed: !t.completed } : t
    );
    onUpdatePlan({ ...plan, timelineItems: updated, updatedAt: new Date().toISOString() });

    if (!item.completed) {
      safeConfetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormPhase(isDayOfOnly ? 'day_of' : 'planning_mid');
    setFormTimeLabel('');
    setFormTitle('');
    setFormDescription('');
    setFormAssignedTo('');
    setShowAddModal(true);
  };

  const openEditModal = (item: TimelineItem) => {
    setEditItem(item);
    setFormPhase(item.phase);
    setFormTimeLabel(item.timeLabel || '');
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormAssignedTo(item.assignedTo || '');
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    let updatedItems: TimelineItem[];

    if (editItem) {
      updatedItems = plan.timelineItems.map((t) =>
        t.id === editItem.id
          ? {
              ...t,
              phase: formPhase,
              timeLabel: formTimeLabel.trim() || undefined,
              title: formTitle.trim(),
              description: formDescription.trim() || undefined,
              assignedTo: formAssignedTo.trim() || undefined,
            }
          : t
      );
    } else {
      const newItem: TimelineItem = {
        id: 't-' + Date.now(),
        phase: formPhase,
        timeLabel: formTimeLabel.trim() || undefined,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        assignedTo: formAssignedTo.trim() || undefined,
        completed: false,
      };
      updatedItems = [...plan.timelineItems, newItem];
    }

    onUpdatePlan({ ...plan, timelineItems: updatedItems, updatedAt: new Date().toISOString() });
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.timelineItems.filter((t) => t.id !== id);
    onUpdatePlan({ ...plan, timelineItems: updated, updatedAt: new Date().toISOString() });
  };

  return {
    selectedPhase,
    setSelectedPhase,
    isDayOfOnly,
    setIsDayOfOnly,
    showAddModal,
    setShowAddModal,
    editItem,
    formPhase,
    setFormPhase,
    formTimeLabel,
    setFormTimeLabel,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formAssignedTo,
    setFormAssignedTo,
    progress,
    filteredItems,
    handleToggleComplete,
    openAddModal,
    openEditModal,
    handleSaveItem,
    handleDeleteItem,
  };
}
