import React from 'react';
import { Palette, Copy, Check } from 'lucide-react';

export interface ColorStorySectionProps {
  colorPalette?: { name: string; hex: string }[];
  copiedHex: string | null;
  onCopyHex: (hex: string) => void;
}

/**
 * Visual color story display showing theme swatches and click-to-copy hex values.
 */
export const ColorStorySection: React.FC<ColorStorySectionProps> = ({
  colorPalette,
  copiedHex,
  onCopyHex,
}) => {
  if (!colorPalette || colorPalette.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Event Color Story
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Click any swatch to copy HEX</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {colorPalette.map((color, idx) => {
          const isCopied = copiedHex === color.hex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onCopyHex(color.hex)}
              aria-label={`Copy color ${color.name} ${color.hex}`}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div
                className="w-full h-12 rounded-lg mb-2 shadow-inner transition group-hover:scale-[1.02]"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-xs font-semibold text-white truncate">{color.name}</div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{color.hex}</span>
                {isCopied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
