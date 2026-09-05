import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('contracts workspace bootstrap', () => {
  it('keeps every required quality command executable', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { scripts?: Record<string, string> };

    for (const command of ['build', 'test', 'typecheck']) {
      expect(packageJson.scripts?.[command]?.trim()).toBeTruthy();
    }
  });
});
