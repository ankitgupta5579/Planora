import { useState, useMemo } from 'react';
import { EventPlan, TimelineItem, TimelinePhase } from '../../types/event';
import { calculateTimelineProgress, TimelineProgress } from '../../utils/eventCalculators';
import { safeConfetti } from '../../utils/motion';

/**
 * Props for useTimeline domain hook.
 */
export interface UseTimelineProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

/**
 * Return contract for useTimeline hook.
 */
export interface UseTimelineReturn {
  selectedPhase: string;
  setSelectedPhase: (p: string) => void;
  isDayOfOnly: boolean;
  setIsDayOfOnly: (d: boolean) => void;
  showAddModal: boolean;
  setShowAddModal: (open: boolean) => void;
  editItem: TimelineItem | null;
  formPhase: TimelinePhase;
  setFormPhase: (p: TimelinePhase) => void;
  formTimeLabel: string;
  setFormTimeLabel: (l: string) => void;
  formTitle: string;
  setFormTitle: (t: string) => void;
  formDescription: string;
  setFormDescription: (d: string) => void;
  formAssignedTo: string;
  setFormAssignedTo: (a: string) => void;
  progress: TimelineProgress;
  filteredItems: TimelineItem[];
  handleToggleComplete: (item: TimelineItem) => void;
  openAddModal: () => void;
  openEditModal: (item: TimelineItem) => void;
  handleSaveItem: (e: React.FormEvent) => void;
  handleDeleteItem: (id: string) => void;
}

/**
 * Domain hook managing celebration timeline milestones, phases, and day-of run of show.
 *
 * @param props - Event plan and persistence callback
 * @returns Fully typed timeline state and actions
 */
export function useTimeline({ plan, onUpdatePlan }: UseTimelineProps): UseTimelineReturn {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [isDayOfOnly, setIsDayOfOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);

  // Form states
  const [formPhase, setFormPhase] = useState<TimelinePhase>('planning_mid');
  const [formTimeLabel, setFormTimeLabel] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');

  const progress = useMemo(
    () => calculateTimelineProgress(plan.timelineItems),
    [plan.timelineItems]
  );

  const filteredItems = useMemo(() => {
    return plan.timelineItems.filter((item) => {
      if (isDayOfOnly) {
        return item.phase === 'day_of';
      }
      if (selectedPhase === 'all') return true;
      return item.phase === selectedPhase;
    });
  }, [plan.timelineItems, isDayOfOnly, selectedPhase]);

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

    onUpdatePlan({ ...plan, timelineItems: updatedItems });
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.timelineItems.filter((t) => t.id !== id);
    onUpdatePlan({ ...plan, timelineItems: updated });
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
