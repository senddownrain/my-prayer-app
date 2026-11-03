import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackup, createImportPlan } from '../src/utils/importPlan.mjs';

const prayer = (id, title = 'Ойча наш') => ({
  id, title, text: '<p>Тэкст</p>', lang: 'be', tags: ['малітва'],
});

test('add mode skips existing IDs instead of overwriting them', () => {
  const plan = createImportPlan([prayer('same'), prayer('new')], new Set(['same']), 'add');
  assert.deepEqual({ added: plan.added, updated: plan.updated, skipped: plan.skipped }, { added: 1, updated: 0, skipped: 1 });
  assert.deepEqual(plan.operations.map(x => x.id), ['new']);
});

test('overwrite mode updates existing and adds new records', () => {
  const plan = createImportPlan([prayer('same'), prayer('new')], new Set(['same']), 'overwrite');
  assert.equal(plan.updated, 1);
  assert.equal(plan.added, 1);
  assert.equal(plan.skipped, 0);
  assert.equal(plan.operations.length, 2);
});

test('Firestore document IDs are stripped from stored fields', () => {
  const [operation] = createImportPlan([prayer('one')], new Set(), 'add').operations;
  assert.equal(operation.id, 'one');
  assert.equal(Object.hasOwn(operation.data, 'id'), false);
  assert.equal(operation.data.title, 'Ойча наш');
});

test('invalid rows are rejected before any write', () => {
  assert.throws(() => validateBackup({ id: 'x' }), /array/);
  assert.throws(() => validateBackup([{ id: 'x', title: 'test', lang: 'be' }]), /text/);
  assert.throws(() => validateBackup([prayer('dup'), prayer('dup')]), /Duplicate/);
  assert.throws(() => validateBackup([prayer('path/invalid')]), /ID/);
  assert.throws(() => createImportPlan([prayer('x')], new Set(), 'invalid'), /mode/);
});
