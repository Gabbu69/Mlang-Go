import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { MLANG_DIRECTORY } from './data/mlangDirectory';
import type { DirectoryListing, ErrandItem, ReportPayload } from './types/directory';
import { useDirectoryFilter } from './hooks/useDirectoryFilter';
import { useLocalStorage } from './hooks/useLocalStorage';
import { isErrandList, isReportList, isStringList } from './utils/storageValidators';
import { Header } from './components/layout/Header';
import { EmergencyBar } from './components/layout/EmergencyBar';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { AboutModal } from './components/layout/AboutModal';
import { SearchBar } from './components/directory/SearchBar';
import { CategoryFilter } from './components/directory/CategoryFilter';
import { ListingCard } from './components/directory/ListingCard';
import { ListingDetailModal } from './components/directory/ListingDetailModal';
import { ReportModal } from './components/directory/ReportModal';
import { FavoritesList } from './components/pocket/FavoritesList';
import { ErrandsChecklist } from './components/pocket/ErrandsChecklist';
import { AddErrandModal } from './components/pocket/AddErrandModal';
import { TripConsolidator } from './components/pocket/TripConsolidator';
import { TripClusterView } from './components/pocket/TripClusterView';
import { Compass, CheckSquare, Bookmark } from 'lucide-react';
import { APP_NAME } from './config/brand';

const INITIAL_FAVORITES: string[] = [];
const INITIAL_ERRANDS: ErrandItem[] = [];

export function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'pocket'>('directory');
  const [pocketSubView, setPocketSubView] = useState<'errands' | 'saved'>('errands');

  // Directory Filtering Hook
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onlyOpenNow,
    setOnlyOpenNow,
    selectedBarangay,
    setSelectedBarangay,
    barangayList,
    filteredListings,
    totalCount,
    filteredCount,
  } = useDirectoryFilter(MLANG_DIRECTORY);

  // Persistent User State
  const [favorites, setFavorites] = useLocalStorage<string[]>('mlang_pocket_favorites', INITIAL_FAVORITES, isStringList);
  const [errands, setErrands] = useLocalStorage<ErrandItem[]>('mlang_pocket_errands', INITIAL_ERRANDS, isErrandList);
  const [reports, setReports] = useLocalStorage<ReportPayload[]>('mlang_pocket_reports', [], isReportList);

  // Modals state
  const [selectedListing, setSelectedListing] = useState<DirectoryListing | null>(null);
  const [reportingListing, setReportingListing] = useState<DirectoryListing | null>(null);
  const [isAddErrandOpen, setIsAddErrandOpen] = useState(false);
  const [presetListingForErrand, setPresetListingForErrand] = useState<DirectoryListing | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = CapacitorApp.addListener('backButton', () => {
      if (reportingListing) setReportingListing(null);
      else if (isAddErrandOpen) setIsAddErrandOpen(false);
      else if (selectedListing) setSelectedListing(null);
      else if (isAboutOpen) setIsAboutOpen(false);
      else if (activeTab === 'pocket') setActiveTab('directory');
      else void CapacitorApp.exitApp();
    });
    return () => { void listener.then((handle) => handle.remove()); };
  }, [reportingListing, isAddErrandOpen, selectedListing, isAboutOpen, activeTab]);

  // Favorites Handlers
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const favoriteListings = MLANG_DIRECTORY.filter((l) => favorites.includes(l.id));

  // Errands Handlers
  const handleToggleChecklistItem = (errandId: string, itemId: string) => {
    setErrands((prev) =>
      prev.map((errand) => {
        if (errand.id !== errandId) return errand;
        const updatedChecklist = errand.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return {
          ...errand,
          checklist: updatedChecklist,
        };
      })
    );
  };

  const handleToggleErrandComplete = (errandId: string) => {
    setErrands((prev) =>
      prev.map((errand) => {
        if (errand.id !== errandId) return errand;
        return {
          ...errand,
          completed: !errand.completed,
        };
      })
    );
  };

  const handleDeleteErrand = (errandId: string) => {
    setErrands((prev) => prev.filter((e) => e.id !== errandId));
  };

  const handleAddErrand = (newErrand: ErrandItem) => {
    setErrands((prev) => [newErrand, ...prev]);
    setActiveTab('pocket');
    setPocketSubView('errands');
  };

  // Add listing requirements directly to errands checklist
  const handleAddRequirementsToErrands = (listing: DirectoryListing) => {
    const newErrand: ErrandItem = {
      id: `errand-${Date.now()}`,
      title: `Visit ${listing.name}`,
      listingId: listing.id,
      placeName: listing.name,
      notes: `Suggested packing list; confirm current requirements with the destination. Location: ${listing.location.street}`,
      checklist: listing.requirements.map((r, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        text: r.item,
        completed: false,
      })),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setErrands((prev) => [newErrand, ...prev]);
  };

  // Report handler
  const handleSubmitReport = (payload: ReportPayload) => {
    setReports((prev) => [payload, ...prev]);
  };

  const activeErrandsCount = errands.filter((e) => !e.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Header */}
      <Header
        favoritesCount={favorites.length}
        activeErrandsCount={activeErrandsCount}
        onOpenAbout={() => setIsAboutOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 24/7 Emergency Speed Dial Bar */}
      <EmergencyBar />

      {/* Independent Guide Disclaimer Banner */}
      <DisclaimerBanner onLearnMore={() => setIsAboutOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'directory' ? (
          /* ================= PUBLIC DIRECTORY VIEW ================= */
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm space-y-3">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onlyOpenNow={onlyOpenNow}
                onToggleOpenNow={() => setOnlyOpenNow(!onlyOpenNow)}
                selectedBarangay={selectedBarangay}
                onBarangayChange={setSelectedBarangay}
                barangayList={barangayList}
                filteredCount={filteredCount}
                totalCount={totalCount}
              />

              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">No places matched your search</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try clearing filters or searching for terms like "Hospital", "Cedula", "Tire", or "Photocopy".
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setOnlyOpenNow(false);
                    setSelectedBarangay('all');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(l) => setSelectedListing(l)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= PERSONAL POCKET VIEW ================= */
          <div className="space-y-4">
            {/* Sub-navigation inside Personal Pocket */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
              <div className="grid grid-cols-2 gap-1 flex-1 sm:flex-initial">
                <button
                  onClick={() => setPocketSubView('errands')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    pocketSubView === 'errands'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>My Errands ({errands.length})</span>
                </button>

                <button
                  onClick={() => setPocketSubView('saved')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    pocketSubView === 'saved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Saved Places ({favorites.length})</span>
                </button>
              </div>

              {pocketSubView === 'errands' && (
                <button
                  onClick={() => {
                    setPresetListingForErrand(null);
                    setIsAddErrandOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <span>+ New Errand</span>
                </button>
              )}
            </div>

            {pocketSubView === 'errands' ? (
              <div className="space-y-4">
                {/* Pre-Departure Document Packing Consolidator */}
                <TripConsolidator activeErrands={errands.filter((e) => !e.completed)} />

                {/* Route Optimizer: Grouped by Area Cluster */}
                <TripClusterView
                  errands={errands}
                  allListings={MLANG_DIRECTORY}
                  onViewListing={(id) => {
                    const place = MLANG_DIRECTORY.find((p) => p.id === id);
                    if (place) setSelectedListing(place);
                  }}
                />

                <ErrandsChecklist
                  errands={errands}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onToggleErrandComplete={handleToggleErrandComplete}
                  onDeleteErrand={handleDeleteErrand}
                  onOpenAddModal={() => {
                    setPresetListingForErrand(null);
                    setIsAddErrandOpen(true);
                  }}
                  onViewListing={(id) => {
                    const place = MLANG_DIRECTORY.find((p) => p.id === id);
                    if (place) setSelectedListing(place);
                  }}
                  allListings={MLANG_DIRECTORY}
                />
              </div>
            ) : (
              <FavoritesList
                favoriteListings={favoriteListings}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={(l) => setSelectedListing(l)}
                onExploreDirectory={() => setActiveTab('directory')}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-700 font-semibold">
            <span>{APP_NAME}</span>
            <span>•</span>
            <span>Independent Community Guide</span>
            <span>•</span>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Transparency &amp; Sources
            </button>
            {reports.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium ml-1">
                {reports.length} report{reports.length > 1 ? 's' : ''} logged
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Not affiliated with or an official app of LGU M'lang or the Province of Cotabato. Check each listing’s source and confirm details before travelling.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {selectedListing && <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        isFavorite={selectedListing ? favorites.includes(selectedListing.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddRequirementsToErrands={handleAddRequirementsToErrands}
        onOpenReport={(l) => setReportingListing(l)}
      />}

      {reportingListing && <ReportModal
        listing={reportingListing}
        onClose={() => setReportingListing(null)}
        onSubmitReport={handleSubmitReport}
      />}

      {isAddErrandOpen && <AddErrandModal
        isOpen={isAddErrandOpen}
        onClose={() => setIsAddErrandOpen(false)}
        listings={MLANG_DIRECTORY}
        onAddErrand={handleAddErrand}
        presetListing={presetListingForErrand}
      />}

      {isAboutOpen && <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        reports={reports}
      />}
    </div>
  );
}

export default App;
