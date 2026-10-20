import React from 'react';
import type { DirectoryListing } from '../../types/directory';
import { getOpenStatus, formatCheckedDate } from '../../utils/timeUtils';
import { shareListing } from '../../utils/shareUtils';
import {
  MapPin,
  Phone,
  Clock,
  ClipboardList,
  Bookmark,
  CalendarCheck2,
  ChevronRight,
  Share2,
} from 'lucide-react';

interface ListingCardProps {
  listing: DirectoryListing;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (listing: DirectoryListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const openStatus = getOpenStatus(listing);
  const confirmedRequirementsCount = listing.requirements.filter((r) => r.isConfirmed).length;

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 p-4 shadow-sm hover:shadow-md transition cursor-pointer relative flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Category, Status, Share, Favorite */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {listing.category}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${openStatus.badgeClass}`}
            >
              {openStatus.statusText}
            </span>
            {listing.verificationStatus === 'provisional' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                Draft listing
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                shareListing(listing);
              }}
              aria-label="Share info"
              title="Share details via SMS or Messenger"
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
              aria-label={isFavorite ? 'Remove from saved places' : 'Save to favorite places'}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Name and Short Name */}
        <div className="mb-1.5">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition leading-snug">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(listing);
              }}
              className="text-left rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 cursor-pointer"
            >
              {listing.name}
              {listing.shortName && (
                <span className="ml-1.5 text-xs font-normal text-slate-500">
                  ({listing.shortName})
                </span>
              )}
            </button>
          </h3>
        </div>

        {/* Primary Service Summary */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {listing.primaryService}
        </p>

        {/* Location & Contact Highlights */}
        <div className="space-y-1 mb-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {listing.location.street}, {listing.location.barangay}
            </span>
          </div>

          {listing.contact.isVerified && (listing.contact.mobile || listing.contact.landline) ? (
            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{listing.contact.mobile || listing.contact.landline}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Contact awaiting verification</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{openStatus.detailText}</span>
          </div>
        </div>

        {/* "What to Bring" Preview Chip */}
        {listing.requirements.length > 0 && (
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 mb-3">
            <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                {confirmedRequirementsCount > 0
                  ? `What to Bring (${confirmedRequirementsCount} confirmed)`
                  : 'Preparation ideas — confirm first'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/90 truncate">
              {listing.requirements[0].item}
              {listing.requirements.length > 1 && ` + ${listing.requirements.length - 1} more`}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Last Checked Date & Open Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1 font-medium text-slate-500" title="Date a linked source was reviewed; this does not imply a phone call or field visit">
          <CalendarCheck2 className="w-3 h-3 text-emerald-600" />
          <span>{listing.lastCheckedDate ? `Source reviewed ${formatCheckedDate(listing.lastCheckedDate)}` : 'Awaiting verification'}</span>
        </div>

        <div className="flex items-center gap-0.5 text-emerald-700 font-semibold group-hover:translate-x-0.5 transition">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
