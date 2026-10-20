import React, { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

interface DisclaimerBannerProps {
  onLearnMore: () => void;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ onLearnMore }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2 text-xs transition">
      <div className="max-w-4xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-snug">
            <span className="font-bold">Independent Community Utility:</span> Starter listings are provisional. Some published contacts link to the{' '}
            <a
              href="https://cotabatoprov.gov.ph/directory-of-offices/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-amber-900 inline-flex items-center gap-0.5 hover:text-emerald-800"
            >
              Provincial Directory <ExternalLink className="w-3 h-3 inline" />
            </a>
            . Confirm details before travelling. Not an official LGU app.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLearnMore}
            className="text-[11px] font-semibold text-amber-900 hover:text-emerald-800 underline uppercase"
          >
            Policy
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss notice"
            className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
