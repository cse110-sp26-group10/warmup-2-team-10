import { test, expect } from "@playwright/test";

test.describe("Slot Machine UI Iteration", () => {
  test.beforeEach(async ({ page }) => {
    // Uses the baseURL from your playwright.config.js
    await page.goto("/");
  });

  test("accessibility: sections are correctly labeled by headings", async ({ page }) => {
    // Verify the main reels section
    const reels = page.locator("#reels");
    await expect(reels).toHaveAttribute("aria-labelledby", "reels-heading");

    // Verify individual reels
    const reel1 = page.locator("section:has(h3:text('Reel 1'))");
    await expect(reel1).toHaveAttribute("aria-labelledby", "reel-1-heading");
  });

  test("controls: buttons are accessible and present", async ({ page }) => {
    const spinButton = page.getByRole("button", { name: "Spin the slot machine" });
    const muteButton = page.getByRole("button", { name: "Toggle game sound" });

    await expect(spinButton).toBeVisible();
    await expect(muteButton).toHaveAttribute("aria-pressed", "false");
  });

  test("results: announcer has the correct accessibility attributes", async ({ page }) => {
    const results = page.locator("#results-announcer");
    await expect(results).toHaveAttribute("aria-live", "polite");
    await expect(results).toHaveAttribute("aria-atomic", "true");
  });
});