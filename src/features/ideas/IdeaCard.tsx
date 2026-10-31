import React from 'react';
import { PersonalizedIdea } from '../../types/event';
import { Trash2, Tag, Palette, Utensils, Music, Heart, Leaf } from 'lucide-react';

export interface IdeaCardProps {
  idea: PersonalizedIdea;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_META: Record<
  PersonalizedIdea['category'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  theme_decor: {
    label: 'Theme & Decor',
    icon: <Palette className="w-3 h-3" />,
    color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  },
  food_beverage: {
    label: 'Food & Signature Drinks',
    icon: <Utensils className="w-3 h-3" />,
    color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  entertainment: {
    label: 'Entertainment & Games',
    icon: <Music className="w-3 h-3" />,
    color: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  guest_experience: {
    label: 'Guest Experience & Keepsakes',
    icon: <Heart className="w-3 h-3" />,
    color: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  },
  sustainable_tip: {
    label: 'Eco-Friendly & Zero Waste',
    icon: <Leaf className="w-3 h-3" />,
    color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
};

/**
 * Accessible card presenting a single personalized event concept with expandable details.
 */
export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isExpanded,
  onToggleExpand,
  onDelete,
}) => {
  const meta = CATEGORY_META[idea.category] || CATEGORY_META.guest_experience;
  const isLong = idea.description.length > 120;
  const displayText =
    !isExpanded && isLong ? `${idea.description.slice(0, 120)}...` : idea.description;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3.5 hover:border-slate-700 transition flex flex-col justify-between shadow-sm">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${meta.color}`}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </span>

          <button
            type="button"
            onClick={() => onDelete(idea.id)}
            aria-label={`Delete idea: ${idea.title}`}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-white leading-snug">{idea.title}</h3>

        <p className="text-xs text-slate-300 leading-relaxed">{displayText}</p>

        {isLong && (
          <button
            type="button"
            onClick={() => onToggleExpand(idea.id)}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer block"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
          {idea.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
