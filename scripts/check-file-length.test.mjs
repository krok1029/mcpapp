import assert from 'node:assert/strict';
import test from 'node:test';

import {
  countPhysicalLines,
  findOversizedFiles,
  isCodeFile,
  isTestFile,
} from './check-file-length.mjs';

test('accepts a non-test code file with exactly 600 physical lines', () => {
  const violations = findOversizedFiles([
    { path: 'src/large.ts', content: `${'line\n'.repeat(599)}line` },
  ]);

  assert.deepEqual(violations, []);
});

test('rejects a non-test code file with 601 physical lines', () => {
  const violations = findOversizedFiles([
    { path: 'src/too-large.ts', content: `${'line\n'.repeat(600)}line` },
  ]);

  assert.deepEqual(violations, [{ path: 'src/too-large.ts', lines: 601 }]);
});

test('exempts test files and test directories', () => {
  const content = `${'line\n'.repeat(600)}line`;
  const violations = findOversizedFiles([
    { path: 'src/large.test.ts', content },
    { path: 'src/large.spec.tsx', content },
    { path: 'test/large.ts', content },
    { path: 'tests/large.ts', content },
    { path: 'src/__tests__/large.ts', content },
    { path: 'apps/web/e2e/large.ts', content },
  ]);

  assert.deepEqual(violations, []);
});

test('does not mistake directory names containing test for test directories', () => {
  assert.equal(isTestFile('src/contest/large.ts'), false);
  assert.equal(isTestFile('src/latest/large.ts'), false);
});

test('recognizes source-code extensions case-insensitively', () => {
  assert.equal(isCodeFile('src/service.ts'), true);
  assert.equal(isCodeFile('src/component.TSX'), true);
  assert.equal(isCodeFile('src/styles.css'), true);
  assert.equal(isCodeFile('docs/design.md'), false);
  assert.equal(isCodeFile('config/settings.json'), false);
});

test('counts blank and comment lines, without inventing a line after the final newline', () => {
  assert.equal(countPhysicalLines('code\n\n// comment\n'), 3);
  assert.equal(countPhysicalLines(''), 0);
});
