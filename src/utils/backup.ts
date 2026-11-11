import { isErrandList, isReportList, isStringList } from './storageValidators.ts';

const keys = ['mlang_pocket_favorites', 'mlang_pocket_errands', 'mlang_pocket_reports'] as const;
const maxBytes = 2 * 1024 * 1024;
type Backup = { app: 'mlang-go'; version: 1; exportedAt: string; records: Record<string, unknown> };

function validRecord(key: string, value: unknown) {
  if (key === keys[0]) return isStringList(value);
  if (key === keys[1]) return isErrandList(value);
  if (key === keys[2]) return isReportList(value);
  if (/^mlang_pocket_bag_\d{4}-\d{2}-\d{2}$/.test(key)) return value !== null && typeof value === 'object'
    && !Array.isArray(value) && Object.values(value).every(item => typeof item === 'boolean');
  if (/^mlang_active_[\w-]+_\d{4}-\d{2}-\d{2}$/.test(key)) return typeof value === 'string' && Number.isFinite(Date.parse(value));
  return false;
}

export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error('Backup exceeds the 2 MB limit.');
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object') throw new Error('Invalid backup.');
  const data = value as Backup;
  if (data.app !== 'mlang-go' || data.version !== 1 || typeof data.exportedAt !== 'string'
    || !Number.isFinite(Date.parse(data.exportedAt)) || !data.records || typeof data.records !== 'object'
    || Array.isArray(data.records) || Object.keys(data.records).length > 2000
    || keys.some(key => !(key in data.records))
    || !Object.entries(data.records).every(([key, record]) => validRecord(key, record))) {
    throw new Error('Unsupported or incomplete M’lang Go backup.');
  }
  return data;
}

export function createBackup(storage: Storage): string {
  const records: Record<string, unknown> = Object.fromEntries(keys.map(key => [key, JSON.parse(storage.getItem(key) || '[]')]));
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)!;
    if (/^mlang_pocket_bag_\d{4}-\d{2}-\d{2}$/.test(key)) records[key] = JSON.parse(storage.getItem(key)!);
    if (/^mlang_active_[\w-]+_\d{4}-\d{2}-\d{2}$/.test(key)) records[key] = storage.getItem(key)!;
  }
  const text = JSON.stringify({ app: 'mlang-go', version: 1, exportedAt: new Date().toISOString(), records });
  parseBackup(text);
  return text;
}

export function restoreBackup(text: string, storage: Storage) {
  const data = parseBackup(text); // Validate everything before touching current records.
  const previous = new Map<string, string | null>();
  try {
    for (const [key, value] of Object.entries(data.records)) {
      previous.set(key, storage.getItem(key));
      storage.setItem(key, key.startsWith('mlang_active_') ? String(value) : JSON.stringify(value));
    }
  } catch (error) {
    for (const [key, value] of previous) {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
    throw error;
  }
}
