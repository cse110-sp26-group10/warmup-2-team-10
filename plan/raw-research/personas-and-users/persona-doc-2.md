# Persona Docs: Project Slot Machine
**Document Purpose:** To define personas for our AI-assisted slot machine application, ensuring our prompt engineering and architectural decisions remain user-centric, specifically prioritizing accessibility and minimalist design.

## Persona 2: Elena - The Casual & Responsible College Student

### Demographics & Background
* **Age:** 21
* **Occupation:** Undergraduate Student in Graphic Design
* **Tech Proficiency:** Low to Medium.
* **Context:** Elena uses casual web games as a brief mental palette cleanser between intense study sessions at the library. She is highly organized, budget-conscious, and plays strictly for low-stakes entertainment. She is deeply critical of cluttered, inaccessible, or "spammy" user interfaces. 

### Goals
* To enjoy a relaxing, low-stakes "brain break" without cognitive fatigue.
* To navigate the interface effortlessly on her laptop trackpad or using keyboard shortcuts while keeping a low profile in public study spaces.

### Pain Points
* **Sensory Overload:** Chaotic layouts, un-mutable audio, and loud, clashing colors cause immediate eye strain and frustration when she's already tired from studying.
* **Opaque Mechanics:** Hidden paytables or confusing multi-directional win lines make the game feel frustrating and poorly designed.
* **Poor Accessibility:** Buttons that are too small to click quickly or interfaces that completely break when she zooms in on her browser.

### Software Engineering & AI Prompt Implications
* **Minimalist CSS & Readability:** The AI must be constrained to output a clean, minimalist UI utilizing ample whitespace, sans-serif typography, and distinct, readable states for all components to contrast with the "chaotic" dorm room theme.
* **Semantic HTML:** The architecture must prioritize standard, accessible HTML elements (`<button>`, `<header>`, `<dialog>` for the paytable) rather than rendering the entire game in an inaccessible `<canvas>`.
* **Clear State Display:** The `gameState.balance` (Dining Dollars) and `gameState.currentBet` variables must be prominently and persistently displayed in a clean dashboard, distinct from the visual noise of the reels.
* **Audio Constraints:** The prompt must explicitly require the game to start completely muted by default to respect players in quiet environments.
* **Semantic HTML:** The architecture must prioritize standard, accessible HTML elements (`<button>`, `<header>`, `<dialog>` for the paytable) rather than rendering the entire game in an inaccessible `<canvas>`.
* **Clear State Display:** The `gameState.balance` and `gameState.currentBet` variables must be prominently and persistently displayed in a clean dashboard, distinct from the visual noise of the reels.
