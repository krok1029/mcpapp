import { expect, test } from '@playwright/test';

test('serves the Vite-powered UI shell in a real browser', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'McpApp' })).toBeVisible();
});
