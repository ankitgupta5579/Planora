import { useState } from 'react';
import { EventPlan, PersonalizedIdea } from '../../types/event';
import { generateHeuristicIdeas } from '../../utils/ideaGenerator';
import { safeConfetti } from '../../utils/motion';

export interface UseIdeasProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export function useIdeas({ plan, onUpdatePlan }: UseIdeasProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSparkingAi, setIsSparkingAi] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>({});
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');

  // Form state
  const [formCategory, setFormCategory] = useState<PersonalizedIdea['category']>('theme_decor');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  const filteredIdeas = (plan.ideas || []).filter((idea) => {
    if (selectedCategory === 'all') return true;
    return idea.category === selectedCategory;
  });

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
      setFallbackNotice(
        'Generated fresh creative concepts using curated celebration blueprints.'
      );
    } finally {
      setIsSparkingAi(false);
      setAiStatusMessage('');
    }
  };

  const handleSaveCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newIdea: PersonalizedIdea = {
      id: 'idea-' + Date.now(),
      category: formCategory,
      title: formTitle.trim(),
      description: formDescription.trim() || 'Custom celebration detail.',
      tags: tags.length > 0 ? tags : ['Custom', 'Personal Touch'],
    };

    onUpdatePlan({ ...plan, ideas: [...(plan.ideas || []), newIdea] });
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
    setShowAddModal(false);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = (plan.ideas || []).filter((idea) => idea.id !== id);
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
    handleSaveCustomIdea,
    handleDeleteIdea,
  };
}
