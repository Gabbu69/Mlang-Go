import type { ErrandItem, DirectoryListing } from '../../types/directory';
import { MapPin, Landmark, Store, ShoppingBag, ArrowRight } from 'lucide-react';

interface TripClusterViewProps {
  errands: ErrandItem[];
  allListings: DirectoryListing[];
  onViewListing: (listingId: string) => void;
}

interface ClusterGroup {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Landmark;
  colorClass: string;
  errandIds: string[];
}

export const TripClusterView = ({
  errands,
  allListings,
  onViewListing,
}: TripClusterViewProps) => {
  const pendingErrands = errands.filter((e) => !e.completed);
  if (pendingErrands.length === 0) return null;

  // Map each errand to its destination listing
  const clusters: ClusterGroup[] = [
    {
      id: 'compound',
      name: 'Municipal Hall Compound Cluster',
      subtitle: 'M.H. Del Pilar St. — Mayor, LCR, Treasury, RHU, PhilPost, MDRRMO',
      icon: Landmark,
      colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      errandIds: [],
    },
    {
      id: 'commercial',
      name: 'Commercial Strip (Rizal St. & Magsaysay Ave)',
      subtitle: 'Hospital, Drugstore, Copy Center, Motorcycle Repair, LBC, Remittance',
      icon: Store,
      colorClass: 'bg-blue-50 border-blue-200 text-blue-900',
      errandIds: [],
    },
    {
      id: 'market',
      name: 'Public Market & Terminal Cluster',
      subtitle: 'Fresh Market, Agri-Vet Feeds, Seeds, Transport Terminals',
      icon: ShoppingBag,
      colorClass: 'bg-amber-50 border-amber-200 text-amber-900',
      errandIds: [],
    },
    {
      id: 'other',
      name: 'Other Locations',
      subtitle: 'Custom stops or outer barangays',
      icon: MapPin,
      colorClass: 'bg-slate-50 border-slate-200 text-slate-800',
      errandIds: [],
    },
  ];

  // Distribute pending errands into clusters based on listingId
  const compoundIds = ['mayors-office-admin', 'lcr-civil-registrar', 'mto-treasurer-bplo', 'mswdo-social-welfare', 'rhu-health-office', 'philpost-post-office', 'mdrrmo-rescue', 'police-station'];
  const marketIds = ['mlang-public-market', 'agrivet-supply-farmers'];

  pendingErrands.forEach((errand) => {
    if (!errand.listingId) {
      clusters[3].errandIds.push(errand.id);
      return;
    }

    if (compoundIds.includes(errand.listingId)) {
      clusters[0].errandIds.push(errand.id);
    } else if (marketIds.includes(errand.listingId)) {
      clusters[2].errandIds.push(errand.id);
    } else {
      clusters[1].errandIds.push(errand.id);
    }
  });

  const activeClusters = clusters.filter((c) => c.errandIds.length > 0);

  if (activeClusters.length <= 1) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Suggested Area Groups ({activeClusters.length} Groups)
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Confirm locations first</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {activeClusters.map((cluster) => {
          const Icon = cluster.icon;
          return (
            <div key={cluster.id} className={`p-3 rounded-2xl border ${cluster.colorClass} space-y-2`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <h5 className="font-bold text-xs truncate">{cluster.name}</h5>
                  <p className="text-[10px] opacity-80 truncate">{cluster.subtitle}</p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {cluster.errandIds.map((eId) => {
                  const errand = pendingErrands.find((e) => e.id === eId);
                  if (!errand) return null;
                  const listing = errand.listingId
                    ? allListings.find((l) => l.id === errand.listingId)
                    : null;

                  return (
                    <div
                      key={eId}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-black/5 text-xs text-slate-800 shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold block truncate">{errand.title}</span>
                        {listing && (
                          <span className="text-[10px] text-slate-500 block truncate">
                            {listing.location.street}
                          </span>
                        )}
                      </div>
                      {listing && (
                        <button
                          onClick={() => onViewListing(listing.id)}
                          className="text-emerald-700 hover:text-emerald-900 p-1 shrink-0 cursor-pointer"
                          title="View place info"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
