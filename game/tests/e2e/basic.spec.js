import { test, expect } from '@playwright/test';

test.describe('Slot Machine UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Broke College Student Slot Machine');
  });

  test('should display three reels', async ({ page }) => {
    const reels = page.locator('#reels section');
    await expect(reels).toHaveCount(3);
  });

  test('spin button should be clickable', async ({ page }) => {
    const spinButton = page.getByRole('button', { name: 'Spin the slot machine' });
    await expect(spinButton).toBeVisible();
    await spinButton.click();
  });
});