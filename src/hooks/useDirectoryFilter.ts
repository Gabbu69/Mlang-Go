import { useEffect, useMemo, useState } from 'react';
import type { DirectoryListing, ServiceCategory } from '../types/directory';
import { getOpenStatus } from '../utils/timeUtils';

export function useDirectoryFilter(allListings: DirectoryListing[]) {
  // Recompute scheduled status at minute boundaries and after returning from
  // a suspended/background tab. This still uses a draft schedule, not live availability.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');

  const barangayList = useMemo(() => {
    const set = new Set<string>();
    allListings.forEach((item) => {
      if (item.location.barangay) {
        set.add(item.location.barangay);
      }
    });
    return Array.from(set).sort();
  }, [allListings]);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allListings.filter((listing) => {
      // Category filter
      if (selectedCategory !== 'all' && listing.category !== selectedCategory) {
        return false;
      }

      // Barangay filter
      if (selectedBarangay !== 'all' && listing.location.barangay !== selectedBarangay) {
        return false;
      }

      // Open now filter
      if (onlyOpenNow) {
        const status = getOpenStatus(listing, new Date(now));
        if (!status.isOpen) {
          return false;
        }
      }

      // Search query filter
      if (q) {
        const matchesName = listing.name.toLowerCase().includes(q);
        const matchesShort = listing.shortName?.toLowerCase().includes(q) ?? false;
        const matchesService = listing.primaryService.toLowerCase().includes(q);
        const matchesLocation =
          listing.location.street.toLowerCase().includes(q) ||
          listing.location.barangay.toLowerCase().includes(q) ||
          (listing.location.landmark?.toLowerCase().includes(q) ?? false);
        const matchesRequirements = listing.requirements.some(
          (r) => r.item.toLowerCase().includes(q) || (r.note?.toLowerCase().includes(q) ?? false)
        );
        const matchesTips = listing.tips?.some((t) => t.toLowerCase().includes(q)) ?? false;

        return (
          matchesName ||
          matchesShort ||
          matchesService ||
          matchesLocation ||
          matchesRequirements ||
          matchesTips
        );
      }

      return true;
    });
  }, [allListings, searchQuery, selectedCategory, onlyOpenNow, selectedBarangay, now]);

  return {
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
    totalCount: allListings.length,
    filteredCount: filteredListings.length,
  };
}
