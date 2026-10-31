import React, { useState } from 'react';
import { EventPlan, VendorItem } from '../types/event';
import { calculateVendorFinancials } from '../utils/eventCalculators';
import { useFocusTrap } from '../utils/useFocusTrap';
import { 
  Phone, 
  Mail, 
  CheckSquare, 
  Square, 
  Plus, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  X,
  RefreshCw 
} from 'lucide-react';

interface VendorsTabProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({ plan, onUpdatePlan }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorItem | null>(null);

  // AI Inquiry Email state
  const [inquiryModalVendor, setInquiryModalVendor] = useState<VendorItem | null>(null);
  const [inquiryEmailText, setInquiryEmailText] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formName, setFormName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formDeposit, setFormDeposit] = useState('');
  const [formStatus, setFormStatus] = useState<VendorItem['status']>('researching');
  const [formNotes, setFormNotes] = useState('');
  const [formChecklistRaw, setFormChecklistRaw] = useState('');

  const vendorModalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));
  const inquiryModalRef = useFocusTrap(Boolean(inquiryModalVendor), () => setInquiryModalVendor(null));

  const financials = calculateVendorFinancials(plan.vendors);

  const statuses: { id: VendorItem['status']; label: string }[] = [
    { id: 'researching', label: 'Researching' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'booked', label: 'Booked' },
    { id: 'contract_signed', label: 'Contract Signed' },
    { id: 'declined', label: 'Declined' },
  ];

  const getStatusSelectStyle = (status: VendorItem['status']) => {
    switch (status) {
      case 'contract_signed':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50';
      case 'booked':
        return 'bg-indigo-950/50 text-indigo-300 border-indigo-500/50';
      case 'contacted':
        return 'bg-amber-950/50 text-amber-300 border-amber-500/50';
      case 'declined':
        return 'bg-rose-950/50 text-rose-300 border-rose-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleToggleChecklistItem = (vendorId: string, itemIdx: number) => {
    const updated = plan.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      const list = [...v.checklist];
      const current = list[itemIdx];
      if (current.startsWith('[x] ')) {
        list[itemIdx] = current.replace('[x] ', '');
      } else {
        list[itemIdx] = '[x] ' + current;
      }
      return { ...v, checklist: list };
    });
    onUpdatePlan({ ...plan, vendors: updated, updatedAt: new Date().toISOString() });
  };

  const handleUpdateStatus = (vendorId: string, newStatus: VendorItem['status']) => {
    const updated = plan.vendors.map((v) =>
      v.id === vendorId ? { ...v, status: newStatus } : v
    );
    onUpdatePlan({ ...plan, vendors: updated, updatedAt: new Date().toISOString() });
  };

  const handleDeleteVendor = (id: string) => {
    const updated = plan.vendors.filter((v) => v.id !== id);
    onUpdatePlan({ ...plan, vendors: updated, updatedAt: new Date().toISOString() });
  };

  const openAddModal = () => {
    setEditVendor(null);
    setFormCategory('');
    setFormName('');
    setFormContactName('');
    setFormPhone('');
    setFormEmail('');
    setFormQuote('');
    setFormDeposit('');
    setFormStatus('researching');
    setFormNotes('');
    setFormChecklistRaw('Review package quote\nSchedule initial consultation\nConfirm date availability');
    setShowAddModal(true);
  };

  const openEditModal = (vendor: VendorItem) => {
    setEditVendor(vendor);
    setFormCategory(vendor.category);
    setFormName(vendor.name);
    setFormContactName(vendor.contactName || '');
    setFormPhone(vendor.phone || '');
    setFormEmail(vendor.email || '');
    setFormQuote(String(vendor.quoteAmount));
    setFormDeposit(String(vendor.depositPaid));
    setFormStatus(vendor.status);
    setFormNotes(vendor.notes || '');
    setFormChecklistRaw((vendor.checklist || []).join('\n'));
    setShowAddModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim()) return;

    const checklist = formChecklistRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editVendor) {
      const updated = plan.vendors.map((v) =>
        v.id === editVendor.id
          ? {
              ...v,
              category: formCategory.trim(),
              name: formName.trim(),
              contactName: formContactName.trim(),
              phone: formPhone.trim(),
              email: formEmail.trim(),
              quoteAmount: Math.max(0, Number(formQuote) || 0),
              depositPaid: Math.max(0, Number(formDeposit) || 0),
              status: formStatus,
              notes: formNotes.trim(),
              checklist,
            }
          : v
      );
      onUpdatePlan({ ...plan, vendors: updated, updatedAt: new Date().toISOString() });
    } else {
      const newVendor: VendorItem = {
        id: 'v-' + Date.now(),
        category: formCategory.trim(),
        name: formName.trim(),
        contactName: formContactName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        quoteAmount: Math.max(0, Number(formQuote) || 0),
        depositPaid: Math.max(0, Number(formDeposit) || 0),
        status: formStatus,
        notes: formNotes.trim(),
        checklist,
      };
      onUpdatePlan({ ...plan, vendors: [...plan.vendors, newVendor], updatedAt: new Date().toISOString() });
    }

    setShowAddModal(false);
  };

  const handleGenerateInquiry = async (vendor: VendorItem) => {
    setInquiryModalVendor(vendor);
    setIsGeneratingEmail(true);
    setCopiedEmail(false);

    try {
      const res = await fetch('/api/ai/vendor-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor, event: plan }),
      });
      const data = await res.json();
      setInquiryEmailText(data.email || 'Error generating email.');
    } catch {
      setInquiryEmailText(`Subject: Inquiry regarding ${vendor.category} services for ${plan.title}\n\nHi ${vendor.name},\nWe would love to discuss availability for our event on ${plan.date}!`);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const copyInquiryEmail = () => {
    navigator.clipboard.writeText(inquiryEmailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const filteredVendors = plan.vendors.filter((v) => {
    if (selectedStatus === 'all') return true;
    return v.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      {/* Financials Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Total Vendor Quotes
          </div>
          <div className="text-2xl font-bold text-white">
            {plan.currency}{financials.totalQuotes.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {financials.totalCount} vendors tracked
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Deposits Paid
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {plan.currency}{financials.totalDepositsPaid.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Secured with contracts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Outstanding Balance
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {plan.currency}{financials.totalRemainingBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Due before or day-of</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Booked or signed
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {financials.bookedCount} / {financials.totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Confirmed vendors</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Filter vendors by status" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedStatus('all')}
            role="radio"
            aria-checked={selectedStatus === 'all'}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selectedStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Vendors ({plan.vendors.length})
          </button>
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              role="radio"
              aria-checked={selectedStatus === s.id}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                selectedStatus === s.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {s.label} ({plan.vendors.filter((v) => v.status === s.id).length})
            </button>
          ))}
        </div>

        <button
          onClick={openAddModal}
          aria-label="Add new vendor"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
            No vendors under this status filter.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const balance = Math.max(0, vendor.quoteAmount - vendor.depositPaid);

            return (
              <div
                key={vendor.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-slate-800 text-indigo-200 border border-slate-700">
                      {vendor.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{vendor.name}</h3>
                    {vendor.contactName && (
                      <p className="text-xs text-slate-300 font-medium">
                        Rep: {vendor.contactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`vendor-status-${vendor.id}`} className="sr-only">
                      Status for {vendor.name}
                    </label>
                    <select
                      id={`vendor-status-${vendor.id}`}
                      value={vendor.status}
                      onChange={(e) => handleUpdateStatus(vendor.id, e.target.value as VendorItem['status'])}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition ${getStatusSelectStyle(
                        vendor.status
                      )}`}
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Links */}
                {(vendor.phone || vendor.email) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        aria-label={`Call ${vendor.name} at ${vendor.phone}`}
                        className="flex items-center gap-1 hover:text-indigo-400 transition"
                      >
                        <Phone className="w-3 h-3 text-indigo-400" />
                        <span>{vendor.phone}</span>
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        aria-label={`Email ${vendor.name} at ${vendor.email}`}
                        className="flex items-center gap-1 hover:text-indigo-400 transition"
                      >
                        <Mail className="w-3 h-3 text-pink-400" />
                        <span>{vendor.email}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-800/50 text-xs">
                  <div>
                    <span className="text-xs text-slate-300 uppercase">Quote</span>
                    <div className="font-semibold text-slate-100">
                      {plan.currency}{vendor.quoteAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 uppercase">Deposit</span>
                    <div className="font-semibold text-emerald-400">
                      {plan.currency}{vendor.depositPaid.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 uppercase">Balance</span>
                    <div className="font-semibold text-amber-400">
                      {plan.currency}{balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                {vendor.checklist && vendor.checklist.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Action Checklist
                    </span>
                    <div className="space-y-1">
                      {vendor.checklist.map((item, idx) => {
                        const isDone = item.startsWith('[x] ');
                        const label = isDone ? item.replace('[x] ', '') : item;

                        return (
                          <button
                            type="button"
                            key={idx}
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={`Checklist task: ${label}`}
                            onClick={() => handleToggleChecklistItem(vendor.id, idx)}
                            className="w-full flex items-center gap-2 text-xs text-left text-slate-300 hover:text-white cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded py-0.5"
                          >
                            {isDone ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className={isDone ? 'line-through text-slate-400' : ''}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => handleGenerateInquiry(vendor)}
                    aria-label={`Draft AI inquiry email for ${vendor.name}`}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Draft Inquiry Email</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(vendor)}
                      aria-label={`Edit vendor details for ${vendor.name}`}
                      className="text-slate-300 hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                      aria-label={`Delete vendor: ${vendor.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vendor-modal-title"
        >
          <div
            ref={vendorModalRef}
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto focus:outline-none relative"
          >
            <div className="flex items-center justify-between">
              <h3 id="vendor-modal-title" className="text-lg font-bold text-white">
                {editVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
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

            <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vendor-category-input" className="block text-slate-200 font-medium mb-1">
                    Category *
                  </label>
                  <input
                    id="vendor-category-input"
                    type="text"
                    required
                    placeholder="e.g. Catering, Photo, DJ"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-name-input" className="block text-slate-200 font-medium mb-1">
                    Company / Vendor Name *
                  </label>
                  <input
                    id="vendor-name-input"
                    type="text"
                    required
                    placeholder="e.g. Pacific Sound & Lights"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="vendor-contact-input" className="block text-slate-200 font-medium mb-1">
                    Contact Rep
                  </label>
                  <input
                    id="vendor-contact-input"
                    type="text"
                    placeholder="Marcus"
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-phone-input" className="block text-slate-200 font-medium mb-1">
                    Phone
                  </label>
                  <input
                    id="vendor-phone-input"
                    type="text"
                    placeholder="555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-email-input" className="block text-slate-200 font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="vendor-email-input"
                    type="email"
                    placeholder="sales@..."
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="vendor-quote-input" className="block text-slate-200 font-medium mb-1">
                    Quote ({plan.currency})
                  </label>
                  <input
                    id="vendor-quote-input"
                    type="number"
                    min="0"
                    placeholder="3000"
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-deposit-input" className="block text-slate-200 font-medium mb-1">
                    Deposit Paid
                  </label>
                  <input
                    id="vendor-deposit-input"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-status-modal-select" className="block text-slate-200 font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="vendor-status-modal-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorItem['status'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="vendor-checklist-textarea" className="block text-slate-200 font-medium mb-1">
                  Action Checklist (one item per line)
                </label>
                <textarea
                  id="vendor-checklist-textarea"
                  rows={3}
                  placeholder="Review quotes&#10;Verify insurance liability&#10;Pay deposit"
                  value={formChecklistRaw}
                  onChange={(e) => setFormChecklistRaw(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="vendor-notes-textarea" className="block text-slate-200 font-medium mb-1">
                  Notes & Scope Details
                </label>
                <textarea
                  id="vendor-notes-textarea"
                  rows={2}
                  placeholder="Includes delivery and 2 crew setup technicians."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                  {editVendor ? 'Save Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Vendor Inquiry Modal */}
      {inquiryModalVendor && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-modal-title"
        >
          <div
            ref={inquiryModalRef}
            tabIndex={-1}
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 id="inquiry-modal-title" className="text-base font-bold text-white">
                  AI Inquiry Email Draft: {inquiryModalVendor.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInquiryModalVendor(null)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                ✕ Close
              </button>
            </div>

            {isGeneratingEmail ? (
              <div className="py-12 text-center space-y-2" aria-live="polite">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300">
                  Planora is drafting a tailored vendor inquiry email...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="inquiry-email-textarea" className="block text-xs font-semibold text-slate-200">
                      Email Draft Content:
                    </label>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Complete ready-to-send draft ({inquiryEmailText ? inquiryEmailText.split(/\s+/).filter(Boolean).length : 0} words)
                    </span>
                  </div>
                  <textarea
                    id="inquiry-email-textarea"
                    rows={15}
                    value={inquiryEmailText}
                    onChange={(e) => setInquiryEmailText(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Ready to send to {inquiryModalVendor.email || 'vendor'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateInquiry(inquiryModalVendor)}
                      aria-label="Regenerate inquiry email"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={copyInquiryEmail}
                      aria-label="Copy inquiry email draft to clipboard"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                    {inquiryModalVendor.email && (
                      <a
                        href={`mailto:${inquiryModalVendor.email}?subject=${encodeURIComponent(
                          `Inquiry regarding ${inquiryModalVendor.category} for ${plan.title}`
                        )}&body=${encodeURIComponent(inquiryEmailText)}`}
                        aria-label={`Open email client to send to ${inquiryModalVendor.email}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Send className="w-3.5 h-3.5 text-pink-400" />
                        <span>Open in Mail</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
