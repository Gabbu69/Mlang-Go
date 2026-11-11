import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBackup, parseBackup, restoreBackup } from '../src/utils/backup.ts';
import { getOpenStatus } from '../src/utils/timeUtils.ts';
import type { DirectoryListing } from '../src/types/directory.ts';

class MemoryStorage {
  values = new Map<string, string>();
  failOnce = '';
  get length() { return this.values.size; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failOnce === key) { this.failOnce = ''; throw new Error('Storage full'); }
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

test('complete backup round-trip excludes unrelated storage and recovery keys', () => {
  const source = new MemoryStorage();
  source.setItem('mlang_pocket_favorites', '["municipal-office"]');
  source.setItem('mlang_pocket_bag_2026-11-11', '{"id":true}');
  source.setItem('mlang_active_office_2026-11-11', '2026-11-11T00:00:00Z');
  source.setItem('unrelated', 'private');
  source.setItem('mlang_pocket_errands_recovery', 'damaged');
  const text = createBackup(source);
  const target = new MemoryStorage();
  restoreBackup(text, target);
  assert.equal(target.getItem('mlang_pocket_favorites'), '["municipal-office"]');
  assert.equal(target.getItem('mlang_pocket_bag_2026-11-11'), '{"id":true}');
  assert.equal(target.getItem('mlang_active_office_2026-11-11'), '2026-11-11T00:00:00Z');
  assert.equal(target.getItem('unrelated'), null);
  assert.equal(target.getItem('mlang_pocket_errands_recovery'), null);
});

test('invalid or oversized snapshots never change current records', () => {
  const current = new MemoryStorage();
  current.setItem('mlang_pocket_favorites', '["keep"]');
  const valid = JSON.parse(createBackup(new MemoryStorage()));
  for (const change of [
    { version: 99 }, { records: { ...valid.records, unrelated: [] } },
    { records: { ...valid.records, mlang_pocket_errands: [{ title: 'invalid' }] } },
    { records: {} },
  ]) {
    assert.throws(() => restoreBackup(JSON.stringify({ ...valid, ...change }), current));
    assert.equal(current.getItem('mlang_pocket_favorites'), '["keep"]');
  }
  assert.throws(() => parseBackup('x'.repeat(2 * 1024 * 1024 + 1)), /limit/);
});

test('storage failure rolls back previously written records', () => {
  const source = new MemoryStorage();
  source.setItem('mlang_pocket_favorites', '["new"]');
  const target = new MemoryStorage();
  target.setItem('mlang_pocket_favorites', '["old"]');
  target.failOnce = 'mlang_pocket_errands';
  assert.throws(() => restoreBackup(createBackup(source), target), /Storage full/);
  assert.equal(target.getItem('mlang_pocket_favorites'), '["old"]');
  assert.equal(target.getItem('mlang_pocket_errands'), null);
});

test('schedule changes at Manila opening and closing boundaries', () => {
  const listing = { verificationStatus: 'provisional', openingHours: { daysOpen: [1,2,3,4,5], openHour: 8, closeHour: 17 } } as DirectoryListing;
  assert.equal(getOpenStatus(listing, new Date('2026-11-11T07:59:59+08:00')).isOpen, false);
  assert.equal(getOpenStatus(listing, new Date('2026-11-11T08:00:00+08:00')).isOpen, true);
  assert.equal(getOpenStatus(listing, new Date('2026-11-11T17:00:00+08:00')).isOpen, false);
  assert.match(getOpenStatus(listing, new Date('2026-11-11T08:00:00+08:00')).statusText, /Draft/);
});
