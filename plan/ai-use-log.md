# AI Use Log: Project Slot Machine
**Document Purpose:** To track our interactions with the LLM, documenting our prompts, the AI's responses, our learnings, and any necessary hand-edits, fulfilling the requirement of at least 20 logged entries.

---
## Logging Template
*Please copy and paste this template for every iteration you run.*
### Iteration [Number]: [Short Description of Task]

**The Prompt:**
> [Paste your exact prompt here. If you fed it previous files for context, note that here too.]

**The Result (What happened?):**
* [Did it compile? Any interesting findings? Did it pass linting? Did it hallucinate? Describe the output briefly.]

**Hand-Edits Required? (Yes/No):**
* [If yes, explain exactly what you touched in the code because the AI failed after two correction attempts. Example: "AI kept hallucinating array indices, had to manually fix the out-of-bounds error on line 42."]

---
## Iteration History

### Iteration 1: Create HTML Skeleton

**The Prompt:**
> Act as a strict senior software engineer focused on clean code, DRY principles, and accessibility.

Generate ONLY a semantic HTML skeleton for a browser-based slot machine game.

Theme: “Broke College Student Slot Machine”

Requirements:
- Use only: `<header>`, `<main>`, `<section id="reels">`, `<aside id="controls">`
- Include a Mute/Unmute toggle button (UI only, no JS)
- Include `aria-live="polite"` region for spin results
- Add appropriate ARIA labels for accessibility

Constraints:
- No CSS
- No JavaScript or logic
- No Web Audio API
- Use HTML comments only if needed for JSDoc-style annotations
- Keep structure clean and modular

Output ONLY HTML code.

**The Result (What happened?):**
* The code compiled successfully. It includes a clean structure, ARIA attributes, and a result region that uses aria-live. An interesting finding is that the reels are hardcoded. This code would not pass linting since it is missing the full HTML boilerplate (<head>, <body>, <html>). It did not hallucinate in a way that mattered. It made minor assumptions, such as not making the reel symbolize flexible or exactly three reels. 

The output is a static HTML layout for a slot machine game. It is clean and readable, but not interactive yet. 

**Hand-Edits Required? (Yes/No):**
* No

### Iteration 2: HTML and CSS Grid implementing a 3×5 reel layout with a high-contrast design.

**The Prompt:**
> Act as a strict senior software engineer focused on clean code, DRY principles, and accessibility.

Task: Refactor and extend the existing slot machine UI using semantic HTML + minimalist CSS.

Goal: Create a clean, accessible layout using CSS Grid for a 3x5 slot machine structure.

HTML Requirements:

- Use only semantic structure: header, main, section#reels, aside#controls
- Reels must support a 3-column layout
- Each reel must contain 5 stacked symbol slots
- Preserve ARIA attributes including aria-live and aria-labels
- Do not add JavaScript

CSS Requirements:

- Use CSS Grid for layout:
  - 3 columns for reels
  - 5 rows per reel
- High contrast minimalist design
- Clear spacing and alignment
- No animations or transitions
- No external frameworks
- Basic responsive behavior allowed

Constraints:

- No JavaScript
- No complex animations
- Keep code clean, modular, and non-overengineered

Output Rule:
Return ONLY updated HTML followed by CSS.
Feed into a new file


**The Result (What happened?):**
* The code compiled successfully. An interesting finding was that Codex intercepts “high-contrast” styling as a black background and white outlines. Personally, I interpret “high-constrast” as bright colors on the opposite sides of the color wheel. It would pass linting, but there may be minor warnings, such as redundant attributes. It did not hallucinate in a way that matters. Similar to Iteration 1, it showcases minor assumptions such as styling details.

The output was a static slot machine UI using HTML and CSS Grid. It features a 3x5 reel layout and high-contrast styling. 

**Hand-Edits Required? (Yes/No):**
* No

### Iteration 3: Set up the static visual elements

**The Prompt:**
> Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

Context:
- You are designing a slot machine themed around a broke college student.
- Symbols on a slot machine reel will include items like ramen packages, generic energy drinks, textbooks, loose change, and maybe a single "Wild" diploma.
- There will be a dual currency system that allows the player to switch between "Real Currency" and "Dining Dollars/Tokens."

Current State:
- There is a 3x5 slot machine structure, play and reset buttons, and basic CSS.
- The theme has not been incorporated yet.

Task: Refactor and extend the UI to implement static visual elements using HTML and CSS.

Requirements:
- Preserve the layout of 3 reels with 5 stacked symbols per reel.
- Set up the static visual elements for the slot machine. These include the dynamic balance display, bet size controls, a static paytable.
- Include a "Mute/Unmute" toggle to comply with browser auto-play policies and user preferences.
- Preserve ARIA attributes including aria-live and aria-labels.

Constraints:
- DO NOT add JavaScript.
- Restrict to only editing the HTML and CSS files.
- Adhere to the DRY principle.
- Before writing code, explain your formatting logic in a plain text comment.

**The Result (What happened?):**
* The code compiled successfully. Codex deleted both the HTML and CSS files and replaced them with new ones as opposed to editing on the original files. The basic static visual elements in the slot machine are all implemented, and the theme that was removed from Iteration 2 is readded. It was interesting how even though the files were completely remade, the basic structure of the slot machine on the left and controls on the right still remained. However, due to forgetting to add the context of keeping a minimalist CSS framework, the CSS file is noticeably longer than Iteration 2. The HTML file passed linting, but the CSS file did not, showing errors mostly regarding notation. It did not hallucinate in a way that matters.

**Hand-Edits Required? (Yes/No):**
* No.