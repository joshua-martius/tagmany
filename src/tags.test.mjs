import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeTags, normalizeTags } from './tags.js';

const sampleFrontmatter = {
  Created: '2022-03-30',
  Updated: '2023-08-06',
  Notebook: 'My Notes',
  TaGs: ['#Meetings'],
};

test('normalizeTags strips hashes and whitespace', () => {
  assert.deepEqual(normalizeTags(' test, #demo, test '), ['test', 'demo']);
});

test('mergeTags ignores casing of the tags property', () => {
  const merged = mergeTags(sampleFrontmatter, ['test']);
  assert.deepEqual(merged, ['Meetings', 'test']);
  assert.deepEqual(sampleFrontmatter.tags, ['Meetings', 'test']);
  assert.equal(sampleFrontmatter.TaGs, undefined);
});
