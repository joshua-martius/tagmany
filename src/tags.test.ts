import test from 'node:test';
import * as assert from 'node:assert/strict';
import { mergeTags, normalizeTags } from './tags.js';

const sampleFrontmatter: Record<string, any> = {
  Created: '2022-03-30',
  Updated: '2023-08-06',
  Notebook: 'My Notes',
  Tags: ['#Meetings'],
};

test('normalizeTags strips hashes and whitespace', () => {
  assert.deepEqual(normalizeTags(' test, #demo, test '), ['test', 'demo']);
});

test('mergeTags merges existing capitalized and lowercase tag keys without duplication', () => {
  const merged = mergeTags(sampleFrontmatter, ['test']);
  assert.deepEqual(merged, ['Meetings', 'test']);
  assert.deepEqual(sampleFrontmatter.tags, ['Meetings', 'test']);
  assert.equal(sampleFrontmatter.Tags, undefined);
});
