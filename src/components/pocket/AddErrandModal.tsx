import React, { useState } from 'react';
import type { DirectoryListing, ErrandItem } from '../../types/directory';
import { X, Plus, Trash2, CheckSquare } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface AddErrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: DirectoryListing[];
  onAddErrand: (errand: ErrandItem) => void;
  presetListing?: DirectoryListing | null;
}

export const AddErrandModal: React.FC<AddErrandModalProps> = ({
  isOpen,
  onClose,
  listings,
  onAddErrand,
  presetListing,
}) => {
  const [title, setTitle] = useState(presetListing ? `Visit ${presetListing.name}` : '');
  const [selectedListingId, setSelectedListingId] = useState(presetListing?.id || '');
  const [notes, setNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>(() =>
    presetListing
      ? presetListing.requirements.map((r, i) => ({
          id: `preset-${presetListing.id}-${i}`,
          text: r.item,
          completed: false,
        }))
      : [
          { id: '1', text: 'Valid Government ID', completed: false },
          { id: '2', text: 'Cash in small bills & coins', completed: false },
        ]
  );
  const [newChecklistText, setNewChecklistText] = useState('');
  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleListingSelect = (listingId: string) => {
    setSelectedListingId(listingId);
    const found = listings.find((l) => l.id === listingId);
    if (found) {
      const previousListing = listings.find((listing) => listing.id === selectedListingId);
      if (!title || title === `Visit ${previousListing?.name}`) {
        setTitle(`Visit ${found.name}`);
      }
      // Import requirements
      {
        const imported = found.requirements.map((r, i) => ({
          id: `item-${Date.now()}-${i}`,
          text: r.item,
          completed: false,
        }));
        setChecklistItems(imported);
      }
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      {
        id: `item-${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedListing = listings.find((l) => l.id === selectedListingId);

    const newErrand: ErrandItem = {
      id: `errand-${Date.now()}`,
      title: title.trim(),
      listingId: selectedListingId || undefined,
      placeName: matchedListing?.name,
      notes: notes.trim() || undefined,
      checklist: newChecklistText.trim()
        ? [...checklistItems, { id: `item-${crypto.randomUUID()}`, text: newChecklistText.trim(), completed: false }]
        : checklistItems,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddErrand(newErrand);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-errand-title"
        tabIndex={-1}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 id="add-errand-title" className="font-bold text-base text-slate-900">New Errand &amp; Checklist</h3>
              <p className="text-xs text-slate-500">Plan what to bring before you head out</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close new errand"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 p-5 overflow-y-auto space-y-4 text-xs">
          {/* Linked Place (Optional) */}
          <div>
            <label htmlFor="errand-destination" className="block font-semibold text-slate-700 mb-1">
              Destination Place (Optional)
            </label>
            <select
              id="errand-destination"
              value={selectedListingId}
              onChange={(e) => handleListingSelect(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="">-- Custom Errand (Not linked to a place) --</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.location.barangay})
                </option>
              ))}
            </select>
          </div>

          {/* Errand Title */}
          <div>
            <label htmlFor="errand-title" className="block font-semibold text-slate-700 mb-1">
              Errand Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="errand-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Renew Cedula &amp; submit barangay clearance"
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* What to Bring Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                What to Bring Checklist ({checklistItems.length} items)
              </label>
              <span className="text-[11px] text-slate-400">Pack your bag before leaving</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="text-xs text-slate-800 truncate">{item.text}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.text}`}
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Checklist Item Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                aria-label="New checklist item"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Add document or item e.g. 2x2 picture, black pen..."
                className="min-w-0 flex-1 p-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="button"
                aria-label="Add checklist item"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl border border-slate-300 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="errand-notes" className="block font-semibold text-slate-700 mb-1">
              Notes or Budget (Optional)
            </label>
            <textarea
              id="errand-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Budget ₱150 for clearance fee + ₱50 for photocopy. Target to arrive by 8:30 AM."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition"
            >
              Save Errand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
