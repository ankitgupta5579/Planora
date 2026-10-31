import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { exportPlanAsJson, exportPlanAsMarkdown } from '../utils/storage';
import { useFocusTrap } from '../utils/useFocusTrap';
import { Copy, Check, Printer, FileCode, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, plan }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const markdownContent = exportPlanAsMarkdown(plan);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 id="export-modal-title" className="text-xl font-bold text-white">
              Export & Share Event Plan
            </h3>
            <p className="text-xs text-slate-300">Share with family, vendors, and coordinators</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => exportPlanAsJson(plan)}
            aria-label="Download complete plan as JSON file"
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Download JSON</div>
              <div className="text-xs text-slate-200">Complete raw backup data</div>
            </div>
          </button>

          <button
            onClick={handleCopyMarkdown}
            aria-label="Copy formatted markdown summary to clipboard"
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="p-2.5 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-105 transition">
              {copiedMd ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {copiedMd ? 'Copied to Clipboard!' : 'Copy Markdown'}
              </div>
              <div className="text-xs text-slate-200">Formatted summary notes</div>
            </div>
          </button>

          <button
            onClick={handlePrint}
            aria-label="Open print view or save as PDF"
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Print / Save PDF</div>
              <div className="text-xs text-slate-200">Printer-ready layout</div>
            </div>
          </button>
        </div>

        {/* Markdown Preview */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <label
            htmlFor="markdown-export-preview"
            className="block text-xs font-semibold text-slate-200 uppercase tracking-wider"
          >
            Markdown Document Preview
          </label>
          <textarea
            id="markdown-export-preview"
            readOnly
            rows={12}
            value={markdownContent}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
