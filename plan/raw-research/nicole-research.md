# Research Artifact: Slot Machine Mechanics, Visuals, & Architecture
**Researcher:** Nicole Sutedja

Below are some considerations for when we start prompting the AI and useful links!

## 1. Industry Jargon & State Logic Mapping
To effectively prompt the AI, we need to map casino jargon directly to data structures and logic (so it understands what they mean).

* **RTP (Return to Player):** The theoretical percentage of wagered money paid back over time.
    * *Logic Implication:* We aren't building a true gambling engine, but our RNG (Random Number Generator) needs a weighted probability distribution array rather than a simple `Math.random()`.
* **Volatility (Variance):** * Low = frequent small wins. High = rare massive wins.
    * *Logic Implication:* We should configure symbol weights. E.g., `{ symbol: 'cherry', weight: 50, payout: 2 }` vs `{ symbol: 'diamond', weight: 2, payout: 100 }`.
* **Paylines:** The specific paths across the reels that trigger a win.
    * *Logic Implication:* We need to represent the grid as a 2D array (e.g., `grid[3][5]`). Checking paylines requires traversing specific matrix indices (e.g., straight middle row: `grid[1][0]` to `grid[1][4]`).
* **Wilds:** Symbols that substitute for any standard symbol to complete a payline.
    * *Logic Implication:* A conditional check during the payline evaluation phase (`if symbol == match_target or symbol == 'WILD'`).
* **Scatters:** Symbols that trigger wins or events regardless of where they land on paylines.
    * *Logic Implication:* Requires an independent `reduce` or `filter` pass over the entire 2D array to count occurrences before checking standard paylines.
* **Multipliers & Bonus Rounds:** * *Logic Implication:* Requires a robust state management system (e.g., `gameState.isBonusRound = true`, `gameState.currentMultiplier = 2`).

## 2. Visual Themes & Design Philosophy
* **Competitor Analysis (Web-based Slots):** Most HTML5 slots (like those on traditional online casinos) use `<canvas>` or WebGL. They are heavily cluttered with neon graphics, complex animations, and dense UI overlays. 
    * We need to prompt the AI to make sure the visuals match similar ones found online and is not too cluttered.
* **Our Visual Direction:** A **minimalist, clear design language**. 
    * Flat UI, high contrast, and ample whitespace.
    * We should use CSS transitions to keep it clean and organized.
    * Reference the web accessibility link!

## 3. Architecture & Expected Features
To maintain clean code and ensure testability (for Playwright/Jest), we must avoid monolithic functions -> where everything resides in one code base.

* **Expected Features:**
    * Dynamic Credit Balance (`balance -= bet`, `balance += winAmount`).
    * Adjustable Bet Sizing (+ / - controls).
    * Spin mechanism with a simulated delay (Promise-based `setTimeout` to mimic reel spinning).
    * A static, highly visible Paytable for user reference.

## 4. Accessibility Considerations
This is a critical failure point for most web games. If we use standard DOM elements instead of `<canvas>`, we can easily enforce these via AI prompts:
* **Keyboard Navigation:** The "Spin" action must be tied to the `Spacebar` and `Enter` keys. Bet adjustment must be accessible via `Tab` indexing and arrow keys.
* **Semantic HTML & ARIA:** * The main game board should use `aria-live="polite"` to announce spin results to screen readers (e.g., "Spin complete. You won 50 credits.").
    * Buttons must have clear `aria-labels` (not just an icon of a coin).
* **Visual Access:** Ensure the minimalist design adheres to WCAG AAA contrast ratios. Avoid relying purely on color to indicate a win (e.g., add a bold border or a specific text readout alongside the highlighted payline).

## Useful Reference Links & Docs
* [MDN Web Docs: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) (Crucial for prompting the 3x5 reel layout)
* [W3C Web Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
* [Understanding Math in Slot Machines (RTP & RNG)](https://www.casinonewsdaily.com/slots/mathematics/)
