import test from 'node:test';
import assert from 'node:assert/strict';
import { addLocalDays, calendarDayDifference, getNovenaDay, localDateKey, parseLocalDateKey } from '../src/utils/prayerDates.mjs';

test('local day format uses calendar fields', () => {
  assert.equal(localDateKey(new Date(2026, 10, 4, 23, 50)), '2026-11-04');
});

test('calendar arithmetic crosses year and leap-day boundaries', () => {
  assert.equal(addLocalDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addLocalDays('2028-02-28', 1), '2028-02-29');
  assert.equal(calendarDayDifference('2026-12-30', '2027-01-02'), 3);
});

test('novena day never uses the absolute value for dates before start', () => {
  assert.equal(getNovenaDay('2026-11-04', '2026-11-03', 9), null);
  assert.equal(getNovenaDay('2026-11-04', '2026-11-04', 9), 1);
  assert.equal(getNovenaDay('2026-11-04', '2026-11-12', 9), 9);
  assert.equal(getNovenaDay('2026-11-04', '2026-11-13', 9), null);
});

test('DST does not change the number of calendar days', () => {
  assert.equal(calendarDayDifference('2026-03-28', '2026-03-30'), 2);
  assert.equal(calendarDayDifference('2026-10-24', '2026-10-26'), 2);
});

test('malformed civil dates are rejected', () => {
  assert.throws(() => parseLocalDateKey('2026-02-31'), /date/);
  assert.throws(() => parseLocalDateKey('tomorrow'), /date/);
});
