import React from 'react';
import type { DirectoryListing } from '../../types/directory';
import { ListingCard } from '../directory/ListingCard';
import { Bookmark, Compass } from 'lucide-react';

interface FavoritesListProps {
  favoriteListings: DirectoryListing[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: DirectoryListing) => void;
  onExploreDirectory: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteListings,
  onToggleFavorite,
  onSelectListing,
  onExploreDirectory,
}) => {
  if (favoriteListings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/60">
          <Bookmark className="w-7 h-7" />
        </div>
        <div className="max-w-sm mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Saved Places Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tap the bookmark icon on any hospital, repair garage, government window, or pharmacy to keep quick contacts and opening hours right here.
          </p>
        </div>
        <button
          onClick={onExploreDirectory}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Compass className="w-4 h-4" />
          <span>Browse the Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Saved Places ({favoriteListings.length})</span>
        </h3>
        <span className="text-xs text-slate-500">Fast access for you and your family</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {favoriteListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelectListing}
          />
        ))}
      </div>
    </div>
  );
};
