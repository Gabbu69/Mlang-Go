import React, { useState } from 'react';
import type { DirectoryListing, ReportPayload } from '../../types/directory';
import { AlertTriangle, X, Check, Copy, Send } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import { copyText } from '../../utils/shareUtils';
import { APP_NAME } from '../../config/brand';

interface ReportModalProps {
  listing: DirectoryListing | null;
  onClose: () => void;
  onSubmitReport: (payload: ReportPayload) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  onClose,
  onSubmitReport,
}) => {
  const [issueType, setIssueType] = useState<ReportPayload['issueType']>('wrong_contact');
  const [description, setDescription] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const dialogRef = useDialog(!!listing, onClose);

  if (!listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const payload: ReportPayload = {
      listingId: listing.id,
      listingName: listing.name,
      issueType,
      description: description.trim(),
      suggestedCorrection: suggestedCorrection.trim(),
      reporterContact: reporterContact.trim(),
    };

    onSubmitReport(payload);
    setSubmitted(true);
  };

  const formattedReportText = `[${APP_NAME} Report]
Listing: ${listing.name} (${listing.id})
Issue: ${issueType}
Description: ${description}
Correction: ${suggestedCorrection}
Contact: ${reporterContact || 'Anonymous'}`;

  const handleCopyReport = async () => {
    try {
      await copyText(formattedReportText);
      setCopyError('');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Copy is unavailable. Select the report text below to copy it manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        tabIndex={-1}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-500/10 px-5 py-4 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 id="report-title" className="font-bold text-base">Report Outdated or Wrong Info</h3>
              <p className="text-xs text-amber-800">
                Save a correction on this device for review and sharing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close report"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="min-h-0 overflow-y-auto p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Thank You for Your Report!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Your correction for <span className="font-semibold">{listing.name}</span> is saved on this device. It has not been sent to anyone. Copy or export it to share it yourself.
              </p>
            </div>

            {copyError && <p role="status" className="text-xs text-amber-800">{copyError}</p>}
            <div className="select-text break-words bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs text-slate-700 font-mono whitespace-pre-wrap">
              {formattedReportText}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Listing Target Notice */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Reporting for:</span>
              <p className="font-bold text-slate-800 text-sm">{listing.name}</p>
            </div>

            {/* Issue Category */}
            <div>
              <label htmlFor="report-issue" className="block font-semibold text-slate-700 mb-1">
                What needs updating?
              </label>
              <select
                id="report-issue"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as ReportPayload['issueType'])}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="wrong_contact">Contact Number / Email is Unreachable or Wrong</option>
                <option value="wrong_hours">Opening Hours or Lunch Break has Changed</option>
                <option value="wrong_requirements">Missing or Incorrect "What to Bring" Requirements</option>
                <option value="closed_or_moved">Establishment has Moved or Temporarily Closed</option>
                <option value="other">Other Information / Clarification</option>
              </select>
            </div>

            {/* Issue Description */}
            <div>
              <label htmlFor="report-description" className="block font-semibold text-slate-700 mb-1">
                Details (What is incorrect?)
              </label>
              <textarea
                id="report-description"
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Tried calling the landline twice on Thursday and it was out of order..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Suggested Correction */}
            <div>
              <label htmlFor="report-correction" className="block font-semibold text-slate-700 mb-1">
                Correct Information (if known)
              </label>
              <textarea
                id="report-correction"
                rows={2}
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                placeholder="e.g. Their active mobile hotline is 0912-..., and they now require 2 copies of Cedula."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Reporter Contact */}
            <div>
              <label htmlFor="report-contact" className="block font-semibold text-slate-700 mb-1">
                Your Contact / Facebook Name (Optional)
              </label>
              <input
                id="report-contact"
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="In case the maintainer needs to clarify your report"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Submit Action */}
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
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Correction</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
