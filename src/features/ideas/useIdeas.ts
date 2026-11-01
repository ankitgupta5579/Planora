import { useState, useMemo } from 'react';
import { EventPlan, PersonalizedIdea, IdeaCategory } from '../../types/event';
import { generateHeuristicIdeas } from '../../utils/ideaGenerator';
import { safeConfetti } from '../../utils/motion';

/**
 * Props for useIdeas domain hook.
 */
export interface UseIdeasProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

/**
 * Return contract for useIdeas hook.
 */
export interface UseIdeasReturn {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  showAddModal: boolean;
  setShowAddModal: (open: boolean) => void;
  isSparkingAi: boolean;
  copiedHex: string | null;
  expandedIdeas: Record<string, boolean>;
  fallbackNotice: string | null;
  aiStatusMessage: string;
  formCategory: IdeaCategory;
  setFormCategory: (c: IdeaCategory) => void;
  formTitle: string;
  setFormTitle: (t: string) => void;
  formDescription: string;
  setFormDescription: (d: string) => void;
  formTags: string;
  setFormTags: (t: string) => void;
  filteredIdeas: PersonalizedIdea[];
  handleToggleExpand: (id: string) => void;
  handleCopyHex: (hex: string) => void;
  handleSparkAiIdeas: () => Promise<void>;
  openAddModal: () => void;
  handleSaveCustomIdea: (e: React.FormEvent) => void;
  handleDeleteIdea: (id: string) => void;
}

/**
 * Domain hook managing creative ideation, curated blueprints, and AI inspiration generation.
 *
 * @param props - Event plan and persistence callback
 * @returns Fully typed ideas state and actions
 */
export function useIdeas({ plan, onUpdatePlan }: UseIdeasProps): UseIdeasReturn {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSparkingAi, setIsSparkingAi] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>({});
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');

  // Form state
  const [formCategory, setFormCategory] = useState<IdeaCategory>('theme_decor');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  const filteredIdeas = useMemo(() => {
    return (plan.ideas || []).filter((idea) => {
      if (selectedCategory === 'all') return true;
      return idea.category === selectedCategory;
    });
  }, [plan.ideas, selectedCategory]);

  const handleToggleExpand = (id: string) => {
    setExpandedIdeas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleSparkAiIdeas = async () => {
    setIsSparkingAi(true);
    setFallbackNotice(null);
    setAiStatusMessage('Synthesizing bespoke touches across every category...');

    const existingTitles = (plan.ideas || []).map((i) => i.title);
    const eventContext = {
      title: plan.title,
      type: plan.type,
      vibe: plan.vibe,
      location: plan.location,
      guestCount: plan.guestCount,
      totalBudget: plan.totalBudget,
      currency: plan.currency,
    };

    try {
      const res = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventContext,
          existingTitles,
          allSections: true,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      if (data.ideas && data.ideas.length > 0) {
        const merged = [...(plan.ideas || []), ...data.ideas];
        onUpdatePlan({ ...plan, ideas: merged });
        safeConfetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (data.isFallback) {
          setFallbackNotice(
            'Generated fresh creative concepts using curated celebration blueprints.'
          );
        }
      }
    } catch {
      const heuristicIdeas = generateHeuristicIdeas({
        ...eventContext,
        existingTitles,
        allSections: true,
      });

      const merged = [...(plan.ideas || []), ...heuristicIdeas];
      onUpdatePlan({ ...plan, ideas: merged });
      safeConfetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      setFallbackNotice('Generated fresh creative concepts using curated celebration blueprints.');
    } finally {
      setIsSparkingAi(false);
      setAiStatusMessage('');
    }
  };

  const openAddModal = () => {
    setFormCategory('theme_decor');
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
    setShowAddModal(true);
  };

  const handleSaveCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newIdea: PersonalizedIdea = {
      id: 'idea-' + Date.now(),
      title: formTitle.trim(),
      category: formCategory,
      description: formDescription.trim(),
      tags: tags.length > 0 ? tags : ['custom', formCategory],
    };

    const updated = [...(plan.ideas || []), newIdea];
    onUpdatePlan({ ...plan, ideas: updated });
    setShowAddModal(false);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = (plan.ideas || []).filter((i) => i.id !== id);
    onUpdatePlan({ ...plan, ideas: updated });
  };

  return {
    selectedCategory,
    setSelectedCategory,
    showAddModal,
    setShowAddModal,
    isSparkingAi,
    copiedHex,
    expandedIdeas,
    fallbackNotice,
    aiStatusMessage,
    formCategory,
    setFormCategory,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formTags,
    setFormTags,
    filteredIdeas,
    handleToggleExpand,
    handleCopyHex,
    handleSparkAiIdeas,
    openAddModal,
    handleSaveCustomIdea,
    handleDeleteIdea,
  };
}
