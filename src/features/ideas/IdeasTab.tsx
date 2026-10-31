import React from 'react';
import { EventPlan, PersonalizedIdea } from '../../types/event';
import { useIdeas } from './useIdeas';
import { ColorStorySection } from './ColorStorySection';
import { IdeaCard } from './IdeaCard';
import { AddIdeaModal } from './AddIdeaModal';
import { Sparkles, Plus, Palette, Utensils, Music, Heart, Leaf } from 'lucide-react';

export interface IdeasTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenAiChat?: () => void;
}

const CATEGORY_TABS: {
  id: PersonalizedIdea['category'] | 'all';
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'all', label: 'All Concepts', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'theme_decor', label: 'Theme & Decor', icon: <Palette className="w-3.5 h-3.5" /> },
  {
    id: 'food_beverage',
    label: 'Food & Signature Drinks',
    icon: <Utensils className="w-3.5 h-3.5" />,
  },
  { id: 'entertainment', label: 'Entertainment & Games', icon: <Music className="w-3.5 h-3.5" /> },
  {
    id: 'guest_experience',
    label: 'Guest Experience & Keepsakes',
    icon: <Heart className="w-3.5 h-3.5" />,
  },
  {
    id: 'sustainable_tip',
    label: 'Eco-Friendly & Zero Waste',
    icon: <Leaf className="w-3.5 h-3.5" />,
  },
];

/**
 * Creative vision and personalized touches tab with AI idea generation and color palette inspector.
 */
export const IdeasTab: React.FC<IdeasTabProps> = ({ plan, onUpdatePlan }) => {
  const ideasState = useIdeas({ plan, onUpdatePlan });

  return (
    <div className="space-y-6">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Personalized Event Ideas & Touches
          </h2>
          <p className="text-xs text-slate-300">
            Unique concepts tailored to your {plan.vibe} {plan.type} celebration in {plan.location}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            disabled={ideasState.isSparkingAi}
            onClick={ideasState.handleSparkAiIdeas}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer shadow-md ${
              ideasState.isSparkingAi
                ? 'bg-indigo-600/60 text-indigo-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${ideasState.isSparkingAi ? 'animate-spin' : ''}`} />
            <span>{ideasState.isSparkingAi ? 'Sparking...' : 'Spark AI Ideas'}</span>
          </button>

          <button
            type="button"
            onClick={() => ideasState.setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Idea</span>
          </button>
        </div>
      </div>

      {/* Fallback & AI Status Banners */}
      {ideasState.fallbackNotice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between"
        >
          <span>{ideasState.fallbackNotice}</span>
        </div>
      )}

      {/* Event Color Story Swatches */}
      <ColorStorySection
        colorPalette={plan.colorPalette}
        copiedHex={ideasState.copiedHex}
        onCopyHex={ideasState.handleCopyHex}
      />

      {/* Category Filter Pills */}
      <div
        role="tablist"
        tabIndex={0}
        aria-label="Filter celebration ideas by category"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
      >
        {CATEGORY_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? (plan.ideas || []).length
              : (plan.ideas || []).filter((i) => i.category === tab.id).length;
          const isActive = ideasState.selectedCategory === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => ideasState.setSelectedCategory(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span>
                {tab.label} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      {ideasState.filteredIdeas.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <p className="text-sm text-slate-300 font-medium">No ideas currently in this section.</p>
          <button
            type="button"
            onClick={ideasState.handleSparkAiIdeas}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Spark ideas for this section with AI
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideasState.filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isExpanded={Boolean(ideasState.expandedIdeas[idea.id])}
              onToggleExpand={ideasState.handleToggleExpand}
              onDelete={ideasState.handleDeleteIdea}
            />
          ))}
        </div>
      )}

      {/* Add Custom Idea Modal */}
      <AddIdeaModal
        isOpen={ideasState.showAddModal}
        onClose={() => ideasState.setShowAddModal(false)}
        onSubmit={ideasState.handleSaveCustomIdea}
        formCategory={ideasState.formCategory}
        setFormCategory={ideasState.setFormCategory}
        formTitle={ideasState.formTitle}
        setFormTitle={ideasState.setFormTitle}
        formDescription={ideasState.formDescription}
        setFormDescription={ideasState.setFormDescription}
        formTags={ideasState.formTags}
        setFormTags={ideasState.setFormTags}
      />
    </div>
  );
};
