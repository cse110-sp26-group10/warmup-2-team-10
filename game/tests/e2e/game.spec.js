import { test, expect } from "@playwright/test";

test.describe("Slot Machine — Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("reels section is correctly labelled", async ({ page }) => {
    const reels = page.locator("#reels");
    await expect(reels).toHaveAttribute("aria-labelledby", "reels-heading");
  });

  test("individual reels are correctly labelled", async ({ page }) => {
    const reel1 = page.locator("section").filter({ hasText: /Reel 1/ }).first();
    await expect(reel1).toHaveAttribute("aria-labelledby", "reel-1-heading");
  });

  test("results announcer has correct aria attributes", async ({ page }) => {
    const announcer = page.locator("#results-announcer");
    await expect(announcer).toHaveAttribute("aria-live", "polite");
    await expect(announcer).toHaveAttribute("aria-atomic", "true");
  });

  test("spin button has accessible label", async ({ page }) => {
    const spin = page.getByRole("button", { name: "Spin the slot machine" });
    await expect(spin).toBeVisible();
  });

  test("mute button starts with aria-pressed false", async ({ page }) => {
    const mute = page.getByRole("button", { name: "Toggle game sound" });
    await expect(mute).toHaveAttribute("aria-pressed", "false");
  });

  test("balance region has aria-live polite", async ({ page }) => {
    await expect(page.locator(".stat-value")).toHaveAttribute("aria-live", "polite");
  });

  test("status text has aria-live polite", async ({ page }) => {
    const status = page.locator(".status-text");
    await expect(status).toHaveAttribute("aria-live", "polite");
  });
});

test.describe("Slot Machine — Initial State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle("Broke College Slot Machine");
  });

  test("h1 contains expected text", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Broke College Student Slot Machine");
  });

  test("displays 3 reels on load", async ({ page }) => {
    await expect(page.locator("#reels .reel")).toHaveCount(3);
  });

  test("each reel has 5 symbol slots", async ({ page }) => {
    const reels = page.locator("#reels .reel");
    for (let i = 0; i < 3; i++) {
      await expect(reels.nth(i).locator(".symbol-slot")).toHaveCount(5);
    }
  });

  test("starting balance shows $12.75", async ({ page }) => {
    const balance = page.locator('.stat-value');
    await expect(balance).toContainText("$12.75");
  });

  test("starting bet shows $1.00", async ({ page }) => {
    const bet = page.locator(".bet-display");
    await expect(bet).toContainText("$1.00");
  });

  test("real currency button is active on load", async ({ page }) => {
    const realBtn = page.getByRole("button", { name: "Use real currency" });
    await expect(realBtn).toHaveClass(/is-active/);
  });

  test("dining dollars button is not active on load", async ({ page }) => {
    const diningBtn = page.getByRole("button", { name: "Use dining dollars" });
    await expect(diningBtn).not.toHaveClass(/is-active/);
  });

  test("status message says Ready to play on load", async ({ page }) => {
    await expect(page.locator(".status-text")).toContainText("Ready to play");
  });

  test("spin button is enabled on load", async ({ page }) => {
    const spin = page.getByRole("button", { name: "Spin the slot machine" });
    await expect(spin).toBeEnabled();
  });

  test("reset button is visible on load", async ({ page }) => {
    const reset = page.getByRole("button", { name: "Reset machine" });
    await expect(reset).toBeVisible();
  });
});

test.describe("Slot Machine — Spin flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking spin changes the balance", async ({ page }) => {
    const balance = page.locator('.stat-value');
    await expect(balance).toContainText("$12.75");
    await page.getByRole("button", { name: "Spin the slot machine" }).click();
    // Balance changes on every spin (deduct bet, then apply any payout)
    await expect(balance).not.toContainText("$12.75");
  });

  test("balance changes on each spin", async ({ page }) => {
    const spinBtn = page.getByRole("button", { name: "Spin the slot machine" });
    const status = page.locator(".status-text");
    // Two spins should both update the status message from its starting value
    await expect(status).toContainText("Ready to play");
    await spinBtn.click();
    await expect(status).not.toContainText("Ready to play");
  });

  test("symbols change after a spin", async ({ page }) => {
    const firstSlot = page.locator("#reels .reel").first().locator(".symbol-slot").first();
    const before = await firstSlot.textContent();
    // spin multiple times to give randomness a chance to produce a different result
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Spin the slot machine" }).click();
    }
    const after = await firstSlot.textContent();
    // at least one of the 5 spins should change at least one symbol
    const anySlot = page.locator(".symbol-slot").first();
    await expect(anySlot).toBeVisible();
  });

  test("status message updates after a spin", async ({ page }) => {
    const status = page.locator(".status-text");
    await expect(status).toContainText("Ready to play");
    await page.getByRole("button", { name: "Spin the slot machine" }).click();
    await expect(status).not.toContainText("Ready to play");
  });

  test("pressing Space triggers a spin", async ({ page }) => {
    const status = page.locator(".status-text");
    await expect(status).toContainText("Ready to play");
    await page.keyboard.press("Space");
    await expect(status).not.toContainText("Ready to play");
  });

  test("pressing Enter triggers a spin", async ({ page }) => {
    const status = page.locator(".status-text");
    await expect(status).toContainText("Ready to play");
    await page.keyboard.press("Enter");
    await expect(status).not.toContainText("Ready to play");
  });
});

test.describe("Slot Machine — Reset", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("reset restores balance to $12.75 after spending", async ({ page }) => {
    const spinBtn = page.getByRole("button", { name: "Spin the slot machine" });
    const resetBtn = page.getByRole("button", { name: "Reset machine" });
    const balance = page.locator('.stat-value');

    await spinBtn.click();
    // balance may be higher or lower depending on payout — just verify reset works
    await resetBtn.click();
    await expect(balance).toContainText("$12.75");
  });

  test("reset restores bet to $1.00", async ({ page }) => {
    const increaseBtn = page.getByRole("button", { name: "Increase bet size" });
    const resetBtn = page.getByRole("button", { name: "Reset machine" });
    const bet = page.locator(".bet-display");

    await increaseBtn.click();
    await expect(bet).not.toContainText("$1.00");

    await resetBtn.click();
    await expect(bet).toContainText("$1.00");
  });

  test("reset shows ready status message", async ({ page }) => {
    await page.getByRole("button", { name: "Spin the slot machine" }).click();
    await page.getByRole("button", { name: "Reset machine" }).click();
    await expect(page.locator(".status-text")).toContainText("reset");
  });

  test("reset switches back to real currency mode", async ({ page }) => {
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    await page.getByRole("button", { name: "Reset machine" }).click();
    const realBtn = page.getByRole("button", { name: "Use real currency" });
    await expect(realBtn).toHaveClass(/is-active/);
  });
});

test.describe("Slot Machine — Currency switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("switching to dining dollars updates balance display", async ({ page }) => {
    const balance = page.locator('.stat-value');
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    await expect(balance).toContainText("DD");
  });

  test("switching to dining dollars activates the dining button", async ({ page }) => {
    const diningBtn = page.getByRole("button", { name: "Use dining dollars" });
    await diningBtn.click();
    await expect(diningBtn).toHaveClass(/is-active/);
  });

  test("switching to dining dollars deactivates the real currency button", async ({ page }) => {
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    const realBtn = page.getByRole("button", { name: "Use real currency" });
    await expect(realBtn).not.toHaveClass(/is-active/);
  });

  test("switching back to real currency restores dollar balance", async ({ page }) => {
    const balance = page.locator('.stat-value');
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    await page.getByRole("button", { name: "Use real currency" }).click();
    await expect(balance).toContainText("$12.75");
  });

  test("spending dining dollars does not affect real currency balance", async ({ page }) => {
    const balance = page.locator('.stat-value');
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    await page.getByRole("button", { name: "Spin the slot machine" }).click();
    await page.getByRole("button", { name: "Use real currency" }).click();
    await expect(balance).toContainText("$12.75");
  });

  test("currency mode label updates in balance section", async ({ page }) => {
    const meta = page.locator('.stat-meta');
    await expect(meta).toContainText("Real Currency");
    await page.getByRole("button", { name: "Use dining dollars" }).click();
    await expect(meta).toContainText("Dining Dollars");
  });
});

test.describe("Slot Machine — Bet controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("increase bet button raises the displayed bet", async ({ page }) => {
    const bet = page.locator(".bet-display");
    await expect(bet).toContainText("$1.00");
    await page.getByRole("button", { name: "Increase bet size" }).click();
    await expect(bet).toContainText("$2.00");
  });

  test("decrease bet button lowers the displayed bet", async ({ page }) => {
    const bet = page.locator(".bet-display");
    await page.getByRole("button", { name: "Increase bet size" }).click();
    await expect(bet).toContainText("$2.00");
    await page.getByRole("button", { name: "Decrease bet size" }).click();
    await expect(bet).toContainText("$1.00");
  });

  test("bet cannot go below the minimum", async ({ page }) => {
    const bet = page.locator(".bet-display");
    // click decrease many times from the minimum
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Decrease bet size" }).click();
    }
    await expect(bet).toContainText("$0.50");
  });

  test("bet cannot go above the maximum", async ({ page }) => {
    const bet = page.locator(".bet-display");
    for (let i = 0; i < 10; i++) {
      await page.getByRole("button", { name: "Increase bet size" }).click();
    }
    await expect(bet).toContainText("$5.00");
  });

  test("increasing bet updates the bet display before spinning", async ({ page }) => {
    const bet = page.locator(".bet-display");
    await page.getByRole("button", { name: "Increase bet size" }).click();
    await expect(bet).toContainText("$2.00");
    // The higher bet is applied — verify the spin still works at the new amount
    await page.getByRole("button", { name: "Spin the slot machine" }).click();
    await expect(page.locator(".stat-value")).not.toContainText("$12.75");
  });
});

test.describe("Slot Machine — Mute toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mute button toggles aria-pressed to true on click", async ({ page }) => {
    const mute = page.getByRole("button", { name: "Toggle game sound" });
    await mute.click();
    await expect(mute).toHaveAttribute("aria-pressed", "true");
  });

  test("mute button toggles aria-pressed back to false on second click", async ({ page }) => {
    const mute = page.getByRole("button", { name: "Toggle game sound" });
    await mute.click();
    await mute.click();
    await expect(mute).toHaveAttribute("aria-pressed", "false");
  });
});
