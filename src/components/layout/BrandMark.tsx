import { APP_ICON_URL } from '../../config/brand';

// The adjacent app name supplies the accessible name for this decorative mark.
export function BrandMark({ className = '' }: { className?: string }) {
  return <img src={APP_ICON_URL} alt="" aria-hidden="true" width={44} height={44} className={`shrink-0 ${className}`} />;
}
