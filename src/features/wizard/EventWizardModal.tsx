import React from 'react';
import { EventPlan } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { Sparkles } from 'lucide-react';
import { useEventWizard } from './useEventWizard';
import { WizardStep1Type } from './WizardStep1Type';
import { WizardStep2Logistics } from './WizardStep2Logistics';
import { WizardStep3Vibe } from './WizardStep3Vibe';

export interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: EventPlan) => void;
}

/**
 * Event Creation Wizard Modal composed of 3 modular steps.
 */
export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const {
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
  } = useEventWizard({ onClose, onPlanCreated });

  const modalRef = useFocusTrap(isOpen, handleClose);

  if (!isOpen) return null;

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
            onClick={handleClose}
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
              <h3 className="text-xl font-bold text-white">Designing Your Master Event Plan</h3>
              <p className="text-sm text-indigo-300 font-medium">{generationStepMessage}</p>
              <p className="text-xs text-slate-400">Powered by Planora with structured schemas</p>
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

            {/* STEP 1 */}
            {step === 1 && (
              <WizardStep1Type
                eventType={eventType}
                onSelectType={handleSelectType}
                onNext={() => setStep(2)}
              />
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <WizardStep2Logistics
                title={title}
                setTitle={setTitle}
                date={date}
                setDate={setDate}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                location={location}
                setLocation={setLocation}
                currency={currency}
                setCurrency={setCurrency}
                totalBudget={totalBudget}
                setTotalBudget={setTotalBudget}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <WizardStep3Vibe
                vibe={vibe}
                setVibe={setVibe}
                specialRequests={specialRequests}
                setSpecialRequests={setSpecialRequests}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isGenerating={isGenerating}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
