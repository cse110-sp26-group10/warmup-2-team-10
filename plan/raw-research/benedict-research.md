# Research Artifact: Slot Machine UI, Features, and User Flow
**Researcher:** Benedict Lui

Below are some notes I put together on slot machine mechanics, interface ideas and specific features to consider when we start designing and prompting the AI.

## 1. Core Game Elements to Include
A slot machine game should make the main gameplay loop obvious: place a bet, spin and see the result immediately. Some features that seem important:

* **Credit Balance:** The current credit amount should always be visible at the top of the screen.
    * *Example:* `Credits: 950`
* **Bet Amount:** The player should be able to increase or decrease the bet without confusion.
    * *Example:* `Bet: 25` with `-` and `+` buttons beside it.
* **Spin Button:** This should be the most noticeable button on the page.
    * *Example:* a large centered button labeled `SPIN`
* **Result Message:** The game should clearly tell the user whether they won or lost.
    * *Example:* `You won 50 credits!` or `No match, try again.`
* **Paytable:** A visible section that explains symbol values or winning combinations.
    * *Example:* `3 cherries = 10`, `3 sevens = 100`

## 2. Reel Layout and Symbol Ideas
A standard slot machine layout usually looks like a 3-row by 3-column or 3-row by 5-column grid. I think either could work, but a **3x3 layout** may be easier to build and understand at first.

* **Possible Symbols (most commonly use):**
    * Cherry
    * Lemon
    * Bell
    * Seven
    * Diamond
    * Die (dice)
* **Possible Symbol Value System:**
    * Cherry = common, lower payout
    * Bell = medium payout
    * Seven = high payout
    * Diamond = rare, highest payout

This would make it easier to give the game a sense of progression even if the logic stays simple.

## 3. Win Logic Ideas
Even if we do not build a complicated casino-level slot machine, we still need clear logic for what counts as a win.

* **Simple Payline Idea:** Only count the middle row.
    * *Example:* if row 2 shows `Cherry | Cherry | Cherry`, that is a win.
* **Alternative Option:** Count all horizontal rows.
    * *Example:* top, middle, and bottom rows can each trigger a payout.
* **Wild Symbol Idea:** A wildcard could replace any regular symbol.
    * *Example:* `Cherry | Wild | Cherry` still counts as a match.
* **Scatter Symbol Idea:** A special symbol could trigger a bonus if enough appear anywhere on the board.
    * *Example:* 3 stars anywhere on the grid gives free bonus credits.

If we want a cleaner first version, only using one payline is probably best. If we want more interesting logic, we could expand later.

## 4. User Flow
The game should be easy enough that a new user can figure it out in a few seconds.

A possible user flow:
1. User sees current credits and current bet.
2. User adjusts the bet if needed.
3. User presses spin.
4. Reels animate for a short time.
5. Final symbols appear.
6. Game announces win/loss and updates credits.

This matters because if the flow is unclear, even a visually good game will feel confusing.

## 5. Visual Design Direction
A lot of online slot games are very flashy, but many of them also feel cluttered. I think our project should aim for something that still feels fun but is easier to read.

* **Good visual choices:**
    * clear separation between reels and controls
    * large readable text
    * one main accent color for buttons
    * consistent symbol style
* **Things to avoid:**
    * too many animations at once
    * small hard-to-read labels
    * too many bright colors fighting each other
    * hidden information like credits or payouts

A cleaner design would probably make the project look more polished overall.

## 6. Specific Interface Ideas
Some interface details that seem useful:

* **Top Bar:** credits, current bet, maybe a game title
* **Center Area:** slot reels
* **Bottom Controls:** spin button, bet increase/decrease
* **Side or Bottom Panel:** paytable and instructions

Example layout idea:

- Top: `Credits: 1000` | `Bet: 25`
- Middle: reel grid
- Bottom: `-` `+` `SPIN`
- Below: small paytable and symbol meanings

This kind of structure seems simple and practical for both users and development.

## 7. Accessibility Notes
Since this is still a web app, I think accessibility should be part of the design from the beginning.

* **Keyboard Access:** user should be able to tab to the spin button and bet controls
* **Clear Labels:** buttons should say exactly what they do
* **Readable Contrast:** text should be easy to read against the background
* **Not Color-Only Feedback:** wins should not only be shown through color changes
    * *Example:* also display text like `Win: 50 credits`

This would make the game more usable and also help it feel more complete. The assignment also emphasizes software engineering quality and user-centered thinking, so accessibility fits that expectation well. 

## 8. Takeaway
The main thing I found is that even though slot machines are simple games, there are a lot of small design choices that affect how good the final result feels. I think it's most important to have a clear layout, visible game information, understandable win logic, and a polished but not overly cluttered style.



