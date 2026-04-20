# Persona Docs: Project Slot Machine
**Document Purpose:** To define personas for our AI-assisted slot machine application, ensuring our prompt engineering and architectural decisions remain user-centric, specifically prioritizing accessibility and minimalist design.

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
