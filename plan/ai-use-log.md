# AI Use Log: Project Slot Machine
**Document Purpose:** To track our interactions with the LLM, documenting our prompts, the AI's responses, our learnings, and any necessary hand-edits, fulfilling the requirement of at least 20 logged entries.

---
## Logging Template
*Please copy and paste this template for every iteration you run.*
### Iteration [1]: [Short Description of Task]

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
* The code compiled successfully and produced a static HTML layout for a slot machine game. It includes a clean structure, ARIA attributes, and a result region that uses aria-live. An interesting finding is that the reels are hardcoded. This code would not pass linting since it is missing the full HTML boilerplate (<head>, <body>, <html>). It did not hallucinate in a way that mattered. It made minor assumptions, such as not making the reel symbolize flexible or exactly three reels. 

The output is clean and readable, but not interactive yet. 

**Hand-Edits Required? (Yes/No):**
* No

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
