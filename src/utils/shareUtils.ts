import type { DirectoryListing } from '../types/directory';
import { formatCheckedDate } from './timeUtils';
import { APP_NAME } from '../config/brand';

export async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Some Android WebViews deny the asynchronous Clipboard API.
  }

  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Clipboard access unavailable');
  } finally {
    field.remove();
    previousFocus?.focus();
  }
}

export function formatListingShareText(listing: DirectoryListing): string {
  const requirementsList =
    listing.requirements.length > 0
      ? listing.requirements
          .map((r) => `  • ${r.item}${r.note ? ` (${r.note})` : ''}`)
          .join('\n')
      : '  • Requirements are not yet confirmed. Ask the destination before travelling.';

  const contactList = (listing.contact.isVerified ? [
    listing.contact.mobile ? `Mobile: ${listing.contact.mobile}` : null,
    listing.contact.landline ? `Landline: ${listing.contact.landline}` : null,
    listing.contact.email ? `Email: ${listing.contact.email}` : null,
  ] : [])
    .filter(Boolean)
    .join(' | ');

  return `📍 ${listing.name}${listing.shortName ? ` (${listing.shortName})` : ''}
🏢 ${listing.location.street}, ${listing.location.barangay}, M'lang
⏰ Draft hours (confirm first): ${listing.openingHours.schedule}
${listing.openingHours.lunchBreak ? `⚠️ Note: ${listing.openingHours.lunchBreak}\n` : ''}📞 Contact: ${contactList || 'See in person'}
🎒 Suggested packing list (confirm requirements):
${requirementsList}

Source: ${listing.source.name}
Listing review: ${formatCheckedDate(listing.lastCheckedDate)}
Confirm current hours, location, and requirements before travelling.
(Shared via ${APP_NAME} Community Guide)`;
}

export async function shareListing(listing: DirectoryListing): Promise<{ shared: boolean; method: 'native' | 'clipboard' }> {
  const text = formatListingShareText(listing);
  const title = `${listing.name} — ${APP_NAME} Guide`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return { shared: true, method: 'native' };
    } catch (err) {
      // User cancelled share or fallback needed
      if ((err as Error).name !== 'AbortError') {
        await copyText(text);
        return { shared: true, method: 'clipboard' };
      }
      return { shared: false, method: 'native' };
    }
  }

  // Fallback to clipboard
  await copyText(text);
  return { shared: true, method: 'clipboard' };
}
