import React, { useState, useEffect } from 'react';
import { GuestItem } from '../types/event';
import { parseCsvGuestList, CsvImportResult } from '../utils/csvGuestParser';
import { useFocusTrap } from '../utils/useFocusTrap';
import { safeConfetti } from '../utils/motion';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  Users,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGuests: GuestItem[];
  onImport: (newGuests: GuestItem[]) => void;
}

const SAMPLE_CSV = `Full Name,Email,Group,RSVP,Plus Ones,Dietary,Table
Dr. Evelyn Reed,evelyn.r@example.com,Family,Attending,1,Vegan,Table 1
Michael Chang,mchang@example.com,Friends,Attending,1,None,Table 2
Sarah Jenkins,sjenkins@example.com,Colleagues,Pending,0,Gluten-Free,Table 3
Robert Barnes,rbarnes@example.com,VIP,Attending,0,None,Table 1
Amanda Brooks,abrooks@example.com,Friends,Declined,0,Vegetarian,`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  existingGuests,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<CsvImportResult | null>(null);
  const modalRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setCsvText('');
      setParseResult(null);
    }
  }, [isOpen]);

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim().length > 0) {
      setParseResult(parseCsvGuestList(text, existingGuests));
    } else {
      setParseResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleTextChange(SAMPLE_CSV);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validCount === 0) return;

    onImport(parseResult.validGuests);
    safeConfetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Upload className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="csv-import-modal-title"
                className="text-lg font-bold text-white tracking-tight"
              >
                Import Guests via CSV
              </h2>
              <p className="text-xs text-slate-300">
                Bulk upload attendee lists with auto-mapping for RSVPs, dietary needs & seating.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close CSV Import Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="csv-file-input"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Choose .CSV File</span>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Paste Sample Template</span>
            </button>
          </div>

          <div className="space-y-1">
            <label htmlFor="csv-textarea" className="text-xs font-semibold text-slate-300">
              Or paste raw CSV text:
            </label>
            <textarea
              id="csv-textarea"
              rows={4}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Name, Email, Group, RSVP, Plus Ones, Dietary, Table&#10;Alice Smith, alice@example.com, Friends, Attending, 1, Vegetarian, Table 1"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Preview Summary */}
        {parseResult && (
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Parse Preview Summary</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  {parseResult.validCount} valid
                </span>
                {parseResult.duplicateCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                    {parseResult.duplicateCount} duplicates skipped
                  </span>
                )}
                {parseResult.errorCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                    {parseResult.errorCount} errors
                  </span>
                )}
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-200 text-xs font-semibold uppercase sticky top-0">
                  <tr>
                    <th scope="col" className="py-2 px-3">Status</th>
                    <th scope="col" className="py-2 px-3">Guest</th>
                    <th scope="col" className="py-2 px-3">Group</th>
                    <th scope="col" className="py-2 px-3">RSVP</th>
                    <th scope="col" className="py-2 px-3">Dietary</th>
                    <th scope="col" className="py-2 px-3">Table</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parseResult.rows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={
                        row.guest
                          ? 'hover:bg-slate-900/60'
                          : row.isDuplicate
                          ? 'bg-amber-950/20 text-amber-300'
                          : 'bg-rose-950/20 text-rose-300'
                      }
                    >
                      <td className="py-2 px-3">
                        {row.guest ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        ) : row.isDuplicate ? (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> Skip
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <X className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-100">
                        {row.guest ? (
                          <div>
                            <div>{row.guest.name}</div>
                            {row.guest.email && (
                              <div className="text-[11px] text-slate-300">{row.guest.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs">{row.error}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 capitalize">
                        {row.guest?.group || '—'}
                      </td>
                      <td className="py-2 px-3 capitalize">
                        {row.guest?.rsvpStatus || '—'}
                      </td>
                      <td className="py-2 px-3">
                        {row.guest?.dietaryRestrictions || 'None'}
                      </td>
                      <td className="py-2 px-3">
                        {row.guest?.tableNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.validCount === 0}
            onClick={handleConfirmImport}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md ${
              parseResult && parseResult.validCount > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              Import {parseResult?.validCount ? `${parseResult.validCount} Guests` : 'Guests'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
