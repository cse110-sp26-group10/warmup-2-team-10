# Persona Docs: Project Slot Machine
**Document Purpose:** To define personas for our AI-assisted slot machine application, ensuring our prompt engineering and architectural decisions remain user-centric, specifically prioritizing accessibility and minimalist design.

---

## Persona 1: Bob - The High-Frequency Thrill-Seeker

### Demographics & Background
* **Age:** 38
* **Occupation:** Sales Manager
* **Tech Proficiency:** Moderate. Highly proficient with mobile gambling apps and online casino platforms.
* **Context:** Marcus exhibits behaviors consistent with gambling addiction. He plays slot machines daily, chasing the psychological thrill and dopamine release associated with high-volatility games. He is drawn to highly stimulating, fast-paced environments.

### Goals
* To experience continuous, rapid-fire gameplay without artificial delays.
* To be visually and audibly stimulated; he associates bright, bold colors and explosive animations with winning and excitement.
* To have access to high variance/volatility mechanics where massive (though rare) payouts are possible.

### Pain Points
* **Slow Pacing:** Mandatory delays between spins or unskippable animations frustrate him.
* **"Boring" Aesthetics:** Minimalist or muted designs feel unrewarding and fail to trigger the desired psychological excitement.
* **Bet Limits:** Restrictive maximum bet caps prevent him from chasing losses or scaling his risk.

### Software Engineering & AI Prompt Implications
* **State Management (Turbo Mode):** The application architecture must support a "Turbo Spin" state that bypasses standard animation delays, requiring efficient DOM updates.
* **Visual Engine:** The AI must be prompted to include bold, high-contrast CSS design elements (e.g., gold accents, neon highlights, vibrating animations on wins) to cater to this user's need for intense visual feedback.
* **Math Model:** The underlying RTP/Volatility algorithms (even if simulated) must allow for a "High Volatility" toggle to satisfy the desire for infrequent but massive simulated payouts.

---

## Persona 2: Elena - The Accessible Casual Player

### Demographics & Background
* **Age:** 29
* **Occupation:** Graphic Designer
* **Tech Proficiency:** High.
* **Context:** Elena occasionally plays web games to pass the time during commutes or breaks. She appreciates clean, modern web design and relies on straightforward interfaces. She is easily overwhelmed by sensory clutter and values accessibility and readability above all else.

### Goals
* To enjoy a relaxing, low-stakes entertainment experience without cognitive fatigue.
* To instantly understand the rules, paylines, and her current financial (simulated credit) standing.
* To navigate the interface easily, whether using a mouse, touch screen, or keyboard shortcuts.

### Pain Points
* **Sensory Overload:** The typical "Vegas aesthetic" with its chaotic layouts, flashing lights, and loud, clashing colors causes immediate eye strain and frustration.
* **Opaque Mechanics:** Hidden paytables or confusing multi-directional win lines make the game feel unfair or confusing.
* **Poor Accessibility:** Buttons that are too small to tap or lack clear, readable text labels.

### Software Engineering & AI Prompt Implications
* **Minimalist CSS & Readability:** The AI must be constrained to output a clean, minimalist UI utilizing ample whitespace, sans-serif typography, and distinct, readable states for all components.
* **Semantic HTML:** The architecture must prioritize standard, accessible HTML elements (`<button>`, `<header>`, `<dialog>` for the paytable) rather than rendering the entire game in an inaccessible `<canvas>`.
* **Clear State Display:** The `gameState.balance` and `gameState.currentBet` variables must be prominently and persistently displayed in a clean dashboard, distinct from the visual noise of the reels.
