import { useRef, useState } from 'react';
import { createBackup, parseBackup, restoreBackup } from '../../utils/backup';

export function BackupControls() {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  function download() {
    try {
      const url = URL.createObjectURL(new Blob([createBackup(localStorage)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `mlang-go-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Download requested. Keep this private file for device recovery.');
    } catch { setStatus('Backup could not be prepared. Your current records have not been changed.'); }
  }
  async function inspect(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Backup exceeds the 2 MB limit.');
      const text = await file.text();
      const data = parseBackup(text);
      setPending(text);
      setStatus(`Valid backup from ${new Date(data.exportedAt).toLocaleString()}. Restore replaces matching saved lists and merges dated bag/visit records. Export current data first.`);
    } catch { setPending(null); setStatus('This file is not a valid, supported backup. Current records are unchanged.'); }
    if (input.current) input.current.value = '';
  }
  return <section className="p-3 rounded-2xl border border-slate-200 space-y-3">
    <h4 className="font-bold text-sm">Back up your pocket</h4>
    <p className="text-xs">Save places, errands, corrections, bag checks, and visit markers. This unencrypted file can include your notes and contact details.</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={download} className="min-h-11 rounded-lg border border-emerald-700 px-3 text-sm">Export backup</button>
      <button type="button" onClick={() => input.current?.click()} className="min-h-11 rounded-lg border border-slate-500 px-3 text-sm">Choose backup</button>
    </div>
    <input ref={input} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} onChange={event => void inspect(event.target.files?.[0])} aria-label="Choose a M’lang Go backup" />
    {status && <p role="status" className="text-sm">{status}</p>}
    {pending && <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-11 rounded-lg bg-emerald-800 px-3 text-sm text-white" onClick={() => {
        try { restoreBackup(pending, localStorage); location.reload(); }
        catch { setStatus('Restore failed. Existing values were restored where storage allowed. Keep your backup and retry after checking device storage.'); }
      }}>Confirm restore</button>
      <button type="button" className="min-h-11 px-3 text-sm" onClick={() => { setPending(null); setStatus('Restore cancelled. Current records are unchanged.'); }}>Cancel</button>
    </div>}
  </section>;
}
