import React, { useState, useEffect } from 'react';
import { Compass, Wifi, WifiOff, ShieldAlert, CheckSquare } from 'lucide-react';
import { APP_NAME } from '../../config/brand';
import { BrandMark } from './BrandMark';

interface HeaderProps {
  favoritesCount: number;
  activeErrandsCount: number;
  onOpenAbout: () => void;
  activeTab: 'directory' | 'pocket';
  onTabChange: (tab: 'directory' | 'pocket') => void;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  activeErrandsCount,
  onOpenAbout,
  activeTab,
  onTabChange,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="min-w-0 flex items-center gap-2.5">
            <BrandMark className="h-11 w-11 rounded-2xl border border-emerald-400/40 shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                  {APP_NAME}
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-700/90 text-emerald-100 border border-emerald-600">
                  Cotabato
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-normal">
                Where to go • What to bring • Who to contact
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Offline/Online Badge */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isOnline ? 'bg-emerald-900/60 text-emerald-200' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              }`}
              title={isOnline ? 'Internet connection active' : 'Offline mode active - All 20 listings & errands are stored on this device'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Offline Ready' : 'Offline Mode'}</span>
            </div>

            {/* About / Transparency Button */}
            <button
              onClick={onOpenAbout}
              className="min-h-12 min-w-12 shrink-0 justify-center px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-900 text-emerald-100 border border-emerald-600/70 transition flex items-center gap-1"
              title="Independent guide details and verification sources"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">About Guide</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 grid grid-cols-2 p-1 bg-emerald-900/60 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => onTabChange('directory')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'directory'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Public Directory</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-1">
              20
            </span>
          </button>

          <button
            onClick={() => onTabChange('pocket')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'pocket'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>My Errands &amp; Saved</span>
            {(activeErrandsCount > 0 || favoritesCount > 0) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-bold ml-1">
                {activeErrandsCount + favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
