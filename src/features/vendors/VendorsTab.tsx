import React from 'react';
import { EventPlan, VendorItem } from '../../types/event';
import { useVendors } from './useVendors';
import { VendorCard } from './VendorCard';
import { VendorModal } from './VendorModal';
import { VendorInquiryModal } from './VendorInquiryModal';
import { Plus } from 'lucide-react';

export interface VendorsTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

const STATUS_TABS: { id: VendorItem['status'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Vendors' },
  { id: 'researching', label: 'Researching' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'booked', label: 'Booked' },
  { id: 'contract_signed', label: 'Contract Signed' },
  { id: 'declined', label: 'Declined' },
];

const MODAL_STATUSES: { id: VendorItem['status']; label: string }[] = [
  { id: 'researching', label: 'Researching' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'booked', label: 'Booked' },
  { id: 'contract_signed', label: 'Contract Signed' },
  { id: 'declined', label: 'Declined' },
];

/**
 * Vendors and supplier management tab for tracking contracts, quotes, deposits, and AI inquiries.
 */
export const VendorsTab: React.FC<VendorsTabProps> = ({ plan, onUpdatePlan }) => {
  const vendorsState = useVendors({ plan, onUpdatePlan });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Confirmed Team
          </span>
          <div className="text-2xl font-bold text-white">
            {vendorsState.financials.bookedCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {vendorsState.financials.totalCount} vendors booked
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${
                  vendorsState.financials.totalCount > 0
                    ? (vendorsState.financials.bookedCount / vendorsState.financials.totalCount) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Contract Value
          </span>
          <div className="text-2xl font-bold text-white">
            {plan.currency}
            {vendorsState.financials.totalQuotes.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">All vendor quotes combined</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Deposits Committed
          </span>
          <div className="text-2xl font-bold text-emerald-400">
            {plan.currency}
            {vendorsState.financials.totalDepositsPaid.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">Paid out to date</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Remaining Balances
          </span>
          <div className="text-2xl font-bold text-amber-400">
            {plan.currency}
            {vendorsState.financials.totalRemainingBalance.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">Due prior to / day-of event</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div
          role="tablist"
          tabIndex={0}
          aria-label="Filter vendors by status"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
        >
          {STATUS_TABS.map((tab) => {
            const count =
              tab.id === 'all'
                ? plan.vendors.length
                : plan.vendors.filter((v) => v.status === tab.id).length;
            const isActive = vendorsState.selectedStatus === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => vendorsState.setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Add Vendor Button */}
        <button
          type="button"
          onClick={vendorsState.handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendors Grid */}
      {vendorsState.filteredVendors.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <p className="text-sm text-slate-300 font-medium">No vendors found in this view.</p>
          <button
            type="button"
            onClick={vendorsState.handleOpenAdd}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Add your first vendor for this status
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorsState.filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              currency={plan.currency}
              onOpenEdit={vendorsState.handleOpenEdit}
              onDelete={vendorsState.handleDeleteVendor}
              onToggleChecklist={vendorsState.handleToggleChecklist}
              onGenerateInquiryEmail={vendorsState.handleGenerateInquiryEmail}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <VendorModal
        isOpen={vendorsState.showAddModal}
        onClose={() => vendorsState.setShowAddModal(false)}
        onSubmit={vendorsState.handleSaveVendor}
        isEdit={Boolean(vendorsState.editVendor)}
        currency={plan.currency}
        statuses={MODAL_STATUSES}
        formCategory={vendorsState.formCategory}
        setFormCategory={vendorsState.setFormCategory}
        formName={vendorsState.formName}
        setFormName={vendorsState.setFormName}
        formContactName={vendorsState.formContactName}
        setFormContactName={vendorsState.setFormContactName}
        formPhone={vendorsState.formPhone}
        setFormPhone={vendorsState.setFormPhone}
        formEmail={vendorsState.formEmail}
        setFormEmail={vendorsState.setFormEmail}
        formQuote={vendorsState.formQuote}
        setFormQuote={vendorsState.setFormQuote}
        formDeposit={vendorsState.formDeposit}
        setFormDeposit={vendorsState.setFormDeposit}
        formStatus={vendorsState.formStatus}
        setFormStatus={vendorsState.setFormStatus}
        formChecklistRaw={vendorsState.formChecklistRaw}
        setFormChecklistRaw={vendorsState.setFormChecklistRaw}
        formNotes={vendorsState.formNotes}
        setFormNotes={vendorsState.setFormNotes}
      />

      {/* AI Vendor Inquiry Modal */}
      <VendorInquiryModal
        vendor={vendorsState.inquiryModalVendor}
        onClose={() => vendorsState.setInquiryModalVendor(null)}
        isGenerating={vendorsState.isGeneratingEmail}
        emailText={vendorsState.inquiryEmailText}
        setEmailText={vendorsState.setInquiryEmailText}
        copied={vendorsState.copiedEmail}
        onCopy={vendorsState.handleCopyEmail}
        onRegenerate={vendorsState.handleGenerateInquiryEmail}
        eventTitle={plan.title}
      />
    </div>
  );
};
