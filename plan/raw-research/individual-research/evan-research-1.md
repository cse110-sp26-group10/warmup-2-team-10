# Slot Machine Mechanics & Industry Jargon

**Research Artifact** | CSE 110 Warm-Up II | cse110-sp26-group10

---

## Types of Slot Machines

### Classic / 3-Reel Slots
The original format — three spinning reels, one to three paylines, simple symbols (bars, 7s, cherries, bells). Very little bonus complexity. Good reference for a minimal implementation baseline.

### Video Slots (5-Reel)
The dominant modern format. Five reels, multiple rows (usually 3), and anywhere from 9 to 1,024+ paylines. Support for wilds, scatters, free spins, and multi-level bonus rounds. This is the standard players expect from a web game today.

### Multi-Way / 243-Way Slots
Instead of fixed paylines, wins pay on any matching symbols in adjacent reels left-to-right. Removes the concept of selecting paylines entirely — every spin covers all ways. Player-friendly and increasingly common.

### Progressive Jackpot Slots
A portion of every bet feeds a shared jackpot that grows until won. Usually networked across many machines or players. For a web game, a simulated or local progressive counter adds excitement without real money.

### Megaways Slots
A licensed mechanic (Big Time Gaming) where each reel randomly shows 2–7 symbols per spin, creating up to 117,649 ways to win on a given spin. Very high variance, extremely popular in modern web slots.

### Bonus Buy / Feature Buy Slots
Players can directly purchase access to the bonus round at a fixed multiplier of their bet (e.g., 80x). Controversial in regulated markets but common in casual web games.

---

## Core Industry Jargon

### Paylines
Lines across the reels on which matching symbol combinations pay out. Can be straight horizontal, diagonal, or zigzag patterns. Classic slots: 1–5 lines. Modern video slots: 20–50 fixed lines.

### RTP (Return to Player)
The theoretical percentage of wagered money a game pays back over an infinite number of spins. Industry standard is 94–97%. Example: a 96% RTP game returns $0.96 per $1 wagered over the long run. Important for balancing a web game — it's set through the payout table and probability math.

### Volatility / Variance
Describes the risk/reward profile of a game:
- **Low volatility**: Frequent small wins, steady balance. Good for casual players.
- **Medium volatility**: Balanced mix. Most popular design target.
- **High volatility**: Rare but large wins. Exciting but can feel punishing in short sessions.

For our game, volatility should be a deliberate design choice that maps to our user personas.

### Reels & Rows
- **Reels**: The vertical columns that spin (usually 3 or 5).
- **Rows**: The horizontal display rows per reel (usually 3). A 5x3 grid is the most common layout.

### Symbols
- **Standard symbols**: Ranked by payout value (low → high). Often split into low-value card rank symbols (9, 10, J, Q, K, A) and high-value themed symbols.
- **Wild**: Substitutes for any standard symbol to complete a winning line. Some wilds are "expanding" (fill the whole reel) or "sticky" (stay for re-spins).
- **Scatter**: Triggers a bonus or free spins regardless of payline position. Usually requires 3+ scatters anywhere on the grid.
- **Multiplier**: A symbol or feature that multiplies the win by a fixed factor (2x, 3x, 5x, etc.).
- **Bonus symbol**: Triggers a dedicated bonus mini-game, typically appearing only on certain reels.

### Free Spins
A bonus round awarding a set number of spins at no credit cost, often with enhanced mechanics (extra wilds, multipliers). Triggered by 3+ scatter symbols. The most universally expected feature in modern slots.

### Bonus Round / Bonus Game
A separate interactive mini-game triggered during play. Common types: pick-a-box (reveal prizes), wheel spin, climbing ladder, or an enhanced free-spin mode. Adds engagement and breaks up base gameplay.

### Hit Frequency
The percentage of spins that result in *any* win (even small ones). Separate from RTP. A game can have high RTP but low hit frequency (high volatility). Influences perceived fun significantly.

### Bet Level / Coin Value
Player controls that set the wager per spin. Typical structure: `total_bet = coin_value × coins_per_line × active_paylines`. Simplifying this to a single "bet" input is fine for a web game.

### Autoplay
Allows the player to set a number of spins to run automatically. A basic quality-of-life feature expected by most players.

### Paytable
An in-game reference screen showing every symbol, its payout for 3/4/5-of-a-kind combinations, and explanations for bonus features. Required for a polished implementation.

---

## Game Math Concepts (Relevant for Implementation)

| Concept | Notes |
|---|---|
| Symbol weighting | Each reel position has a weighted probability per symbol, not uniform randomness |
| Pay both ways | Some games pay left-to-right AND right-to-left, effectively doubling win frequency |
| Cascading reels | Winning symbols disappear and new ones fall in, allowing chain wins from one spin |
| Max win cap | Most games cap max win at 5,000–25,000x bet to control variance |

---

## Accessibility Considerations

- **Spin button** must be keyboard accessible (Enter/Space), not click-only
- **Reduced motion** support: provide a setting to skip or shorten reel animations for users with vestibular disorders (`prefers-reduced-motion` CSS media query)
- **Color contrast**: win/loss feedback must not rely on color alone — use icons or text labels too
- **Screen reader support**: announce win amounts via ARIA live regions so assistive tech can read them
- **Responsible gambling cues**: display current balance prominently; optionally add a session timer or loss limit warning

---

*Sources: MDN Web Docs (CSS media queries), Casino.org slot glossary, BigTimeGaming.com Megaways documentation, UKGC RTP guidelines*
