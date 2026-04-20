# Research Overview

## Summary of Domain Findings

Our team’s domain research shows that slot machines are deceptively simple systems with a wide range of design, mathematical, and experiential considerations.

### Slot Machine Types & Structure
Slot machines range from **classic 3-reel slots** (simple, minimal features) to **modern video slots (5-reel)** with multiple paylines, animations, and bonus systems. Other variations include:
- Progressive jackpots (shared reward pools)
- Multi-way systems (243+ ways to win instead of fixed paylines)
- Themed and 3D slots (increased immersion)

A standard modern layout is typically a **5x3 grid**, though simpler implementations (e.g., 3x3) are easier for development.

### Core Mechanics & Terminology
Key concepts that define slot machine behavior:
- **RTP (Return to Player):** Expected long-term payout percentage
- **Volatility (Variance):** Risk level (frequent small wins vs rare large wins)
- **Paylines:** Paths across reels that determine wins
- **Symbols:** Include standard, wild (substitute), and scatter (trigger bonuses)
- **Bonus Systems:** Free spins, multipliers, and mini-games

From an implementation perspective:
- Games rely on **weighted randomness**, not uniform RNG
- The grid is modeled as a **2D array**
- Win logic involves **pattern matching across paylines**

### Design & UX Principles
Effective slot machines emphasize:
- **Clear core loop:** bet → spin → result
- **Visible information:** credits, bet size, outcomes
- **Simple layout:** reels centered, controls clearly separated
- **Immediate feedback:** animations, sounds, win messages

Good design avoids clutter and ensures readability, while still maintaining engagement.

### Psychology & Player Behavior
Slot machines are heavily influenced by behavioral psychology:
- **Variable rewards** (random wins) increase engagement
- **Near-misses** trigger similar reactions as actual wins
- **Fast play speed** keeps users in continuous interaction
- **Sensory design** (color, sound, animation) reinforces positive feedback

The goal is to maximize **time on device (TOD)** through smooth, low-friction interaction.

### Visual Themes & Engagement
Themes significantly impact user engagement. Common themes include:
- Retro/fruit (simple, nostalgic)
- Mythology/adventure (rich visuals, narrative)
- Sci-fi/fantasy (strong visual effects)

Color and visual hierarchy are critical:
- Bright/high-contrast symbols for readability
- Thematic color palettes for immersion
- Animations to highlight wins and bonuses

---

## Summary of User Findings

Our user research focused on understanding **who plays slot machines and why**, along with implications for design.

### User Motivations
Users are not always focused on winning money. Instead, they value:
- **Entertainment and relaxation**
- **Immersion (“machine zone”)**
- **Simple, repetitive interaction loops**
- **Occasional rewards and excitement**

### Behavioral Insights
- Players respond strongly to **dopamine-triggering events** (wins and near-wins)
- Many users prefer **low-effort interaction** (fast spins, autoplay)
- Simplicity is key — overly complex systems reduce engagement
- Some users enjoy **social aspects** (competition, sharing, progression)

### Target User Groups
Identified user groups include:
- College students / young professionals (casual play, entertainment, humor)
- Older adults (simplicity)
- Casual web users (low-stakes, fake money context)

### UX Implications
- Keep the interface **simple and intuitive**
- Provide **clear feedback** (not just color-based)
- Avoid overwhelming users with too many features initially
- Consider **optional social or progression features** (but not core)

---

## Links / References to Raw Research

All detailed notes and source materials can be found in: `raw-research/`


### Key Artifacts
- Slot machine types and terminology notes
- Psychology and behavioral research summaries
- Competitor analysis (Starburst, Book of Dead, etc.)
- UI/UX layout and accessibility notes
- Visual theme and color research
- Web-based slot game feature breakdowns

### External References (from research)
- Slot machine design and psychology articles
- WCAG 2.1 accessibility guidelines
- MDN Web Docs (CSS, layout, accessibility)
- Industry slot machine documentation and demos

---

## Team Roster & Contributions

### Aron Wu
- Researched **types of slot machines** and categorized them (classic, video, progressive, etc.)
- Documented **core terminology** (RTP, volatility, wilds, scatters, bonuses)
- Analyzed **design psychology**, including color usage and player perception
- Proposed transitioning toward a **video slot model** with engagement features

### Benedict Luis
- Defined **core gameplay loop** and essential UI components (credits, bet, spin)
- Designed **reel layouts, symbol systems, and win logic**
- Created **user flow structure** for intuitive gameplay
- Provided **visual design and accessibility guidelines**

### Bethany Miyamoto
- Conducted **existing web game analysis** (Blackbeard, Troya, Goldilocks)
- Identified **common expected features** (RNG, paylines, payouts)
- Suggested **optional features** (free spins, autoplay, bonuses)
- Emphasized learning from competitors while avoiding duplication

### Evan
- Performed **deep industry analysis** of slot formats and mechanics
- Compared major games (Starburst, Book of Dead, Slotomania)
- Identified **feature gaps (accessibility)** as differentiation opportunities
- Proposed **visual themes and wireframe structure**

### Han Yang-Lin
- Researched **slot machine psychology and addiction mechanisms**
- Explained **variable reward systems (Skinner Box)**
- Analyzed **casino environment design (sound, lighting, layout)**
- Connected psychology to **player retention strategies**

### Nicole Sutedja
- Mapped **industry terminology to implementation logic**
- Defined **state management and data structures**
- Proposed **clean architecture and modular design approach**
- Emphasized **accessibility and semantic web practices**

### Kaley Chung
- Researched **visual themes and color theory in slot design**
- Analyzed **how themes influence gameplay and engagement**
- Identified **reward systems and player incentives**
- Conducted **user behavior research** (social aspects, addiction, demographics)

---

## Overall Takeaway

Slot machines combine **simple mechanics with complex design decisions** across math, UX, psychology, and visuals. For our project, the most important priorities are:

- Clear and intuitive gameplay
- Balanced engagement (without clutter)
- Thoughtful visual and interaction design
- Strong accessibility and usability

This foundation will guide our transition from a basic slot prototype to a more polished, engaging web-based slot experience.
