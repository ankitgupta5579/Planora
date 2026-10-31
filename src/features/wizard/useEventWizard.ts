import { useState } from 'react';
import { EventPlan, EventType, EventVibe } from '../../types/event';
import { generateHeuristicEventPlan } from '../../utils/fallbackGenerator';
import { safeConfetti } from '../../utils/motion';

export interface UseEventWizardProps {
  onClose: () => void;
  onPlanCreated: (plan: EventPlan) => void;
}

/**
 * Custom hook to manage EventWizardModal state, navigation, and AI generation.
 */
export function useEventWizard({ onClose, onPlanCreated }: UseEventWizardProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepMessage, setGenerationStepMessage] = useState('');

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('Dream Garden & Sunset Wedding');
  const [date, setDate] = useState('2026-12-15');
  const [location, setLocation] = useState('Grand Botanical Pavilion, Napa Valley');
  const [guestCount, setGuestCount] = useState('100');
  const [totalBudget, setTotalBudget] = useState('15000');
  const [currency, setCurrency] = useState('$');
  const [vibe, setVibe] = useState<EventVibe>('elegant');
  const [specialRequests, setSpecialRequests] = useState('');

  const resetForm = () => {
    setStep(1);
    setIsGenerating(false);
    setGenerationStepMessage('');
    setEventType('wedding');
    setTitle('Dream Garden & Sunset Wedding');
    setDate('2026-12-15');
    setLocation('Grand Botanical Pavilion, Napa Valley');
    setGuestCount('100');
    setTotalBudget('15000');
    setCurrency('$');
    setVibe('elegant');
    setSpecialRequests('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;
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

    const planPayload = {
      title: title.trim() || `${eventType.toUpperCase()} Celebration`,
      type: eventType,
      vibe,
      date: date || '2026-12-15',
      location: location.trim() || 'Grand Celebration Venue',
      guestCount: Math.max(1, Number(guestCount) || 50),
      totalBudget: Math.max(100, Number(totalBudget) || 5000),
      currency: currency || '$',
      specialRequests: specialRequests.trim(),
    };

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planPayload),
      });

      const data = await res.json();
      clearInterval(interval);

      const resolvedPlan: EventPlan = data?.plan || generateHeuristicEventPlan(planPayload);

      safeConfetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      onPlanCreated(resolvedPlan);
      handleClose();
    } catch {
      clearInterval(interval);

      const fallbackPlan = generateHeuristicEventPlan(planPayload);
      safeConfetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      onPlanCreated(fallbackPlan);
      handleClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    step,
    setStep,
    isGenerating,
    generationStepMessage,
    eventType,
    handleSelectType,
    title,
    setTitle,
    date,
    setDate,
    location,
    setLocation,
    guestCount,
    setGuestCount,
    totalBudget,
    setTotalBudget,
    currency,
    setCurrency,
    vibe,
    setVibe,
    specialRequests,
    setSpecialRequests,
    handleClose,
    handleSubmit,
  };
}
