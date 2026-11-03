// Local civil dates for prayer schedules. Never use toISOString() for a local day.
export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    throw new Error('Invalid local date.');
  }
  const [year, month, day] = key.split('-').map(Number);
  // Midday avoids ambiguous/missing local midnight during DST transitions.
  const value = new Date(year, month - 1, day, 12);
  if (value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day) {
    throw new Error('Invalid calendar date.');
  }
  return value;
}

export function addLocalDays(key, days) {
  const date = parseLocalDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function calendarDayDifference(start, end) {
  const a = parseLocalDateKey(start);
  const b = parseLocalDateKey(end);
  const utcDay = date => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((utcDay(b) - utcDay(a)) / 86400000);
}

export function getNovenaDay(start, today, totalDays) {
  const difference = calendarDayDifference(start, today);
  return difference >= 0 && difference < totalDays ? difference + 1 : null;
}
