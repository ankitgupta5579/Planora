import React, { useState } from 'react';
import { EventPlan, EventType, EventVibe } from '../types/event';
import { useFocusTrap } from '../utils/useFocusTrap';
import { safeConfetti } from '../utils/motion';
import { 
  Sparkles, 
  Heart, 
  Cake, 
  Users, 
  Briefcase, 
  Check, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: EventPlan) => void;
}

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepMessage, setGenerationStepMessage] = useState('');

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-12-15');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState('100');
  const [totalBudget, setTotalBudget] = useState('15000');
  const [currency, setCurrency] = useState('$');
  const [vibe, setVibe] = useState<EventVibe>('elegant');
  const [specialRequests, setSpecialRequests] = useState('');

  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const eventTypes: { type: EventType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'wedding',
      label: 'Wedding Celebration',
      desc: 'Ceremony, reception dinner, vows, florals, photography & toasts',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
    },
    {
      type: 'birthday',
      label: 'Birthday Milestone',
      desc: 'Themed parties, milestone birthdays, dynamic music & activities',
      icon: <Cake className="w-5 h-5 text-amber-400" />,
    },
    {
      type: 'community',
      label: 'Community Event / Festival',
      desc: 'Town fairs, charity runs, local concerts, block parties & permits',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
    },
    {
      type: 'corporate',
      label: 'Corporate & Milestone Gala',
      desc: 'Product launches, annual retreats, award galas & team summits',
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
    },
  ];

  const vibes: { id: EventVibe; label: string; previewColor: string }[] = [
    { id: 'elegant', label: 'Elegant & Luxe', previewColor: '#D4AF37' },
    { id: 'rustic', label: 'Rustic & Natural', previewColor: '#879782' },
    { id: 'modern', label: 'Modern Minimalist', previewColor: '#06B6D4' },
    { id: 'bohemian', label: 'Bohemian & Free', previewColor: '#C86D51' },
    { id: 'festive', label: 'Vibrant & Festive', previewColor: '#FF6B6B' },
    { id: 'casual', label: 'Casual & Relaxed', previewColor: '#3B82F6' },
    { id: 'futuristic', label: 'Neon & Futuristic', previewColor: '#A855F7' },
    { id: 'vintage', label: 'Vintage Nostalgia', previewColor: '#C5A059' },
    { id: 'cozy', label: 'Warm & Cozy', previewColor: '#D97706' },
  ];

  const handleSelectType = (type: EventType) => {
    setEventType(type);
    if (!title) {
      if (type === 'wedding') setTitle('Dream Garden & Sunset Wedding');
      else if (type === 'birthday') setTitle('Milestone Birthday Extravaganza');
      else if (type === 'community') setTitle('Annual Neighborhood Autumn Fest');
      else setTitle('Grand Annual Gala Celebration');
    }
    if (!location) {
      if (type === 'wedding') setLocation('Grand Botanical Pavilion, Napa Valley');
      else if (type === 'birthday') setLocation('Rooftop Lounge & Terrace, Austin');
      else if (type === 'community') setLocation('Central City Park & Plaza');
      else setLocation('Metropolitan Arts Center');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const steps = [
      'Synthesizing event persona & aesthetic requirements...',
      'Allocating balanced budget categories & contingency reserves...',
      'Mapping chronological milestones from months out to day-of...',
      'Assembling vetted vendor questions and checklists...',
      'Crafting personalized themes and signature ideas...',
    ];

    let stepIndex = 0;
    setGenerationStepMessage(steps[0]);
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStepMessage(steps[stepIndex]);
    }, 1500);

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `${eventType.toUpperCase()} Celebration`,
          type: eventType,
          vibe,
          date,
          location: location || 'To Be Determined',
          guestCount: Number(guestCount) || 50,
          totalBudget: Number(totalBudget) || 5000,
          currency,
          specialRequests,
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.plan) {
        safeConfetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
        });
        onPlanCreated(data.plan);
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
      clearInterval(interval);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative my-8 focus:outline-none"
      >
        {/* Close Button */}
        {!isGenerating && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-sm cursor-pointer p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ✕
          </button>
        )}

        {isGenerating ? (
          <div className="py-16 text-center space-y-6" aria-live="polite">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Designing Your Master Event Plan
              </h3>
              <p className="text-sm text-indigo-300 font-medium">
                {generationStepMessage}
              </p>
              <p className="text-xs text-slate-400">
                Powered by Gemini with structured schemas
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                  AI Planning Wizard
                </span>
                <span className="text-xs text-slate-300">Step {step} of 3</span>
              </div>
              <h2 id="wizard-modal-title" className="text-2xl font-extrabold text-white">
                {step === 1 && 'Choose Your Celebration Vertical'}
                {step === 2 && 'Event Logistics & Budget Target'}
                {step === 3 && 'Aesthetic Vibe & Personal Touches'}
              </h2>
            </div>

            {/* STEP 1: Event Type */}
            {step === 1 && (
              <div className="space-y-3">
                <div role="radiogroup" aria-label="Celebration Type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eventTypes.map((et) => {
                    const isSelected = eventType === et.type;
                    return (
                      <button
                        type="button"
                        key={et.type}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectType(et.type)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                            {et.icon}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{et.label}</div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{et.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Next: Logistics & Budget</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Logistics & Budget */}
            {step === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label htmlFor="wizard-title-input" className="block text-slate-200 font-semibold mb-1">
                    Celebration Title *
                  </label>
                  <input
                    id="wizard-title-input"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Maya & Leo's Vineyard Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wizard-date-input" className="block text-slate-200 font-semibold mb-1">
                      Event Date *
                    </label>
                    <input
                      id="wizard-date-input"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="wizard-guest-count-input" className="block text-slate-200 font-semibold mb-1">
                      Target Guest Count (1-5000) *
                    </label>
                    <input
                      id="wizard-guest-count-input"
                      type="number"
                      min="1"
                      max="5000"
                      required
                      placeholder="100"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wizard-location-input" className="block text-slate-200 font-semibold mb-1">
                    City / Venue Location *
                  </label>
                  <input
                    id="wizard-location-input"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="e.g. Monterey Bay Seaside Lawn, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label htmlFor="wizard-currency-select" className="block text-slate-200 font-semibold mb-1">
                      Currency
                    </label>
                    <select
                      id="wizard-currency-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="$">USD ($)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                      <option value="₹">INR (₹)</option>
                      <option value="C$">CAD (C$)</option>
                      <option value="A$">AUD (A$)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="wizard-budget-input" className="block text-slate-200 font-semibold mb-1">
                      Total Target Budget ({currency}) *
                    </label>
                    <input
                      id="wizard-budget-input"
                      type="number"
                      min="100"
                      required
                      placeholder="20000"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition"
                  >
                    <span>Next: Vibe & Aesthetics</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Vibe & Special Requests */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <div id="vibe-group-label" className="block text-slate-200 font-semibold mb-2">
                    Select Aesthetic / Atmosphere *
                  </div>
                  <div role="radiogroup" aria-labelledby="vibe-group-label" className="grid grid-cols-3 gap-2">
                    {vibes.map((v) => {
                      const isSelected = vibe === v.id;
                      return (
                        <button
                          type="button"
                          key={v.id}
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setVibe(v.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: v.previewColor }}
                          />
                          <span className="truncate">{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="wizard-special-requests" className="block text-slate-200 font-semibold mb-1">
                    Special Requests, Dietary Constraints or Specific Ideas
                  </label>
                  <textarea
                    id="wizard-special-requests"
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Vegetarian/Vegan dinner requirement, outdoor lawn ceremony, live acoustic band, sparkler sendoff, sustainable zero-waste favors..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xl shadow-indigo-600/30 transition"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                    <span>Generate AI Master Plan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
