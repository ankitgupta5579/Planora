import { useState } from 'react';
import { EventPlan, VendorItem } from '../../types/event';
import { calculateVendorFinancials } from '../../utils/eventCalculators';

export interface UseVendorsProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export function useVendors({ plan, onUpdatePlan }: UseVendorsProps) {
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

  const financials = calculateVendorFinancials(plan.vendors);

  const filteredVendors = plan.vendors.filter((v) => {
    if (selectedStatus === 'all') return true;
    return v.status === selectedStatus;
  });

  const handleOpenAdd = () => {
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
    setFormChecklistRaw('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (vendor: VendorItem) => {
    setEditVendor(vendor);
    setFormCategory(vendor.category);
    setFormName(vendor.name);
    setFormContactName(vendor.contactName || '');
    setFormPhone(vendor.phone || '');
    setFormEmail(vendor.email || '');
    setFormQuote(vendor.quoteAmount.toString());
    setFormDeposit(vendor.depositPaid.toString());
    setFormStatus(vendor.status);
    setFormNotes(vendor.notes || '');
    setFormChecklistRaw(vendor.checklist ? vendor.checklist.join('\n') : '');
    setShowAddModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim()) return;

    const checklist = formChecklistRaw
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const quoteAmount = parseFloat(formQuote) || 0;
    const depositPaid = parseFloat(formDeposit) || 0;

    let updatedVendors: VendorItem[];

    if (editVendor) {
      updatedVendors = plan.vendors.map((v) =>
        v.id === editVendor.id
          ? {
              ...v,
              category: formCategory.trim(),
              name: formName.trim(),
              contactName: formContactName.trim() || undefined,
              phone: formPhone.trim() || undefined,
              email: formEmail.trim() || undefined,
              quoteAmount,
              depositPaid,
              status: formStatus,
              notes: formNotes.trim() || undefined,
              checklist,
            }
          : v
      );
    } else {
      const newVendor: VendorItem = {
        id: 'v-' + Date.now(),
        category: formCategory.trim(),
        name: formName.trim(),
        contactName: formContactName.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        quoteAmount,
        depositPaid,
        status: formStatus,
        notes: formNotes.trim() || undefined,
        checklist,
      };
      updatedVendors = [...plan.vendors, newVendor];
    }

    onUpdatePlan({ ...plan, vendors: updatedVendors });
    setShowAddModal(false);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = plan.vendors.filter((v) => v.id !== id);
    onUpdatePlan({ ...plan, vendors: updated });
  };

  const handleToggleChecklist = (vendorId: string, itemIdx: number) => {
    const updated = plan.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      const currentList = [...(v.checklist || [])];
      const target = currentList[itemIdx];
      if (!target) return v;

      if (target.startsWith('[x] ')) {
        currentList[itemIdx] = target.replace('[x] ', '');
      } else {
        currentList[itemIdx] = `[x] ${target}`;
      }

      return { ...v, checklist: currentList };
    });

    onUpdatePlan({ ...plan, vendors: updated });
  };

  const handleGenerateInquiryEmail = async (vendor: VendorItem) => {
    setInquiryModalVendor(vendor);
    setIsGeneratingEmail(true);
    setCopiedEmail(false);
    setInquiryEmailText('');

    try {
      const res = await fetch('/api/ai/vendor-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: {
            name: vendor.name,
            category: vendor.category,
            contactName: vendor.contactName,
            quoteAmount: vendor.quoteAmount,
          },
          event: {
            title: plan.title,
            type: plan.type,
            date: plan.date,
            location: plan.location,
            guestCount: plan.guestCount,
            currency: plan.currency,
          },
        }),
      });

      const data = await res.json();
      setInquiryEmailText(data.email || 'Draft could not be generated.');
    } catch {
      setInquiryEmailText(
        `Subject: Inquiry regarding ${vendor.category} services for ${plan.title}\n\nDear ${vendor.contactName || vendor.name},\n\nWe are currently planning ${plan.title} on ${plan.date} in ${plan.location} and would love to inquire about your availability and package pricing.\n\nWarm regards,\nEvent Planning Team`
      );
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(inquiryEmailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return {
    selectedStatus,
    setSelectedStatus,
    showAddModal,
    setShowAddModal,
    editVendor,
    inquiryModalVendor,
    setInquiryModalVendor,
    inquiryEmailText,
    setInquiryEmailText,
    isGeneratingEmail,
    copiedEmail,
    formCategory,
    setFormCategory,
    formName,
    setFormName,
    formContactName,
    setFormContactName,
    formPhone,
    setFormPhone,
    formEmail,
    setFormEmail,
    formQuote,
    setFormQuote,
    formDeposit,
    setFormDeposit,
    formStatus,
    setFormStatus,
    formNotes,
    setFormNotes,
    formChecklistRaw,
    setFormChecklistRaw,
    financials,
    filteredVendors,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveVendor,
    handleDeleteVendor,
    handleToggleChecklist,
    handleGenerateInquiryEmail,
    handleCopyEmail,
  };
}
