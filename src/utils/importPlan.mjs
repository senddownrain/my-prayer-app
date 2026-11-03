// Pure import validation and planning: no Firebase calls, safe to unit-test.
export function validateBackup(value) {
  if (!Array.isArray(value)) throw new Error('Backup must be a JSON array.');
  const seen = new Set();
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Invalid prayer at index ${index}.`);
    }
    if (typeof item.id !== 'string' || !item.id.trim() || item.id.includes('/')) {
      throw new Error(`Invalid document ID at index ${index}.`);
    }
    if (seen.has(item.id)) throw new Error(`Duplicate document ID: ${item.id}`);
    seen.add(item.id);
    if (typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error(`Missing prayer title at index ${index}.`);
    }
    if (typeof item.lang !== 'string' || !item.lang.trim()) {
      throw new Error(`Missing prayer language at index ${index}.`);
    }
    if (typeof item.text !== 'string') {
      throw new Error(`Invalid prayer text at index ${index}.`);
    }
  }
  return value;
}

// 'add' preserves existing documents. 'overwrite' replaces them.
export function createImportPlan(backup, existingIds, mode) {
  validateBackup(backup);
  if (!['add', 'overwrite'].includes(mode)) throw new Error('Unknown import mode.');
  const operations = [];
  let skipped = 0;
  let added = 0;
  let updated = 0;
  for (const { id, ...data } of backup) {
    const exists = existingIds.has(id);
    if (exists && mode === 'add') {
      skipped++;
      continue;
    }
    operations.push({ id, data });
    if (exists) updated++;
    else added++;
  }
  return { operations, added, updated, skipped };
}
