import { useState } from 'react';
import type { ErrandItem } from '../../types/directory';
import { Briefcase, CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TripConsolidatorProps {
  activeErrands: ErrandItem[];
}

export const TripConsolidator = ({ activeErrands }: TripConsolidatorProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [day] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
  const [bagChecks, setBagChecks] = useLocalStorage<Record<string, boolean>>(`mlang_pocket_bag_${day}`, {},
    (value): value is Record<string, boolean> => typeof value === 'object' && value !== null && !Array.isArray(value)
      && Object.values(value).every((item) => typeof item === 'boolean'));

  if (activeErrands.length === 0) return null;

  // Extract all pending documents
  const pendingDocs = activeErrands.flatMap((e) =>
    e.checklist.filter((item) => !item.completed).map((item) => ({
      text: item.text,
      errandTitle: e.title,
    }))
  );

  // Standard essential gear for M'lang civic errands
  const standardPackItems = [
    { id: 'pen', label: 'Black ballpen for filling out forms' },
    { id: 'cash', label: 'Cash in small bills (₱20, ₱50, ₱100) & coins for trike & stamps' },
    { id: 'photocopy', label: 'Photocopy of Valid IDs (bring 2–3 extra copies)' },
    { id: 'folder', label: 'Clean document folder or envelope (rain/dust protection)' },
  ];

  const toggleBagCheck = (id: string) => {
    setBagChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalBagItems = standardPackItems.length;
  const checkedBagItems = standardPackItems.filter((item) => bagChecks[item.id]).length;
  const isBagReady = checkedBagItems === totalBagItems && pendingDocs.length === 0;

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-emerald-700/50 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">Pre-Departure Bag Pack &amp; Summary</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-amber-400 text-amber-950">
                {activeErrands.length} Trip{activeErrands.length > 1 ? 's' : ''} Planned
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">
              Check off your folder before leaving home to prevent wasted trips
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer"
          aria-label={isOpen ? 'Collapse brief' : 'Expand brief'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Active Stops</span>
              <p className="text-lg font-extrabold text-white">{activeErrands.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Pending Docs</span>
              <p className="text-lg font-extrabold text-amber-300">{pendingDocs.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">Bag Pack Status</span>
              <p className={`text-xs font-bold mt-1 ${isBagReady ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isBagReady ? '✓ Packing Checklist Ready' : `${checkedBagItems}/${totalBagItems} Essentials · ${pendingDocs.length} Docs Left`}
              </p>
            </div>
          </div>

          {/* Essential Bag Check Items */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Essential Pack Checklist:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardPackItems.map((item) => {
                const isChecked = !!bagChecks[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isChecked}
                    onClick={() => toggleBagCheck(item.id)}
                    className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-600/30 border-emerald-400/50 text-emerald-100'
                        : 'bg-white/5 border-white/10 text-emerald-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-800" />
                      ) : (
                        <Circle className="w-4 h-4 text-emerald-400/60" />
                      )}
                    </div>
                    <span className={`text-[11px] leading-snug ${isChecked ? 'line-through opacity-80' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Helpful Civic Advisory */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-200 text-[11px]">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <p>
              <strong>Before you leave:</strong> Confirm the destination’s current service hours, requirements, fees, and lunch arrangements. Packing this list does not guarantee that an office is open or your documents are sufficient.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
