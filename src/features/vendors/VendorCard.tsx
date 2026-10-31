import React from 'react';
import { VendorItem } from '../../types/event';
import {
  Phone,
  Mail,
  CheckSquare,
  Square,
  Sparkles,
  Trash2,
} from 'lucide-react';

export interface VendorCardProps {
  vendor: VendorItem;
  currency: string;
  onOpenEdit: (vendor: VendorItem) => void;
  onDelete: (id: string) => void;
  onToggleChecklist: (vendorId: string, itemIdx: number) => void;
  onGenerateInquiryEmail: (vendor: VendorItem) => void;
}

const STATUS_LABELS: Record<VendorItem['status'], { label: string; badgeClass: string }> = {
  researching: { label: 'Researching', badgeClass: 'bg-slate-700 text-slate-300' },
  contacted: { label: 'Contacted', badgeClass: 'bg-blue-500/20 text-blue-300' },
  booked: { label: 'Booked', badgeClass: 'bg-emerald-500/20 text-emerald-300' },
  contract_signed: { label: 'Contract Signed', badgeClass: 'bg-purple-500/20 text-purple-300' },
  declined: { label: 'Declined', badgeClass: 'bg-rose-500/20 text-rose-300' },
};

/**
 * Renders an individual vendor card with contact details, financial breakdown,
 * interactive checklist, and AI inquiry trigger.
 */
export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  currency,
  onOpenEdit,
  onDelete,
  onToggleChecklist,
  onGenerateInquiryEmail,
}) => {
  const statusInfo = STATUS_LABELS[vendor.status] || STATUS_LABELS.researching;
  const remaining = Math.max(0, vendor.quoteAmount - vendor.depositPaid);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between shadow-sm">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {vendor.category}
            </span>
            <h3 className="text-base font-bold text-white mt-1.5">{vendor.name}</h3>
            {vendor.contactName && (
              <p className="text-xs text-slate-300 font-medium">Rep: {vendor.contactName}</p>
            )}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Contact info */}
        {(vendor.phone || vendor.email) && (
          <div className="flex flex-wrap gap-3 text-xs text-slate-300 pt-1 border-t border-slate-800/60">
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                className="inline-flex items-center gap-1 hover:text-white transition"
              >
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                <span>{vendor.phone}</span>
              </a>
            )}
            {vendor.email && (
              <a
                href={`mailto:${vendor.email}`}
                className="inline-flex items-center gap-1 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-300" />
                <span className="truncate max-w-[160px]">{vendor.email}</span>
              </a>
            )}
          </div>
        )}

        {/* Pricing breakdown */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-300 block">Agreed Quote</span>
            <span className="font-bold text-white text-sm">
              {currency}
              {vendor.quoteAmount.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-300 block">Deposit Paid</span>
            <span className="font-semibold text-emerald-400 text-sm">
              {currency}
              {vendor.depositPaid.toLocaleString()}
            </span>
          </div>
          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-slate-300 block">Balance</span>
            <span
              className={`font-semibold text-sm ${remaining > 0 ? 'text-amber-400' : 'text-slate-300'}`}
            >
              {currency}
              {remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Checklist */}
        {vendor.checklist && vendor.checklist.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Deliverables & Requirements
            </span>
            <div className="space-y-1">
              {vendor.checklist.map((item, idx) => {
                const isChecked = item.startsWith('[x] ');
                const label = isChecked ? item.replace('[x] ', '') : item;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onToggleChecklist(vendor.id, idx)}
                    className="w-full text-left flex items-start gap-2 text-xs py-0.5 cursor-pointer text-slate-300 hover:text-white group"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={isChecked ? 'line-through text-slate-300' : ''}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {vendor.notes && (
          <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 italic">
            &ldquo;{vendor.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => onGenerateInquiryEmail(vendor)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Draft Email</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenEdit(vendor)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(vendor.id)}
            aria-label={`Delete ${vendor.name}`}
            className="p-1 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
