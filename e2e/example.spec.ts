
import { test, expect } from '@playwright/test';

test('page loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Basic check that the page loads
  await expect(page).toHaveTitle(/KIADISA/);
});

test('can navigate to auth page', async ({ page }) => {
  await page.goto('/');
  
  const authLink = page.getByRole('link', { name: /connexion/i });
  if (await authLink.isVisible()) {
    await authLink.click();
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  }
});
