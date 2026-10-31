import React from 'react';
import { VendorItem } from '../../types/event';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { Sparkles, RefreshCw, Check, Copy, Send } from 'lucide-react';

export interface VendorInquiryModalProps {
  vendor: VendorItem | null;
  onClose: () => void;
  isGenerating: boolean;
  emailText: string;
  setEmailText: (val: string) => void;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: (vendor: VendorItem) => void;
  eventTitle: string;
}

/**
 * Accessible AI Inquiry Email modal dialog for drafting and copying vendor inquiry letters.
 */
export const VendorInquiryModal: React.FC<VendorInquiryModalProps> = ({
  vendor,
  onClose,
  isGenerating,
  emailText,
  setEmailText,
  copied,
  onCopy,
  onRegenerate,
  eventTitle,
}) => {
  const modalRef = useFocusTrap(Boolean(vendor), onClose);

  if (!vendor) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 focus:outline-none relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 id="inquiry-modal-title" className="text-base font-bold text-white">
              AI Inquiry Email Draft: {vendor.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white text-xs cursor-pointer p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ✕ Close
          </button>
        </div>

        {isGenerating ? (
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
                <label
                  htmlFor="inquiry-email-textarea"
                  className="block text-xs font-semibold text-slate-200"
                >
                  Email Draft Content:
                </label>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Complete ready-to-send draft (
                  {emailText ? emailText.split(/\s+/).filter(Boolean).length : 0} words)
                </span>
              </div>
              <textarea
                id="inquiry-email-textarea"
                rows={15}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Ready to send to {vendor.email || 'vendor'}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRegenerate(vendor)}
                  aria-label="Regenerate inquiry email"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={onCopy}
                  aria-label="Copy inquiry email draft to clipboard"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copied ? (
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
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}?subject=${encodeURIComponent(
                      `Inquiry regarding ${vendor.category} for ${eventTitle}`
                    )}&body=${encodeURIComponent(emailText)}`}
                    aria-label={`Open email client to send to ${vendor.email}`}
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
  );
};
