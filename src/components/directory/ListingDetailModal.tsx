import React, { useState } from 'react';
import type { DirectoryListing } from '../../types/directory';
import { getOpenStatus, formatCheckedDate } from '../../utils/timeUtils';
import { copyText, shareListing } from '../../utils/shareUtils';
import { useDialog } from '../../hooks/useDialog';
import {
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  Bookmark,
  HelpCircle,
  ShieldCheck,
  Check,
  Copy,
  Share2,
  ThumbsUp,
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: DirectoryListing | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddRequirementsToErrands: (listing: DirectoryListing) => void;
  onOpenReport: (listing: DirectoryListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddRequirementsToErrands,
  onOpenReport,
}) => {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [addedToErrands, setAddedToErrands] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmedToday, setConfirmedToday] = useState(() => {
    try {
      return !!localStorage.getItem(`mlang_active_${listing?.id}_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })}`);
    } catch {
      return false;
    }
  });
  const dialogRef = useDialog(!!listing, onClose);

  if (!listing) return null;

  const openStatus = getOpenStatus(listing);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await copyText(text);
      setActionError(null);
      setCopiedContact(label);
      setTimeout(() => setCopiedContact(null), 2000);
    } catch {
      setActionError('Copy is unavailable. You can select and copy the contact text manually.');
    }
  };

  const handleAddToErrands = () => {
    onAddRequirementsToErrands(listing);
    setAddedToErrands(true);
    setTimeout(() => setAddedToErrands(false), 2500);
  };

  const handleShare = async () => {
    try {
      const res = await shareListing(listing);
      if (res.shared) {
        setActionError(null);
        setShareFeedback(res.method === 'native' ? 'Shared!' : 'Copied card to clipboard!');
        setTimeout(() => setShareFeedback(null), 2500);
      }
    } catch {
      setActionError('Sharing is unavailable. You can select and copy the listing details manually.');
    }
  };

  const handleConfirmActiveToday = () => {
    const todayKey = `mlang_active_${listing.id}_${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })}`;
    try {
      localStorage.setItem(todayKey, new Date().toISOString());
      setActionError(null);
      setConfirmedToday(true);
    } catch {
      setActionError('This device could not save your visit confirmation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
        tabIndex={-1}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Actions */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {listing.category}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${openStatus.badgeClass}`}>
                {openStatus.statusText}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Review: {formatCheckedDate(listing.lastCheckedDate)}
              </span>
            </div>
            <h2 id="listing-detail-title" className="text-xl font-bold text-slate-900 leading-tight">
              {listing.name}
              {listing.shortName && (
                <span className="ml-1 text-sm font-semibold text-slate-500">
                  ({listing.shortName})
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Share / SMS Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition cursor-pointer relative"
              title="Share listing &amp; requirements via SMS or Messenger"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-500 hover:bg-slate-100'
              }`}
              title={isFavorite ? 'Remove from Saved Places' : 'Save to My Places'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share / Copied Alert Banner */}
        {shareFeedback && (
          <div className="bg-emerald-700 text-white text-xs font-semibold px-5 py-2 flex items-center justify-between animate-in fade-in">
            <span>{shareFeedback}</span>
          </div>
        )}
        {actionError && <p role="status" className="shrink-0 bg-amber-50 text-amber-900 px-5 py-2 text-xs">{actionError}</p>}

        {/* Scrollable Modal Body */}
        <div className="min-h-0 overflow-y-auto p-5 space-y-5 text-sm">
          {listing.verificationStatus !== 'verified' && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Provisional listing. Confirm the location, hours, and requirements before travelling. A published contact source does not verify every detail.
            </p>
          )}
          {/* Service Summary Description */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Primary Service
            </p>
            <p className="text-slate-800 font-medium leading-relaxed">
              {listing.primaryService}
            </p>
            {listing.description && (
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {listing.description}
              </p>
            )}
          </div>

          {/* Location & Opening Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Location Box */}
            <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Location • <span className="normal-case text-slate-500 font-medium">Diin Makadto</span></span>
              </div>
              <p className="text-slate-800 font-medium">
                {listing.location.street}
              </p>
              <p className="text-xs text-slate-500">
                {listing.location.barangay}, M’lang, Cotabato
              </p>
              {listing.location.landmark && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  Landmark: {listing.location.landmark}
                </p>
              )}
              {listing.location.googleMapsUrl && (
                <a
                  href={listing.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline mt-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Opening Hours Box */}
            <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Hours • <span className="normal-case text-slate-500 font-medium">Oras sang Bukas</span></span>
              </div>
              <p className="text-slate-800 font-medium">
                {listing.openingHours.schedule}
              </p>
              {listing.openingHours.lunchBreak && (
                <div className="text-xs text-slate-600 bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg">
                  <span className="font-semibold text-amber-900">Lunch Break Notice:</span>{' '}
                  {listing.openingHours.lunchBreak}
                </div>
              )}
              <p className="text-xs text-emerald-700 font-medium">
                Status right now: <span className="font-bold">{openStatus.statusText}</span> ({openStatus.detailText})
              </p>
            </div>
          </div>

          {/* Contact Direct Actions */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Direct Contacts • <span className="normal-case text-slate-500 font-medium">Sin-o Kontakon</span></span>
              </div>
              {copiedContact && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md animate-fade-in">
                  Copied {copiedContact}!
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {listing.contact.isVerified && listing.contact.mobile && (
                <div className="inline-flex items-center rounded-xl overflow-hidden border border-emerald-600 bg-emerald-600 shadow-xs">
                  <a
                    href={`tel:${listing.contact.mobile}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-white font-medium text-xs hover:bg-emerald-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Mobile: {listing.contact.mobile}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(listing.contact.mobile!, 'Mobile')}
                    className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white transition border-l border-emerald-500"
                    title="Copy mobile number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {listing.contact.isVerified && listing.contact.landline && (
                <div className="inline-flex items-center rounded-xl overflow-hidden border border-slate-800 bg-slate-800 shadow-xs">
                  <a
                    href={`tel:${listing.contact.landline.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-white font-medium text-xs hover:bg-slate-900 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Landline: {listing.contact.landline}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(listing.contact.landline!, 'Landline')}
                    className="p-2 bg-slate-900 hover:bg-black text-white transition border-l border-slate-700"
                    title="Copy landline number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {listing.contact.isVerified && listing.contact.email && (
                <div className="inline-flex items-center rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <a
                    href={`mailto:${listing.contact.email}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-700 font-medium text-xs hover:bg-slate-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email: {listing.contact.email}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(listing.contact.email!, 'Email')}
                    className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 transition border-l border-slate-300"
                    title="Copy email address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {listing.contact.isVerified && listing.contact.facebookPage && (
                <a
                  href={listing.contact.facebookPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium text-xs hover:bg-blue-100 transition border border-blue-200"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Page</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>
            {!listing.contact.isVerified && <p className="text-xs text-amber-800">No source-backed direct contact is available yet.</p>}
            {listing.contact.sourceUrl && <a href={listing.contact.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 underline">View published contact source</a>}

            {listing.contact.contactNote && (
              <p className="text-xs text-slate-500 italic pt-1">
                Note: {listing.contact.contactNote}
              </p>
            )}
          </div>

          {/* "WHAT TO BRING" - Confirmed Requirements Section */}
          <div className="border-2 border-emerald-500/30 bg-emerald-50/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    What to Bring • <span className="text-emerald-800 font-medium">Ano ang Dalhon</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Suggested items; confirm current requirements with the destination
                  </p>
                </div>
              </div>

              {/* Add to Errands Button */}
              <button
                onClick={handleAddToErrands}
                disabled={addedToErrands}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  addedToErrands
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {addedToErrands ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Errands!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Pack into My Errands Checklist</span>
                  </>
                )}
              </button>
            </div>

            {listing.requirements.length > 0 ? (
              <div className="space-y-2 pt-1">
                {listing.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-xs">
                          {req.item}
                        </span>
                        {req.isConfirmed ? (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            Unconfirmed
                          </span>
                        )}
                      </div>
                      {req.note && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {req.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Requirements are not yet confirmed. Ask the destination what to bring before travelling.
              </p>
            )}
          </div>

          {/* Local Tips & Advice */}
          {listing.tips && listing.tips.length > 0 && (
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Draft Tips — Confirm Locally</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                {listing.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Source & Audit Transparency */}
          <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Source Record:</span>
              <span className="text-[11px] font-mono text-slate-500">
                Method: {listing.source.verificationMethod}
              </span>
            </div>
            <p className="text-slate-700">
              {listing.source.name}
              {listing.source.url && (
                <a
                  href={listing.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                >
                  [View Official Directory]
                  <ExternalLink className="w-2.5 h-2.5 inline" />
                </a>
              )}
            </p>
            {listing.source.citationNote && (
              <p className="text-[11px] text-slate-500 italic">
                Source note: {listing.source.citationNote}
              </p>
            )}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-200/80 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Review: {formatCheckedDate(listing.lastCheckedDate)}</span>
                {confirmedToday ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Your visit confirmation saved today
                  </span>
                ) : (
                  <button
                    onClick={handleConfirmActiveToday}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
                    title="Click if you visited, transacted, or called this place today"
                  >
                    <ThumbsUp className="w-3 h-3" /> Confirm Active Today
                  </button>
                )}
              </div>
              <button
                onClick={() => onOpenReport(listing)}
                className="text-amber-800 font-semibold hover:text-amber-950 underline cursor-pointer"
              >
                Report incorrect info
              </button>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="shrink-0 sticky bottom-0 bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenReport(listing)}
            className="text-xs text-slate-600 hover:text-rose-700 font-medium underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Error or Outdated Info</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
