import React, { useState } from 'react';
import { EventPlan, PersonalizedIdea } from '../types/event';
import { useFocusTrap } from '../utils/useFocusTrap';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Tag, 
  Palette, 
  Utensils, 
  Music, 
  Heart, 
  Leaf, 
  Copy, 
  Check, 
  X 
} from 'lucide-react';

interface IdeasTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenAiChat: () => void;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({ plan, onUpdatePlan, onOpenAiChat }) => {
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

  const modalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));

  const categories: { id: PersonalizedIdea['category']; label: string; icon: React.ReactNode }[] = [
    { id: 'theme_decor', label: 'Theme & Decor', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'food_beverage', label: 'Food & Signature Drinks', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'entertainment', label: 'Entertainment & Games', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'guest_experience', label: 'Guest Experience & Keepsakes', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'sustainable_tip', label: 'Eco-Friendly & Zero Waste', icon: <Leaf className="w-3.5 h-3.5" /> },
  ];

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = plan.ideas.filter((i) => i.id !== id);
    onUpdatePlan({ ...plan, ideas: updated, updatedAt: new Date().toISOString() });
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newIdea: PersonalizedIdea = {
      id: 'idea-' + Date.now(),
      title: formTitle.trim(),
      category: formCategory,
      description: formDescription.trim(),
      tags: tags.length > 0 ? tags : ['Custom', plan.vibe],
    };

    onUpdatePlan({ ...plan, ideas: [...plan.ideas, newIdea], updatedAt: new Date().toISOString() });
    setShowAddModal(false);
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
  };

  const handleSparkMoreAiIdeas = async () => {
    setIsSparkingAi(true);
    setFallbackNotice(null);
    try {
      const existingTitles = plan.ideas.map((i) => i.title);
      const res = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventContext: plan,
          focusCategory: selectedCategory === 'all' ? undefined : selectedCategory,
          existingTitles,
        }),
      });
      const data = await res.json();
      const newIdeas: PersonalizedIdea[] = Array.isArray(data.ideas) && data.ideas.length > 0
        ? data.ideas
        : [];

      if (newIdeas.length > 0) {
        onUpdatePlan({
          ...plan,
          ideas: [...newIdeas, ...plan.ideas],
          updatedAt: new Date().toISOString(),
        });
        setAiStatusMessage(`Added ${newIdeas.length} fresh ideas!`);
      }

      if (data.isFallback) {
        setFallbackNotice('Showing offline suggestions: ' + (data.message || 'AI service unavailable.'));
      }
    } catch {
      setFallbackNotice('Network error: unable to generate fresh ideas.');
    } finally {
      setIsSparkingAi(false);
    }
  };

  const filteredIdeas = plan.ideas.filter((i) => {
    if (selectedCategory === 'all') return true;
    return i.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Creative Moodboard & Inspiration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Personalized Event Ideas & Touches
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Unique concepts tailored to your {plan.vibe} {plan.type} celebration in {plan.location}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSparkMoreAiIdeas}
            disabled={isSparkingAi}
            aria-label="Generate more AI personalized creative ideas"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Sparkles className={`w-4 h-4 text-yellow-300 ${isSparkingAi ? 'animate-spin' : ''}`} />
            <span>{isSparkingAi ? 'Brainstorming...' : 'Spark AI Ideas'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            aria-label="Add custom creative idea"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Idea</span>
          </button>
        </div>
      </div>

      {/* Palette Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            Event Color Story
          </span>
          <span className="text-slate-400">Click any swatch to copy HEX</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {plan.colorPalette.map((color, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => copyHex(color.hex)}
              aria-label={`Copy color ${color.name} hex code ${color.hex}`}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-slate-500 transition cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div
                className="w-full h-12 rounded-lg shadow-inner mb-2 group-hover:scale-105 transition"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-xs font-semibold text-slate-200 truncate">{color.name}</div>
              <div className="flex items-center justify-between text-xs text-slate-200 font-mono mt-0.5">
                <span>{color.hex}</span>
                {copiedHex === color.hex ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div role="radiogroup" aria-label="Filter ideas by category" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          role="radio"
          aria-checked={selectedCategory === 'all'}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-200 hover:text-white'
          }`}
        >
          All Concepts ({plan.ideas.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            role="radio"
            aria-checked={selectedCategory === c.id}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selectedCategory === c.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:text-white'
            }`}
          >
            {c.icon}
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Offline Notice & Live Status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {aiStatusMessage}
      </div>
      {fallbackNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>{fallbackNotice}</span>
          <button
            onClick={() => setFallbackNotice(null)}
            aria-label="Dismiss notice"
            className="text-amber-400 hover:text-white p-0.5 rounded cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-300">
            No ideas in this category yet. Click "Spark AI Ideas" to generate fresh concepts!
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const catInfo = categories.find((c) => c.id === idea.category);
            const isExpanded = Boolean(expandedIdeas[idea.id]);
            const isLong = (idea.description || '').length > 130;

            return (
              <div
                key={idea.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-indigo-200 border border-slate-700 flex items-center gap-1">
                      {catInfo?.icon}
                      {catInfo?.label || idea.category}
                    </span>

                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      aria-label={`Remove idea: ${idea.title}`}
                      className="text-slate-300 hover:text-rose-400 cursor-pointer p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white break-words">{idea.title}</h3>
                  <p
                    className={`text-xs text-slate-200 leading-relaxed break-words ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {idea.description}
                  </p>
                  {isLong && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIdeas((prev) => ({ ...prev, [idea.id]: !prev[idea.id] }))
                      }
                      aria-expanded={isExpanded}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer mt-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 inline-block"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                  {idea.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-200 font-medium flex items-center gap-1 break-words"
                    >
                      <Tag className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Idea Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="idea-modal-title"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
          >
            <div className="flex items-center justify-between">
              <h3 id="idea-modal-title" className="text-lg font-bold text-white">
                Add Creative Event Idea
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

            <form onSubmit={handleSaveIdea} className="space-y-4 text-xs">
              <div>
                <label htmlFor="idea-title-input" className="block text-slate-200 font-medium mb-1">
                  Concept Title *
                </label>
                <input
                  id="idea-title-input"
                  type="text"
                  required
                  placeholder="e.g. Midnight Taco Food Truck Sendoff"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="idea-category-select" className="block text-slate-200 font-medium mb-1">
                  Category
                </label>
                <select
                  id="idea-category-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as PersonalizedIdea['category'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="idea-description-textarea" className="block text-slate-200 font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="idea-description-textarea"
                  rows={3}
                  required
                  placeholder="Describe the experience, logistics, or styling details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="idea-tags-input" className="block text-slate-200 font-medium mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="idea-tags-input"
                  type="text"
                  placeholder="e.g. Late Night, Food, Surprises"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  Add Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
