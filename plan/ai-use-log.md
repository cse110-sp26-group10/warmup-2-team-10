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
* The code compiled successfully. It includes a clean structure, ARIA attributes, and a result region that uses aria-live. An interesting finding is that the reels are hardcoded. This code passed linting. It did not hallucinate. 

The output is a static, plain HTML layout for a slot machine game. It is clean and readable, but not interactive. 

**Hand-Edits Required? (Yes/No):**
* AI kept generating aria-label attributes that failed the test cases, so I manually fixed the code by removing repeated or unnecessary attributes on lines 8, 11-19, 21-23, 27-28, 35, 45, and 47. 

### Iteration 2: HTML and CSS Grid implementing a 3×5 reel layout with a high-contrast design.

**The Prompt:**
>Act as a strict senior software engineer focused on clean code, DRY principles, and accessibility.

Task: Refactor and extend the existing slot machine UI using semantic HTML + minimalist CSS.

Goal: Create a clean, accessible layout using CSS Grid for a 3x5 slot machine structure. The theme is: “Broke College Student Slot Machine.” 

HTML Requirements:

* Use only semantic structure: header, main, section#reels, aside#controls
* Reels must support a 3-column layout
* Each reel must contain 5 stacked symbol slots
* Preserve ARIA attributes including aria-live and aria-labels
* Do not add JavaScript

CSS Requirements:

* Use CSS Grid for layout:
  * 3 columns for reels
  * 5 rows per reel
* High contrast minimalist design
* Clear spacing and alignment
* No animations or transitions
* No external frameworks
* Basic responsive behavior allowed

Constraints:

* No JavaScript
* No complex animations
* Keep code clean, modular, and non-overengineered

Output Rule:
Return ONLY updated HTML followed by CSS.

Added to Codex after prompt: 
need to pass these npm run check
Individual tool commands:

npm run validate:html: Validates HTML structure across all iterations.
npm run lint: Runs both CSS and JS linters.
npm run test:unit: Executes Vitest unit tests.
npm run test:e2e: Executes Playwright tests (requires server at port 3000).

**The Result (What happened?):**
* The code compiled successfully. An interesting finding was that the Codex did not consider or address how the CSS and HTML files would be linked, despite being a critical step in ensuring the CSS styling is applied. The code passed linting. Codex did not hallucinate. 

The output can be described as an unstyled, unresponsive slot-machine layout with the elements stacked vertically. 

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
* The code compiled successfully. Codex deleted both the HTML and CSS files and replaced them with new ones as opposed to editing on the original files. The basic static visual elements in the slot machine are all implemented, and the theme that was removed from Iteration 2 is readded. It was interesting how even though the files were completely remade, the basic structure of the slot machine on the left and controls on the right still remained. However, due to forgetting to add the context of keeping a minimalist CSS framework, the CSS file is noticeably longer than Iteration 2. The CSS file passed linting, but the HTML file did not, showing errors that aria-label cannot be used on certain elements. It did not hallucinate in a way that matters.

**Hand-Edits Required? (Yes/No):**
* No.

### Iteration 4: Build the foundational Vanilla JS file structure

**The Prompt:**
> Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

Context:
- You are designing a slot machine themed around a broke college student.
- Symbols on a slot machine reel will include items like ramen packages, generic energy drinks, textbooks, loose change, and maybe a single "Wild" diploma.
- There will be a dual currency system that allows the player to switch between "Real Currency" and "Dining Dollars/Tokens."

Current State:
- There are a 3x5 slot machine structure, spin and reset buttons, currency switch buttons, and a mute/unmute button.
- Static visual elements including a dynamic balanace display, bet size controls, and a static paytable are implemented.
- There is basic styling in the CSS file.

Task: Start building the foundational Vanilla JS file structure.

Requirements:
- Preserve the current UI layout.
- Build the foundational Vanilla JS file structure.
- You must include complete JSDoc type annotations for all inputs and outputs.

Constraints:
- DO NOT delete or edit the existing HTML and CSS files.
- Use ONLY Vanilla JS and native browser APIs. DO NOT use frameworks or external libraries. The code must be able to run directly in modern browsers without a build step.
- Adhere to the DRY principle.
- Before writing code, explain your structural logic in a plain text comment.

Prompt 2:
> Link the JS file to the page.

**The Result (What happened?):**
* The code compiled successfully. As instructed, Codex only modified the JS file without making any changes on the HTML and CSS files, which also means that the JS file is not yet linked to the HTML page, so a second prompt was needed to do so. JSDoc type annotations are included for all inputs and outputs. The spin, reset, currency switch, and bet size change functions already seem to be working, though without the spin animation. The mute/unmute button also changes text when clicked. It was interesting how just the initial structure of the JS file already has more lines of code than the JS file of the final candidate in the previous research assignment. The JS file passed linting. It did not hallucinate in a way that matters.

**Hand-Edits Required? (Yes/No):**
* No.

### Iteration 5: Create a CI/CD configuration

**The Prompt:**
> Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

Context:
- You are designing a slot machine themed around a broke college student.
- Symbols on a slot machine reel will include items like ramen packages, generic energy drinks, textbooks, loose change, and maybe a single "Wild" diploma.
- There will be a dual currency system that allows the player to switch between "Real Currency" and "Dining Dollars/Tokens."

Current State:
- There are a 3x5 slot machine structure, spin and reset buttons, currency switch buttons, and a mute/unmute button.
- Static visual elements including a dynamic balanace display, bet size controls, and a static paytable are implemented.
- There is basic styling in the CSS file.
- The foundational Vanilla JS file structure has been created, with basic functionalities including spinning, resetting, currency switching, and bet size changing already working.

Task: Create a CI/CD configuration to enforce "Clean Code" requirements immediately.

Requirements:
- Create a CI/CD configuration for ESLint and Prettier.
- Use modern formats like eslint.config.js and .prettierrc.json.
- Have ESLint focus strictly on code quality and Prettier handle all formatting.
- Include a package.json file.
- You must include complete JSDoc type annotations for all inputs and outputs.

Constraints:
- DO NOT delete or edit any existing files.
- Adhere to the DRY principle.
- Before writing code, explain your structural logic in a plain text comment.

**The Result (What happened?):**
* The code compiled successfully. Four new files (ci.yml, .prettierrc.json, eslint.config.js, package.json) were created. The new files passed linting. It did not hallucinate in a way that matters.
* However, the CI/CD setup did not actually work on GitHub. The AI placed the `ci.yml` workflow file inside `game/iteration-5/.github/workflows/`, but GitHub Actions only reads workflows from `.github/workflows/` at the **root of the repository**. As a result, GitHub never saw or executed the workflow — no checks ran on any push or pull request.
* The same mistake was repeated for every subsequent iteration that included a `ci.yml` (iterations 6–14), all of which are also buried inside their respective iteration folders and are invisible to GitHub.
* The fix was to create a single `.github/workflows/ci.yml` at the repo root that runs `npm run validate:html`, `npm run lint:css`, `npm run lint:js`, and `npm run test:unit` from the `game/` directory, using the `iteration-*` glob patterns already defined in `game/package.json`. This single workflow covers all iterations automatically as new ones are added.

**Hand-Edits Required? (Yes/No):**
* Yes. A root-level `.github/workflows/ci.yml` had to be manually created after the fact because the AI placed all workflow files inside iteration subfolders, where GitHub Actions cannot find them. No changes were needed to the iteration-level files themselves.


### Iteration 6: build the RNG algorithm

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

    Context:
    - You are working on a browser-based "Broke College Student Slot Machine."
    - Use `game/iteration-5/` as the baseline for this iteration.
    - This prompt is for Iteration 6, and the result must become a new `game/iteration-6/` folder that is a direct continuation of Iteration 5.
    - Phase 2 is for invisible math and logic only.
    - Use the project research context from `plan/research-overview.md` and the raw research notes on weighted randomness as background constraints.
    - The current code already has:
      - a typed `state` object
      - symbol configuration
      - a temporary spin flow
      - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
      - 3 outer arrays (reels) and 5 inner entries per reel (slots)
    - The current random symbol selection is too naive because it uses uniform randomness.
    - The research requires weighted randomness and provides example weight structures, but it does NOT define final project-specific weights.
    - You must define clean placeholder weights in code.

    Task:
    Create `game/iteration-6/` by building directly on top of `game/iteration-5/`.

    Folder requirements:
    - Treat `game/iteration-5/` as the source of truth.
    - Copy the non-JavaScript files from `game/iteration-5/` into `game/iteration-6/` unchanged unless a minimal change is absolutely required.
    - Update only `game/iteration-6/game.js` with the Iteration 6 logic changes.
    - Do NOT rewrite the project from scratch.
    - Iteration 6 must preserve the current progress from Iteration 5 and add the weighted RNG refactor on top of it.

    Scope and file constraints:
    - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
    - Do NOT add external libraries.
    - Do NOT convert the file to modules or a framework.
    - Do NOT add import/export statements, test harness code, or a separate headless module.
    - Preserve the existing browser-script structure.
    - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

    Architecture constraints:
    - Keep UI-facing spin code thin.
    - Refactor the existing spin path so randomness is delegated to pure helper functions.
    - Keep the new RNG helpers pure and reusable, but preserve the existing single-file browser-script architecture.
    - Do not add new DOM queries, DOM mutations, or UI features beyond the minimal wiring needed to preserve the existing spin flow.
    - Do NOT implement paylines, payouts, wild substitution behavior, scatter behavior, bonus logic, autoplay, or animations yet.

    Implementation requirements:
    - Replace uniform symbol selection with weighted symbol selection.
    - Define a centralized placeholder weight definition for all current symbols:
      - ramen
      - energy
      - book
      - change
      - wild
    - Use non-uniform placeholder values.
    - Wild must have a low spawn weight, but do NOT implement wild behavior yet.
    - Define the source weights as an ordered array of entries first, then validate that array, then derive any lookup or cumulative table you need from it.
    - Every symbol in the existing `SYMBOLS` config must appear exactly once in that ordered weight-entry array.
    - Throw clear errors for:
      - missing configured symbols
      - duplicate symbols
      - unknown symbols
      - non-numeric or non-finite weights
      - zero-or-negative total weight
    - Before writing code, explain your structural logic in a plain text comment.

    Compatibility requirements:
    - Keep the current matrix generation behavior temporarily, but ensure symbol selection now flows through the weighted RNG helpers.
    - Prefer a structure that later iterations can reuse for matrix population, payline evaluation, payout calculation, and wild/scatter handling.

    Output rules:
    - Apply the changes directly in the workspace under `game/iteration-6/`.

**The Result (What happened?):**
* Codex built `game/iteration-6/` as a continuation of Iteration 5 and kept the non-JavaScript files unchanged. The only substantive code change for the iteration was in `game/iteration-6/game.js`, where the previous uniform symbol selection was refactored into a weighted RNG flow that still feeds the existing `reelMatrix[reelIndex][slotIndex]` generation path.
* The new logic added a centralized ordered weight-entry array for all current symbols (`ramen`, `energy`, `book`, `change`, `wild`), used non-uniform placeholder values, and gave `wild` a low spawn weight. It also validated the source weight array before building the cumulative weighted table and throws clear errors for missing configured symbols, duplicate symbols, unknown symbols, invalid weights, and non-positive total weight.
* The implementation stayed within the existing single-file browser-script architecture. It preserved the typed `state` object, the `SYMBOLS` metadata record, the current temporary spin flow, and the matrix orientation `reelMatrix[reelIndex][slotIndex]`. It did not add paylines, payouts, wild/scatter behavior, autoplay, animations, or new DOM features, so it stayed aligned with the “invisible math and logic only” scope for this iteration.
* Verification: `node --check game/iteration-6/game.js` passed. After running `npm install` in `game/iteration-6`, `npm run lint` passed. `npm run format:check` initially reported formatting issues in `game.js`, `index.html`, and `style.css`; however, `index.html` and `style.css` were unchanged from Iteration 5, so those warnings were inherited baseline formatting issues rather than Iteration 6 regressions. We then ran `npx prettier game.js --write`, followed by `npm run lint` and `npx prettier game.js --check`, and `game.js` passed both lint and formatting checks.
* What worked: the weighted RNG refactor matched the Iteration 6 prompt closely, kept UI-facing spin logic thin, and introduced reusable pure helper functions that later iterations can build on for matrix population, payline traversal, payout calculation, and wild/scatter handling.
* What didn’t: the code is still integrated into the browser script rather than extracted into a separate headless model, so it is not fully “detached from the UI” in a strict architectural sense. That said, the new RNG helpers themselves are pure and reusable, so this did not block the iteration goals.

**Hand-Edits Required? (Yes/No):**
* No. No manual code edits were needed to fix logic. The only follow-up step was running Prettier on `game/iteration-6/game.js` to satisfy formatting checks.


### Iteration 7: logic that populates the 3x5 2D array grid based on the RNG spin results

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-6/` as the baseline for this iteration.
      - This prompt is for Iteration 7, and the result must become a new `game/iteration-7/` folder that is a direct continuation of Iteration 6.
      - Phase 2 is for invisible math and logic only.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as
    background
      constraints.
      - The current Iteration 6 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a temporary spin flow
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - 3 outer arrays (reels) and 5 inner entries per reel (slots)
      - The current Iteration 6 implementation already replaced uniform randomness with weighted symbol selection.
      - Right now, matrix generation is still too direct because the spin flow jumps straight from “spin” to a finished `reelMatrix`.
      - Iteration 7 should introduce a clean, reusable logic layer that explicitly models the spin result and then populates the 3x5 reel matrix from that result.

      Task:
      Create `game/iteration-7/` by building directly on top of `game/iteration-6/`.

      Folder requirements:
      - Treat `game/iteration-6/` as the source of truth.
      - Create `game/iteration-7/` as a continuation of Iteration 6.
      - Copy the non-generated files from `game/iteration-6/` into `game/iteration-7/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 6.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-7/game.js` with the Iteration 7 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 6 code in place. Do not replace the current architecture with a new one.
      - Iteration 7 must preserve the current progress from Iteration 6 and add the matrix-population refactor on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers from Iteration 6 and build on top of them instead of replacing them.
      - Refactor the current spin path so it first produces an explicit spin-result data structure, then derives `reelMatrix` from that structure through pure helper
    functions.
      - Keep the new spin-result and matrix-population helpers pure and reusable.
      - Do not add new DOM queries, DOM mutations, or UI features beyond the minimal wiring needed to preserve the existing spin flow.
      - Do NOT implement paylines, payout calculation, win detection, wild substitution behavior, scatter behavior, bonus logic, autoplay, or animations yet.

      Implementation requirements:
      - Introduce a clean intermediate representation for a spin result.
      - That spin result must be compatible with the current structure of 3 reels and 5 slots per reel.
      - Make the relationship explicit between:
        - weighted symbol selection
        - per-reel spin results
        - final `reelMatrix`
      - Refactor the current matrix generation so `handleSpin` no longer builds the matrix directly from nested random calls.
      - Add pure helper functions for:
        - generating the spin result for all reels
        - generating the symbol sequence for a single reel
        - converting the spin result into `reelMatrix[reelIndex][slotIndex]`
      - Preserve the current matrix orientation exactly: `reelMatrix[reelIndex][slotIndex]`.
      - Preserve the current visible behavior temporarily: after a spin, the app should still end up with a valid randomized 3x5 matrix rendered in the same way.
      - Validate any new dimensions or spin-result inputs with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your matrix-population logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - Do not add payout, payline, or win-state fields to `state` yet unless a minimal structural field is clearly necessary for representing the spin result.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer from Iteration 6 as the source of symbol randomness, including `SYMBOL_WEIGHT_ENTRIES`, `WEIGHTED_SYMBOL_TABLE`, and the
      weighted symbol selection flow, unless a minimal internal refactor is clearly required.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 7 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-7/`.

**The Result (What happened?):**
* Codex built `game/iteration-7/` as a continuation of Iteration 6 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-7/game.js`, where the spin flow was refactored so `handleSpin` no longer jumps straight from the button action to a completed matrix.
* The new Iteration 7 logic introduces an explicit intermediate `SpinResult` structure, along with `ReelSpinResult`, `createSpinResult`, `createReelSymbolSequence`, and `createReelMatrixFromSpinResult`. This makes the relationship explicit between the weighted RNG layer from Iteration 6, the per-reel spin outcome, and the final `reelMatrix[reelIndex][slotIndex]` consumed by state and rendering.
* The implementation kept the weighted randomness system intact, including `SYMBOL_WEIGHT_ENTRIES`, `WEIGHTED_SYMBOL_TABLE`, and the weighted symbol selection helpers. It preserved the existing `state` variable name and shape, kept the `SYMBOLS` record as the UI metadata source, and did not add paylines, payout logic, wild/scatter behavior, bonus logic, autoplay, animation, or new DOM features.
* Validation was added around the new logic layer. The code now checks reel dimensions before generation and validates spin-result structure before converting it into the final matrix, throwing clear errors for invalid dimensions, reel-count mismatches, bad reel indices, wrong symbol counts, and unknown symbol IDs.
* Plan fit: this iteration matches the Iteration 6-10 plan for Phase 2 because it adds invisible math and logic only, inserts a reusable layer between weighted RNG and the final 3x5 grid, and sets up the next iterations for paylines, payout calculation, and wild/scatter handling. The only caveat is that the logic is still housed inside the same browser script rather than a separate model module, so it is not fully detached from the UI at the file-structure level.
* Verification: `./node_modules/.bin/eslint iteration-7/game.js` from `game/` passed. Running `npm run lint:js` from `game/` did not fully pass because the script lints all iteration folders and there are pre-existing `no-undef` errors in `iteration-4/game.js`, `iteration-5/game.js`, and `iteration-6/game.js`. Those failures were inherited baseline issues, not introduced by Iteration 7.
* What worked: the prompt goal for Phase 2 invisible math and logic was met cleanly. The UI-facing spin path stayed thin, the helpers are pure and reusable, and the code is set up for later work on paylines, payout calculation, and wild/scatter handling without changing the current rendered behavior.
* What didn’t: the repo-level lint command requested in the prompt could not be brought to green without changing earlier iterations outside Iteration 7. Also, the first folder copy included `game/iteration-7/node_modules`, which violated the “do not duplicate generated artifacts” rule and had to be removed afterward.

**Hand-Edits Required? (Yes/No):**
* Yes. A manual cleanup was required to remove the copied `game/iteration-7/node_modules/` directory after the initial Iteration 7 folder creation so the result matched the prompt’s non-generated-file requirement. No manual logic changes were needed in `game/iteration-7/game.js`.

### Iteration 8: payline traversal logic that checks the 3x5 matrix for matching symbols across defined lines

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-7/` as the baseline for this iteration.
      - This prompt is for Iteration 8, and the result must become a new `game/iteration-8/` folder that is a direct continuation of Iteration 7.
      - Phase 2 is for invisible math and logic only.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 7 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
      - The current Iteration 7 implementation already preserves the matrix orientation as `reelMatrix[reelIndex][slotIndex]`.
      - Iteration 8 should introduce a clean, reusable payline evaluation layer that reads the existing 3x5 matrix and checks for matching symbols across defined paylines.

      Task:
      Create `game/iteration-8/` by building directly on top of `game/iteration-7/`.

      Folder requirements:
      - Treat `game/iteration-7/` as the source of truth.
      - Create `game/iteration-8/` as a continuation of Iteration 7.
      - Copy the non-generated files from `game/iteration-7/` into `game/iteration-8/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 7.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-8/game.js` with the Iteration 8 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 7 code in place. Do not replace the current architecture with a new one.
      - Iteration 8 must preserve the current progress from Iteration 7 and add the payline-traversal layer on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers and spin-result/matrix helpers from Iterations 6 and 7 and build on top of them instead of replacing them.
      - Add a pure payline-evaluation layer that reads the existing `reelMatrix[reelIndex][slotIndex]`.
      - Keep the new payline helpers pure and reusable.
      - Do not add new DOM queries, DOM mutations, or UI features beyond the minimal wiring needed to preserve the existing spin flow.
      - Do NOT implement payout calculation, balance updates, wild substitution behavior, scatter behavior, bonus logic, autoplay, or animations yet.

      Implementation requirements:
      - Define a small, explicit payline data structure using row/column coordinate pairs that is compatible with the existing matrix orientation.
      - Add pure helper functions for:
        - retrieving the symbol sequence for one payline from `reelMatrix`
        - evaluating whether a payline contains a winning symbol match
        - evaluating all paylines for the current matrix
      - Preserve the current matrix orientation exactly: `reelMatrix[reelIndex][slotIndex]`.
      - Assume normal symbol matching only for this iteration.
      - Do NOT implement Wild or Scatter handling yet.
      - Return structured payline evaluation results that clearly describe:
        - which paylines matched
        - the matched symbol id
        - the match count
        - the payline coordinates or index
      - Keep the current visible behavior temporarily: after a spin, the app should still end up with a valid randomized 3x5 matrix rendered in the same way.
      - Validate any new payline definitions or matrix inputs with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your matrix traversal logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing payline evaluation output.
      - Do not add payout, balance, or bonus-state fields yet unless a minimal structural field is clearly necessary for representing payline results.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer and spin-result/matrix generation flow from Iterations 6 and 7.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 8 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-8/`.

**The Result (What happened?):**
* Codex built `game/iteration-8/` as a continuation of Iteration 7 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-8/game.js`, where a new payline-evaluation layer was added on top of the existing weighted RNG, spin-result, and matrix-generation flow.
* The new Iteration 8 logic introduces explicit payline definitions and pure helpers for extracting a symbol sequence from a payline, evaluating one payline, and evaluating all paylines against the current `reelMatrix[reelIndex][slotIndex]`. This makes the relationship explicit between the existing 3x5 matrix structure and the newly added win-detection layer for matching symbols across defined lines.
* The implementation preserved the existing `state` variable name and overall state flow, while adding a minimal payline-results layer for storing structured evaluation output. It kept the `SYMBOLS` record as the UI metadata source and did not add payout calculation, balance rewards, wild substitution, scatter behavior, bonus logic, autoplay, animations, or new DOM features.
* Validation was added around the payline logic layer. The code checks payline definitions, coordinate shape, matrix structure, and symbol-sequence extraction before evaluating matches, with clear errors for malformed paylines or invalid matrix access. However, one limitation remained: the generated payline validator is stricter than necessary because it assumes a tighter reel-index ordering than future payline patterns may require.
* Plan fit: this iteration matches the Iteration 6-10 plan for Phase 2 because it adds invisible math and logic only, keeps the work detached from the UI at the logic level, and builds a reusable payline-evaluation layer that prepares the project for payout calculation in Iteration 9 and wild/scatter handling in Iteration 10.
* Verification: targeted linting for `iteration-8/game.js` passed, and the file remained isolated to the Iteration 8 folder. Running the full repo-level JavaScript lint command from `game/` still did not fully pass because there are inherited lint issues in earlier iteration folders. Those failures were baseline issues and not introduced by Iteration 8.
* What worked: the prompt goal for Phase 2 invisible math and logic was met cleanly. The new helpers are small, clearly named, and reusable, and the logic stays focused on payline traversal only without leaking into payout or special-symbol behavior.
* What didn’t: the generated validator ended up more rigid than ideal for future paylines, and that limitation was left in place for now. There was also an unrelated root `package-lock.json` change flagged during review, which should be reverted separately because it was outside the intended Iteration 8 scope.

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-8/game.js`. A documentation/JSDoc cleanup was performed, but the flagged validator limitation was not corrected in this iteration.

### Iteration 9: payout calculation logic that updates the game state balance based on the bet size and winning paylines

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-8/` as the baseline for this iteration.
      - This prompt is for Iteration 9, and the result must become a new `game/iteration-9/` folder that is a direct continuation of Iteration 8.
      - Phase 2 is for invisible math and logic only.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 8 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
      - The current Iteration 8 implementation already preserves the matrix orientation as `reelMatrix[reelIndex][slotIndex]`.
      - Iteration 9 should introduce a clean, reusable payout-calculation layer that updates the game state balance based on the current bet size and winning paylines.

      Task:
      Create `game/iteration-9/` by building directly on top of `game/iteration-8/`.

      Folder requirements:
      - Treat `game/iteration-8/` as the source of truth.
      - Create `game/iteration-9/` as a continuation of Iteration 8.
      - Copy the non-generated files from `game/iteration-8/` into `game/iteration-9/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 8.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-9/game.js` with the Iteration 9 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 8 code in place. Do not replace the current architecture with a new one.
      - Iteration 9 must preserve the current progress from Iteration 8 and add the payout-calculation layer on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, and payline helpers from Iterations 6 through 8 and build on top of them instead of replacing them.
      - Add a pure payout-calculation layer that reads the current bet size and the structured winning payline results.
      - Keep the new payout helpers pure and reusable where possible.
      - Do not add new DOM queries, DOM mutations, or UI features beyond the minimal wiring needed to preserve the existing spin flow.
      - Do NOT implement wild substitution behavior, scatter behavior, bonus logic, autoplay, or animations yet.

      Implementation requirements:
      - Add pure helper functions for:
        - calculating the payout for a single winning payline
        - calculating the total payout across all winning paylines
        - applying the payout result to the existing state balance
      - Use the current bet size and winning payline results as the basis for payout calculation.
      - Keep the payout logic explicit and easy to extend in the next iteration.
      - Return structured payout results that clearly describe:
        - which paylines contributed to the payout
        - each payline’s payout amount
        - the total payout amount
        - the updated balance or balance delta
      - Preserve the current visible behavior temporarily: after a spin, the app should still end up with a valid randomized 3x5 matrix rendered in the same way.
      - Validate any new payout inputs with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your payout calculation logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing payout output or updated balance information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, and payline evaluation flow from Iterations 6 through 8.
      - Do not implement wild, scatter, or bonus-state fields yet unless a minimal structural field is clearly necessary for representing payout results.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 9 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-9/`.

**The Result (What happened?):**
* Codex built `game/iteration-9/` as a continuation of Iteration 8 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-9/game.js`, where a new payout-calculation layer was added on top of the existing weighted RNG, spin-result, matrix-generation, and payline-evaluation flow.
* The new Iteration 9 logic introduces `calculateSinglePaylinePayout`, `calculateTotalPayout`, and `applyPayoutToBalance`. This makes the relationship explicit between the current bet size, the structured winning payline results, and the resulting balance update after a spin.
* The implementation preserved the existing `state` variable name and overall state flow, while adding a minimal payout-results layer for storing structured payout output. It kept the `SYMBOLS` record as the UI metadata source and did not add scatter behavior, bonus logic, autoplay, animations, framework changes, or new DOM features.
* Balance math was handled correctly for this iteration: the spin flow deducts the current bet first, then applies any payout to the post-bet balance. The code also keeps `wild` at a zero payout multiplier for now, which is a temporary design assumption that fits the current scope because wild substitution is not implemented until the next iteration.
* Plan fit: this iteration matches the Iteration 6-10 plan for Phase 2 because it adds invisible math and logic only, keeps the payout work attached to the existing payline results, and prepares the project for Wild and Scatter handling in Iteration 10.
* Verification: targeted linting for `iteration-9/game.js` passed, and the file remained isolated to the Iteration 9 folder. Running the full repo-level JavaScript lint command from `game/` still did not fully pass because there are inherited lint issues in earlier iteration folders. Those failures were baseline issues and not introduced by Iteration 9.
* What worked: the prompt goal for payout calculation was met cleanly. The new helpers are small, clearly named, and reusable, and the balance update logic builds directly on the existing payline-evaluation output without rewriting the project structure.
* What didn’t: the initial Iteration 9 result exposed payout-specific win/loss text in the visible status message, which went slightly beyond the intended invisible-logic scope. That was manually adjusted to a neutral status message so the iteration stayed closer to the plan.

**Hand-Edits Required? (Yes/No):**
* Yes. A small manual edit was made in `game/iteration-9/game.js` to replace payout-specific status text with a neutral status message so the iteration stayed closer to invisible math and logic only. No manual changes were made to the payout calculation itself.

### Iteration 10: Wild and Scatter logic that modifies payline evaluation

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-9/` as the baseline for this iteration.
      - This prompt is for Iteration 10, and the result must become a new `game/iteration-10/` folder that is a direct continuation of Iteration 9.
      - Phase 2 is for invisible math and logic only.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 9 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
      - The current Iteration 9 implementation already preserves the matrix orientation as `reelMatrix[reelIndex][slotIndex]`.
      - Iteration 10 should introduce Wild and Scatter logic so they properly modify payline evaluation.

      Task:
      Create `game/iteration-10/` by building directly on top of `game/iteration-9/`.

      Folder requirements:
      - Treat `game/iteration-9/` as the source of truth.
      - Create `game/iteration-10/` as a continuation of Iteration 9.
      - Copy the non-generated files from `game/iteration-9/` into `game/iteration-10/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 9.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-10/game.js` with the Iteration 10 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 9 code in place. Do not replace the current architecture with a new one.
      - Iteration 10 must preserve the current progress from Iteration 9 and add the Wild/Scatter logic layer on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, payline helpers, and payout helpers from Iterations 6 through 9 and build on top of them instead of replacing them.
      - Add a pure Wild/Scatter evaluation layer that works with the current `reelMatrix[reelIndex][slotIndex]`.
      - Keep the new Wild/Scatter helpers pure and reusable where possible.
      - Do not add new DOM queries, DOM mutations, or UI features beyond the minimal wiring needed to preserve the existing spin flow.
      - Do NOT implement bonus rounds, autoplay, or animations yet.

      Rules for this iteration:
      - Wild substitutes for regular symbols during payline evaluation.
      - Wild does not substitute for Scatter.
      - Scatter is counted anywhere on the grid, independent of paylines.
      - Keep the logic explicit and easy to extend later.

      Implementation requirements:
      - Add pure helper functions for:
        - evaluating a payline with Wild support
        - counting Scatter symbols across the full matrix
        - producing structured Wild/Scatter evaluation results compatible with the existing payline and payout flow
      - Update the payline evaluation layer so symbol matching now supports Wild substitution.
      - Keep Scatter handling separate from payline matching.
      - Do not treat Scatter as a substituting symbol.
      - Return structured results that clearly describe:
        - which paylines matched after Wild handling
        - the effective matched symbol for each winning payline
        - the match count
        - the Scatter count across the matrix
        - any minimal structured fields needed for later payout or bonus expansion
      - Preserve the current visible behavior temporarily: after a spin, the app should still end up with a valid randomized 3x5 matrix rendered in the same way.
      - Validate any new Wild/Scatter inputs with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your Wild and Scatter evaluation logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing Wild/Scatter evaluation output or updated payline result information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, payline evaluation flow, and payout flow from Iterations 6 through 9.
      - Keep the payout layer compatible with the updated payline results after Wild handling.
      - Do not add bonus-state, autoplay, or animation fields yet unless a minimal structural field is clearly necessary for representing Wild/Scatter results.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 10 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-10/`.

**The Result (What happened?):**
* Codex built `game/iteration-10/` as a continuation of Iteration 9 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-10/game.js`, where Wild and Scatter handling was added on top of the existing weighted RNG, spin-result, matrix-generation, payline-evaluation, and payout-calculation flow.
* The new Iteration 10 logic keeps Wild and Scatter handling in pure helper functions rather than DOM code. Payline evaluation now routes through Wild-aware matching, Wild substitutes for regular symbols and does not substitute for Scatter, and Scatter is counted across the full `reelMatrix[reelIndex][slotIndex]` separately from paylines.
* The implementation preserved the existing `state` variable name and overall state flow while keeping the payout layer compatible with the updated payline results. It did not add bonus rounds, autoplay, animations, new DOM queries, framework changes, or module rewrites.
* Plan fit: this iteration mostly matches the Iteration 6-10 plan for Phase 2 because it adds invisible math and logic only, keeps the work detached from the UI at the logic level, and extends payline evaluation with Wild and Scatter behavior without rewriting the project structure.
* Verification: targeted linting for `iteration-10/game.js` passed on the project setup, and the file remained isolated to the Iteration 10 folder. In my environment, `node --check` on the uploaded `game.js` passed, but standalone ESLint could not be fully reproduced because the uploaded file did not include the repo’s `eslint.config.js`. Running the full repo-level JavaScript lint command from `game/` may still fail because there are inherited lint issues in earlier iteration folders, which are baseline issues and not introduced by Iteration 10.
* What worked: the prompt goal for Wild and Scatter handling was met cleanly. The new helpers are small, clearly named, and reusable, and the payout flow remains compatible because matched paylines still feed into the existing payout calculation path.
* What didn’t: a few logic-quality issues remained in review. Unmatched evaluations still needed a cleaner `matchedSymbolId: null` contract, all-Wild paylines were semantically ambiguous, and Scatter evaluation included one redundant traversal. These were left as known limitations rather than corrected in this iteration. Scatter was also added to the symbol set without a dedicated CSS class, which is acceptable for Phase 2 but should be documented.

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-10/game.js`. The reviewed limitations were documented rather than corrected in this iteration.


### Iteration 11: Update HTML to reflect JS Changes

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-10/` as the baseline for this iteration.
      - This prompt is for Iteration 11, and the result must become a new `game/iteration-11/` folder that is a direct continuation of Iteration 10.
      - Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 10 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
        - Wild and Scatter logic helper functions that modify payline evaluation
      - Iteration 11 should connect the HTML grid to the underlying JavaScript 2D array through the DOM manipulation functions

      Task:
      Create `game/iteration-11/` by building directly on top of `game/iteration-10/`.

      Folder requirements:
      - Treat `game/iteration-10/` as the source of truth.
      - Create `game/iteration-11/` as a continuation of Iteration 10.
      - Copy the non-generated files from `game/iteration-10/` into `game/iteration-11/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 10.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-11/game.js` with the Iteration 11 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 10 code in place. Do not replace the current architecture with a new one.
      - Iteration 11 must preserve the current progress from Iteration 10 and add the DOM manipulation functions on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, payline helpers, payout helpers, and Wild/Scatter helpers from Iterations 6 through 10 and build on top of them instead of replacing them.
      - Keep the pure Wild/Scatter evaluation layer and helpers that work with the current `reelMatrix[reelIndex][slotIndex]`.
      - Do NOT implement bonus rounds, autoplay, or animations yet.

      Rules for this iteration:
      - Write the DOM manipulation functions that update the HTML grid after a spin
      - The HTML grid must reflect the underlying JavaScript Matrix
      - Keep the logic explicit and easy to extend later.

      Implementation requirements:
      - Add pure helper functions for:
        - Updating the DOM to match the underlying JavaScript Matrix
      - Validate any implemented helper functions with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your function logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing Wild/Scatter evaluation output or updated payline result information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, payline evaluation flow, payout flow, and Wild/Scatter logic from Iterations 6 through 10.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 11 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-11/`.

**The Result (What happened?):**
* Codex built `game/iteration-11/` as a continuation of Iteration 10 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-11/game.js`, where the HTML grid is explicitly synced to the JS code
* The new Iteration 11 logic modifies the render logic to use helpers that interface with the underlying JS code
* Plan fit: this iteration doesn't really match the plan too well because nothing about the UI changed too much, only the render logic was abstracted out to a few more functions
* Verification: project specific lint passed, but the repo-wide run still fails because of pre-existing no-undef errors in iteration-4 through iteration-6, not because of Iteration 11. A focused ESLint run against iteration-11/game.js passes cleanly. All the other files matched byte for byte with iteration 10.
* What worked: **TODO**
* What didn’t: Not sure if this abstraction was entirely required

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-11/game.js`. The reviewed limitations were documented rather than corrected in this iteration.

### Iteration 12: 

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-11/` as the baseline for this iteration.
      - This prompt is for Iteration 12, and the result must become a new `game/iteration-12/` folder that is a direct continuation of Iteration 11.
      - Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 11 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
        - Wild and Scatter logic helper functions that modify payline evaluation
        - DOM manipulation functions that connect the HTML grid and the JavaScript 2D array
      - Iteration 12 should trigger game logic connecting the Spin button and the Bet increase/decrease mechanic.

      Task:
      Create `game/iteration-12/` by building directly on top of `game/iteration-11/`.

      Folder requirements:
      - Treat `game/iteration-11/` as the source of truth.
      - Create `game/iteration-12/` as a continuation of Iteration 11.
      - Copy the non-generated files from `game/iteration-11/` into `game/iteration-12/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 11.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-12/game.js` with the Iteration 12 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 11 code in place. Do not replace the current architecture with a new one.
      - Iteration 12 must preserve the current progress from Iteration 11 and add the new connections between the Spin and Bet mechanics on top of it.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, payline helpers, payout helpers, Wild/Scatter helpers, and DOM manipulation functions from Iterations 6 through 11 and build on top of them instead of replacing them.
      - Keep the pure Wild/Scatter evaluation layer and helpers that work with the current `reelMatrix[reelIndex][slotIndex]`.
      - Do NOT implement bonus rounds, autoplay, or animations yet.

      Rules for this iteration:
      - Write the game logic that connects the Spin mechanic if the Bet increase/decrease mechanic is used 
      - When the Spin mechanic is used, it should take into account the most recent bet amount
      - Keep the logic explicit and easy to extend later

      Implementation requirements:
      - Add pure helper functions for updating the game logic to connect the spin and bet mechanics if necessary
      - Update the code so the spin and bet mechanics are connected. 
      - Validate any implemented helper functions with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your function logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing Wild/Scatter evaluation output or updated payline result information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, payline evaluation flow, payout flow, Wild/Scatter logic and DOM manipulation functions from Iterations 6 through 11.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 12 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-12/`.
  
**The Result (What happened?):**
* Codex built `game/iteration-12/` as a continuation of Iteration 11 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-12/game.js`, where the Spin and Bet mechanics are now more synchronized to make the game logic work. 
* The new Iteration 12 logic refactors game.js and added helper functions that handle both the active bet amount and new bet amounts if changed. 
* Plan fit: This iteration aligns with the goal for Phase 3 because it increased the accessibility of the game while maintaining the overall plan of the project. 
* Verification: project specific lint passed, but the repo-wide run still fails because of pre-existing no-undef errors in iteration-4 through iteration-6, not because of Iteration 12. A focused ESLint run against iteration-12/game.js passes cleanly. All the other files matched byte for byte with iteration 11.
* What worked: The prompt was able to convey the core changes expected for this iteration, code changes look clean and logic checks out. 
**Hand-Edits Required? (Yes):**
* Yes. Manual logic changes were made in `game/iteration-12/game.js` to fix validator, linter and test failure problems. 

### Iteration 13: 

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-12/` as the baseline for this iteration.
      - This prompt is for Iteration 13, and the result must become a new `game/iteration-13/` folder that is a direct continuation of Iteration 12.
      - Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 12 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
        - Wild and Scatter logic helper functions that modify payline evaluation
        - DOM manipulation functions that connect the HTML grid and the JavaScript 2D array
        - responsive connections between spin and bet wager mechanics
      - Iteration 13 should bind the spacebar and enter keys to the spin mechanism.

      Task:
      Create `game/iteration-13/` by building directly on top of `game/iteration-12/`.

      Folder requirements:
      - Treat `game/iteration-12/` as the source of truth.
      - Create `game/iteration-13/` as a continuation of Iteration 12.
      - Copy the non-generated files from `game/iteration-12/` into `game/iteration-13/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 13.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-13/game.js` with the Iteration 13 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 12 code in place. Do not replace the current architecture with a new one.
      - Iteration 13 must preserve the current progress from Iteration 12 and add the spacebar and enter key bindings to the spin mechanism.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, payline helpers, payout helpers, Wild/Scatter helpers, DOM manipulation functions and game logic from Iterations 6 through 12 and build on top of them instead of replacing them.
      - Keep the pure Wild/Scatter evaluation layer and helpers that work with the current `reelMatrix[reelIndex][slotIndex]`.
      - Do NOT implement bonus rounds, autoplay, or animations yet.

      Rules for this iteration:
      - Write the code such that the game is more accessible by binding the spin mechanic to spacebar and enter keys.
      - Reactive responses when the spacebar or enter keys are pressed to initiate one round of the game.
      - Keep the logic explicit and easy to extend later

      Implementation requirements:
      - Write the code for binding spacebar and enter keys to the spin mechanism
      - Use helper functions only if necessary to acheive the goal of accesibility in binding the spacebar and enter keys to the spin mechanism.
      - Validate any implemented helper functions with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your function logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing Wild/Scatter evaluation output or updated payline result information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, payline evaluation flow, payout flow, Wild/Scatter logic, DOM manipulation functions and game logic from Iterations 6 through 12.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 13 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-13/`.
1. Static Analysis (Linters & Validators)

HTML Validation: Run npx html-validate "iteration-13/*.html" to check for aria-label-misuse, whitespace in IDs, and structural errors.
CSS Linting: Run npx stylelint "iteration-13/**/*.css" to ensure your styles follow modern color and range notations.
JavaScript Linting: Run npx eslint "iteration-13/**/*.js" to check for style issues and ensure your JSDoc annotations match the eslint.config.js requirements.
Full Lint Check: Execute both CSS and JS linters simultaneously.


1. Logic Testing (Unit Tests)

Run Unit Tests: Execute npm run test:unit.
Validate Symbols: Confirm that your VALID_SYMBOLS array in tests/unit/game.test.js matches the case and count of the symbols currently in your HTML.
Unit tests can continued to be changed depending on the iteration -> Be sure to update them if needed.


4. UI Testing (End-to-End Tests)

Start Local Server: Open a separate terminal and run npx serve iteration-X -p 3000 (replacing X with your current iteration number).
Run E2E Tests: In your primary terminal, execute npm run test:e2e.
Verify Roles: Ensure your Playwright selectors match the aria-label or aria-labelledby attributes defined in your latest HTML iteration.


5. Final "Safe to Commit" Check

Run All-in-One: Execute an all in one checker.
Review Output: It should run the HTML validator, all linters, and all tests in sequence.
Verification: If any step fails, the script will stop, indicating that the code does not yet meet the required engineering quality for a commit.

Make changes solely to the html, css and js in iteration 13 to fix the failures. Do not edit any other files besides the ones in iteration 13. 
  
**The Result (What happened?):**
* Codex built `game/iteration-13/` as a continuation of Iteration 12 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-13/game.js`, where the spacebar and enter keys function as alternatives to clicking the lever. 
* The new Iteration 13 logic adds bindings for spacebar and enter keys and also handles edge cases like repeated button presses or running the game multiple times concurrently.  
* Plan fit: This iteration aligns with the goal for Phase 3 because it makes the game more accessible and adds a real aspect to it. 
* Verification: project specific lint passed, but the repo-wide run still fails because of pre-existing no-undef errors in iteration-4 through iteration-6, not because of Iteration 13. A focused ESLint run against iteration-13/game.js passes cleanly. All the other files matched byte for byte with iteration 12.
* What worked: The prompt was able to convey to the agent to create bindings to keys that allow the user to interact with the game physically.  
**Hand-Edits Required? (No):**
* No. No manual logic changes were made in `game/iteration-13/game.js`

### Iteration 14: 

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-13/` as the baseline for this iteration.
      - This prompt is for Iteration 14, and the result must become a new `game/iteration-14/` folder that is a direct continuation of Iteration 13.
      - Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 12 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
        - Wild and Scatter logic helper functions that modify payline evaluation
        - DOM manipulation functions that connect the HTML grid and the JavaScript 2D array
        - responsive connections between spin and bet wager mechanics
        - keyboard bindings to spin mechanism
      - Iteration 14 should add reactive CSS state changes for whenever something happens to the state of the game (ex. adding positive visual effects if there is a win) while keeping a minimalist effect in mind.

      Task:
      Create `game/iteration-14/` by building directly on top of `game/iteration-13/`.

      Folder requirements:
      - Treat `game/iteration-13/` as the source of truth.
      - Create `game/iteration-14/` as a continuation of Iteration 13.
      - Copy the non-generated files from `game/iteration-13/` into `game/iteration-14/` unchanged unless a minimal change is absolutely required.
      - This includes the HTML, CSS, JavaScript, lint/config files, and package manifest files already present in Iteration 14.
      - Do NOT duplicate generated artifacts or dependency directories such as `node_modules`.
      - Update only `game/iteration-14/game.js` with the Iteration 14 logic changes.
      - Do NOT rewrite the project from scratch.
      - Refactor the existing Iteration 13 code in place. Do not replace the current architecture with a new one.
      - Iteration 14 must preserve the current progress from Iteration 13 and add reactive CSS state changes when something happens with a minimalist effect in mind.

      Scope and file constraints:
      - Do NOT edit HTML or CSS content unless absolutely required, and avoid changing them for this iteration.
      - Do NOT add external libraries.
      - Do NOT convert the file to modules or a framework.
      - Do NOT add import/export statements, test harness code, or a separate headless module.
      - Preserve the existing browser-script structure.
      - Preserve unrelated existing functions, top-level constants, and DOM behavior unless a minimal change is required.

      Architecture constraints:
      - Keep UI-facing spin code thin.
      - Keep the weighted RNG helpers, spin-result/matrix helpers, payline helpers, payout helpers, Wild/Scatter helpers, DOM manipulation functions, game logic, and keyboard functionality from Iterations 6 through 13 and build on top of them instead of replacing them.
      - Keep the pure Wild/Scatter evaluation layer and helpers that work with the current `reelMatrix[reelIndex][slotIndex]`.
      - Do NOT implement bonus rounds, autoplay, or animations yet.

      Rules for this iteration:
      - Write the code such that the game is more reactive if something happens to the state of the game.
      - Reactive CSS states (ex. positive visuals if users wins money) and changes and minimalist effects in mind. 
      - Keep the logic explicit and easy to extend later

      Implementation requirements:
      - Write the code to add reactions to user actions through CSS state changes with minimalist effects in mind.
      - Use helper functions only if necessary to acheive the goal of reactive, minimalist effect design through changes in CSS states.
      - Validate any implemented helper functions with clear errors where appropriate.
      - Use small, well-named functions with no duplicate logic.
      - Include complete JSDoc type annotations for all inputs and outputs.
      - Before writing code, explain your function logic in a plain text comment.

      Compatibility requirements:
      - Preserve the existing `state` variable name, state shape, and current field names unless a minimal additive change is clearly necessary.
      - If a minimal additive field is needed, keep it focused only on storing Wild/Scatter evaluation output or updated payline result information.
      - Preserve the existing `SYMBOLS` record as the UI metadata source.
      - Preserve the existing weighted RNG layer, spin-result/matrix generation flow, payline evaluation flow, payout flow, Wild/Scatter logic, DOM manipulation functions, game logic and keyboard functionalities from Iterations 6 through 13.
      - After making the changes, run `npm run lint:js` from `game/` and fix any issues introduced by Iteration 14 before finishing.
      - Do not add tests in this iteration unless absolutely required to preserve the existing setup.

      Output rules:
      - Apply the changes directly in the workspace under `game/iteration-14/`.
1. Static Analysis (Linters & Validators)

HTML Validation: Run npx html-validate "iteration-14/*.html" to check for aria-label-misuse, whitespace in IDs, and structural errors.
CSS Linting: Run npx stylelint "iteration-14/**/*.css" to ensure your styles follow modern color and range notations.
JavaScript Linting: Run npx eslint "iteration-14/**/*.js" to check for style issues and ensure your JSDoc annotations match the eslint.config.js requirements.
Full Lint Check: Execute both CSS and JS linters simultaneously.


1. Logic Testing (Unit Tests)

Run Unit Tests: Execute npm run test:unit.
Validate Symbols: Confirm that your VALID_SYMBOLS array in tests/unit/game.test.js matches the case and count of the symbols currently in your HTML.
Unit tests can continued to be changed depending on the iteration -> Be sure to update them if needed.


4. UI Testing (End-to-End Tests)

Make sure Local Server is available: run npx kill-port 3000 to ensure the local server can run the tests.
Start Local Server: Open a separate terminal and run npx serve iteration-X -p 3000 (replacing X with your current iteration number).
Run E2E Tests: In your primary terminal, execute npm run test:e2e.
Verify Roles: Ensure your Playwright selectors match the aria-label or aria-labelledby attributes defined in your latest HTML iteration.


5. Final "Safe to Commit" Check

Run All-in-One: Execute an all in one checker.
Review Output: It should run the HTML validator, all linters, and all tests in sequence.
Verification: If any step fails, the script will stop, indicating that the code does not yet meet the required engineering quality for a commit.

Make changes solely to the html, css and js in iteration 14 to fix the failures. Do not edit any other files besides the ones in iteration 14. 
  
**The Result (What happened?):**
* Codex built `game/iteration-14/` as a continuation of Iteration 13 and preserved the existing browser-script architecture. The substantive iteration change lives in `game/iteration-14/game.js`, where there are now visual indicators for different game outcomes. 
* The new Iteration 14 logic adds visual indicators to the slot machine by taking in data from game outcomes and modifying the css state. 
* Plan fit: This iteration aligns with the goal for Phase 3 because it combines the ui and the underlying logic to update the ui appropriately.
* Verification: passes all linting, validation and tests
* What worked: The agent was able to create minimalist CSS state changes for user wins
* What didn't work: CSS state changes really only exist for the win and nothing else. 
**Hand-Edits Required? (No):**
* No. No manual logic changes were made in `game/iteration-14/game.js`

### Iteration 15:

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

      Context:
      - You are working on a browser-based "Broke College Student Slot Machine."
      - Use `game/iteration-14/` as the baseline for this iteration.
      - This prompt is for Iteration 15, and the result must become a new `game/iteration-15/` folder that is a direct continuation of Iteration 14.
      - Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
      - Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.
      - The current Iteration 14 code already has:
        - a typed `state` object
        - symbol configuration in `SYMBOLS`
        - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
        - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
        - weighted symbol selection helpers
        - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
        - a clean intermediate spin-result layer
        - pure helpers that generate per-reel symbol sequences
        - pure helpers that convert spin results into the final 3x5 reel matrix
        - a payline-evaluation layer that reads the current matrix and returns structured payline results
        - a payout-calculation layer that uses bet size and matched paylines to update balance
        - Wild and Scatter logic helper functions that modify payline evaluation
        - DOM manipulation functions that connect the HTML grid and the JavaScript 2D array
        - responsive connections between spin and bet wager mechanics
        - keyboard bindings to spin mechanism
        - visual indicators to the slot machine by taking in data from game outcomes and modifying the css state
      - Iteration 15 adds ARIA live region updates (screen reader announcements) and highlights matched paylines with a neon red border while keeping a minimalist design.

      Task:
      Create `game/iteration-15/` by building directly on top of `game/iteration-14/`.

      Folder requirements:
      - Treat `game/iteration-14/` as the source of truth.
      - Create `game/iteration-15/` as a continuation of Iteration 14.
      - Copy the non-generated files from `game/iteration-14/` into `game/iteration-15/` unchanged unless absolutely required.
      - This includes HTML, CSS, JS, lint/config files, and package manifests.
      - Do NOT copy `node_modules` or generated artifacts.
      - Modify ONLY `game/iteration-15/game.js`.
      - Do NOT rewrite architecture or refactor the project structure.
      - Preserve Iteration 14 systems (RNG, paylines, payout, DOM, Wild/Scatter, keyboard controls).

      Scope constraints:
      - Do NOT use external libraries.
      - Do NOT convert to modules or frameworks.
      - Do NOT add imports/exports.
      - Do NOT modify HTML/CSS unless absolutely necessary.
      - Keep logic minimal, explicit, and maintainable.
      - Keep UI code thin and separated from logic layers.

      Rules for this iteration:
      - Implement ARIA live region updates that announce game results (e.g., “You won 50 credits”, “Try again”).
      - Live region must be visually hidden but accessible (NOT display: none).
      - Add optional toggle in state to enable/disable announcements.
      - Highlight winning paylines using a neon red border with minimal CSS state toggles.
      - Ensure updates are triggered only when game state changes.
      - Keep accessibility logic separate from game logic.

      Implementation requirements:
      - Write code that implements ARIA live region updates in response to game outcomes.
      - Use JavaScript to dynamically update the live region content.
      - Use helper functions only if necessary.
      - Validate helper functions with clear error handling.
      - Use small, well-named functions (DRY principle).
      - Include full JSDoc annotations for all functions.
      - Before writing code, explain function logic in a plain text comment.

      Compatibility requirements:
      - Preserve `state` object structure unless minimally extended:
        - Allowed additions: `announcementsEnabled`
      - Preserve `SYMBOLS` unchanged.
      - Preserve weighted RNG system unchanged.
      - Preserve spin → evaluation → payout pipeline unchanged.
      - Preserve DOM mapping structure unchanged.
      - Preserve Wild/Scatter logic unchanged.

      Output rules:
      - Apply all changes directly in `game/iteration-15/`.
      - Do not create extra files outside iteration-15.

1. Static Analysis (Linters & Validators)

HTML Validation: Run npx html-validate "iteration-15/*.html" to check for aria-label-misuse, whitespace in IDs, and structural errors.
CSS Linting: Run npx stylelint "iteration-15/**/*.css" to ensure modern CSS conventions.
JavaScript Linting: Run npx eslint "iteration-15/**/*.js" to ensure code quality and JSDoc correctness.
Full Lint Check: Run all linters together.

2. Logic Testing (Unit Tests)

Run Unit Tests: Execute npm run test:unit.
Validate Symbols: Ensure VALID_SYMBOLS matches HTML symbols exactly.
Update tests if iteration changes require it.

3. UI Testing (End-to-End Tests)

Ensure Local Server is available: run npx kill-port 3000.
Start Server: npx serve iteration-15 -p 3000.
Run E2E Tests: npm run test:e2e.
Verify:
- Spin works
- Paylines highlight correctly
- ARIA announcements trigger correctly

4. Final "Safe to Commit" Check

Run All-in-One Checker:
- HTML validation
- CSS lint
- JS lint
- Unit tests
- E2E tests

If any step fails, fix before proceeding.

---

## The Result (What happened?):

**Iteration 15 successfully adds ARIA live region accessibility support and enhanced winning payline visualization using a neon red border, while preserving the existing slot machine architecture. The game now provides both visual and screen-reader feedback for outcomes, improving accessibility without increasing UI complexity.**

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-15/game.js`. The reviewed limitations were documented rather than corrected in this iteration.

### Iteration 16:

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

---

## Context:
- You are working on a browser-based "Broke College Student Slot Machine."
- Use `game/iteration-15/` as the baseline for this iteration.
- This prompt is for Iteration 16, and the result must become a new `game/iteration-16/` folder that is a direct continuation of Iteration 15.
- Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
- Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.

- The current Iteration 15 code already has:
  - a typed `state` object
  - symbol configuration in `SYMBOLS`
  - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
  - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
  - weighted symbol selection helpers
  - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
  - a clean intermediate spin-result layer
  - pure helpers that generate per-reel symbol sequences
  - pure helpers that convert spin results into the final 3x5 reel matrix
  - a payline-evaluation layer that reads the current matrix and returns structured payline results
  - a payout-calculation layer that uses bet size and matched paylines to update balance
  - Wild and Scatter logic helper functions
  - DOM manipulation functions that connect the HTML grid and JS 2D array
  - responsive spin + bet wager mechanics
  - keyboard bindings to spin mechanism
  - visual indicators for game outcomes via CSS state changes
  - ARIA live region updates for accessibility (“You won 50 credits”, etc.)
  - payline highlighting with a neon red border for winning combinations

---

## Task:
Create `game/iteration-16/` by building directly on top of `game/iteration-15/`.

---

## Folder requirements:
- Treat `game/iteration-15/` as the source of truth.
- Create `game/iteration-16/` as a continuation of Iteration 15.
- Copy all non-generated files unchanged unless absolutely required.
- Do NOT copy `node_modules` or generated artifacts.
- Modify ONLY `game/iteration-16/game.js`.
- Do NOT rewrite architecture or restructure the project.
- Preserve all Iteration 15 systems (RNG, paylines, payout, DOM, Wild/Scatter, keyboard controls, ARIA system).

---

## Scope constraints:
- Do NOT use external libraries.
- Do NOT convert into modules or frameworks.
- Do NOT add imports/exports.
- Do NOT modify HTML/CSS unless absolutely necessary.
- Keep logic explicit, minimal, and maintainable.
- Keep UI rendering separate from game logic.

---

## Rules for this iteration:

### 1. Symbol Upgrade (UI Visual Layer)
- Replace all text-based slot symbols with SVG or inline image icons for:
  - Ramen
  - Energy
  - Textbook
  - Change
  - Diploma
- Each `.symbol-slot` must render the icon as the primary visual element.
- The original text must remain in the DOM for accessibility.

### Accessibility requirement:
- Use `aria-label` or `.sr-only` text so screen readers still announce symbol names.
- Do NOT remove semantic meaning from symbols.

---

### 2. ARIA Live Region (Preserve + Extend)
- Preserve Iteration 15 ARIA live region functionality.
- Ensure it continues working correctly with icon-based symbol rendering.
- Must still announce:
  - Win messages (“You won 50 credits”)
  - Loss messages (“Try again”)

---

### 3. Payline Highlighting (Enhancement)
- Winning paylines must be highlighted using a neon red border.
- Must remain minimal (no heavy animation system).
- Must reset cleanly on next spin.

---

## Implementation requirements:
- Preserve ARIA live region behavior from Iteration 15.
- Ensure symbol rendering changes do not break accessibility.
- Use JavaScript to dynamically render SVG/image-based symbols.
- Validate helper functions with clear error handling.
- Use small, well-named functions (DRY principle).
- Include full JSDoc annotations for all functions.
- Before writing code, explain function logic in a plain text comment.

---

## Compatibility requirements:
- Preserve `state` object unless minimally extended:
  - Only allowed additions:
    - `announcementsEnabled` (if needed)
- Preserve `SYMBOLS` as the UI metadata source.
- Preserve weighted RNG + spin pipeline unchanged.
- Preserve payline evaluation, payout, Wild/Scatter logic unchanged.
- Preserve DOM structure and keyboard interactions from Iterations 6–15.

---

## Output rules:
- Apply all changes directly in `game/iteration-16/`.
- Do not create additional folders or files outside iteration-16.

---

## Static Analysis (Linters & Validators)
1. HTML Validation:
   - `npx html-validate "iteration-16/*.html"`

2. CSS Linting:
   - `npx stylelint "iteration-16/**/*.css"`

3. JavaScript Linting:
   - `npx eslint "iteration-16/**/*.js"`

4. Full Lint Check:
   - Run all linters together and fix issues before proceeding.

---

## Logic Testing (Unit Tests)
- Run: `npm run test:unit`
- Validate:
  - Symbols still match HTML definitions
  - RNG output remains consistent
- Update tests if symbol system changes require it

---

## UI Testing (End-to-End Tests)
- Ensure server is running:
  - `npx kill-port 3000`
  - `npx serve iteration-16 -p 3000`
- Run:
  - `npm run test:e2e`
- Verify:
  - Spin works correctly
  - SVG icons render properly
  - Paylines highlight correctly
  - ARIA announcements still fire correctly

---

## Final "Safe to Commit" Check
- All lint checks pass
- All unit tests pass
- All E2E tests pass
- No architecture changes introduced
- Only Iteration 16 logic added
- No regressions from Iteration 15

---

## The Result (What happened?):

**Iteration 16 successfully upgrades the slot machine UI from text-based symbols to SVG/icon-based rendering while preserving full accessibility and ARIA functionality. Winning paylines are visually emphasized with a neon red border, and screen reader support remains intact via ARIA live region updates. The game maintains its modular architecture while significantly improving visual polish and accessibility compliance.**

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-16/game.js`. The reviewed limitations were documented rather than corrected in this iteration.

### Iteration 17:

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

---

## Context:
- You are working on a browser-based "Broke College Student Slot Machine."
- Use `game/iteration-16/` as the baseline for this iteration.
- This prompt is for Iteration 17, and the result must become a new `game/iteration-17/` folder that is a direct continuation of Iteration 16.
- Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
- Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.

- The current Iteration 16 code already has:
  - a typed `state` object
  - symbol configuration in `SYMBOLS`
  - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
  - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
  - weighted symbol selection helpers
  - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
  - a clean intermediate spin-result layer
  - pure helpers that generate per-reel symbol sequences
  - pure helpers that convert spin results into the final 3x5 reel matrix
  - a payline-evaluation layer that reads the current matrix and returns structured payline results
  - a payout-calculation layer that uses bet size and matched paylines to update balance
  - Wild and Scatter logic helper functions
  - DOM manipulation functions that connect the HTML grid and JS 2D array
  - responsive spin + bet wager mechanics
  - keyboard bindings to spin mechanism
  - visual indicators for game outcomes via CSS state changes, and icons for each of the spins
  - ARIA live region updates for accessibility (“You won 50 credits”, etc.)
  - payline highlighting with a neon red border for winning combinations

---

## Task:
Create `game/iteration-17/` by building directly on top of `game/iteration-16/`.

---

## Folder requirements:
- Treat `game/iteration-16/` as the source of truth.
- Create `game/iteration-17/` as a continuation of Iteration 16.
- Copy all non-generated files unchanged unless absolutely required.
- Do NOT copy `node_modules` or generated artifacts.
- Modify ONLY `game/iteration-17/game.js`.
- Do NOT rewrite architecture or restructure the project.
- Preserve all iteration-16 systems (RNG, paylines, payout, DOM, Wild/Scatter, keyboard controls, ARIA system).

---

## Scope constraints:
- Do NOT use external libraries.
- Do NOT convert into modules or frameworks.
- Do NOT add imports/exports.
- Do NOT modify HTML/CSS unless absolutely necessary.
- Keep logic explicit, minimal, and maintainable.
- Keep UI rendering separate from game logic.

---

## Rules for this iteration:

## 1. Reel Spin Animation (New Feature)
- Create a visual reel spin animation, scrolling symbols downwards using transitions for 300-600 milliseconds, staggered slightly across each reel.
- Disable the spin reel button during this animation to prevent double spins.

# Accessibility requirement:
- Disable the animation with the 'prefers-reduced-motion' accessibility option, and register the spin instantly

---

## Implementation requirements:
- Preserve ARIA live region behavior from Iteration 16.
- Ensure symbol rendering changes do not break accessibility.
- Use JavaScript to dynamically render SVG/image-based symbols.
- Validate helper functions with clear error handling.
- Use small, well-named functions (DRY principle).
- Include full JSDoc annotations for all functions.
- Before writing code, explain function logic in a plain text comment.

---

## Compatibility requirements:
- Preserve `state` object unless minimally extended:
  - Only allowed additions:
    - `announcementsEnabled` (if needed)
- Preserve `SYMBOLS` as the UI metadata source.
- Preserve weighted RNG + spin pipeline unchanged.
- Preserve payline evaluation, payout, Wild/Scatter logic unchanged.
- Preserve DOM structure and keyboard interactions from Iterations 6–16.

---

## Output rules:
- Apply all changes directly in `game/iteration-17/`.
- Do not create additional folders or files outside iteration-17.

---

## Static Analysis (Linters & Validators)
1. HTML Validation:
   - `npx html-validate "iteration-17/*.html"`

2. CSS Linting:
   - `npx stylelint "iteration-17/**/*.css"`

3. JavaScript Linting:
   - `npx eslint "iteration-17/**/*.js"`

4. Full Lint Check:
   - Run all linters together and fix issues before proceeding.

---

## Logic Testing (Unit Tests)
- Run: `npm run test:unit`
- Validate:
  - Symbols still match HTML definitions
  - RNG output remains consistent
- Update tests if symbol system changes require it

---

## UI Testing (End-to-End Tests)
- Ensure server is running:
  - `npx kill-port 3000`
  - `npx serve iteration-17 -p 3000`
- Run:
  - `npm run test:e2e`
- Verify:
  - Spin works correctly
  - SVG icons render properly
  - Paylines highlight correctly
  - ARIA announcements still fire correctly

---

## Final "Safe to Commit" Check
- All lint checks pass
- All unit tests pass
- All E2E tests pass
- No architecture changes introduced
- Only Iteration 17 logic added
- No regressions from Iteration 16

---

## The Result (What happened?):

**Iteration 17 succesfully adds the spin animation to the game, fully utilizing the existing helper functions and wiring everything together. The model fully followed all the directions, down to the timing of the spins. Accessibility is maintained through disabling the animation with reduced motion. The previous iteration is improved upon by adding some life to the game, however the spin animation does look a little limited.**

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-17/game.js`.


### Iteration 18:

Act as a strict, senior software engineer obsessed with clean code and the DRY principle.

---

## Context:
- You are working on a browser-based "Broke College Student Slot Machine."
- Use `game/iteration-17/` as the baseline for this iteration.
- This prompt is for Iteration 18, and the result must become a new `game/iteration-18/` folder that is a direct continuation of Iteration 17.
- Phase 3 is for connecting the work done in Phase 1 (UI) and Phase 2 (Logic) to create a playable game.
- Use the project research context from `plan/research-overview.md` and the raw research notes in `plan/raw-research/individual-research/nicole-research.md` as background constraints.

- The current Iteration 17 code already has:
  - a typed `state` object
  - symbol configuration in `SYMBOLS`
  - ordered symbol weights in `SYMBOL_WEIGHT_ENTRIES`
  - a validated weighted RNG layer via `WEIGHTED_SYMBOL_TABLE`
  - weighted symbol selection helpers
  - a reel matrix stored as `reelMatrix[reelIndex][slotIndex]`
  - a clean intermediate spin-result layer
  - pure helpers that generate per-reel symbol sequences
  - pure helpers that convert spin results into the final 3x5 reel matrix
  - a payline-evaluation layer that reads the current matrix and returns structured payline results
  - a payout-calculation layer that uses bet size and matched paylines to update balance
  - Wild and Scatter logic helper functions
  - DOM manipulation functions that connect the HTML grid and JS 2D array
  - responsive spin + bet wager mechanics
  - keyboard bindings to spin mechanism
  - visual indicators for game outcomes via CSS state changes, and icons for each of the spins
  - ARIA live region updates for accessibility (“You won 50 credits”, etc.)
  - payline highlighting with a neon red border for winning combinations

---

## Task:
Create `game/iteration-18/` by building directly on top of `game/iteration-17/`.

---

## Folder requirements:
- Treat `game/iteration-17/` as the source of truth.
- Create `game/iteration-18/` as a continuation of Iteration 17.
- Copy all non-generated files unchanged unless absolutely required.
- Do NOT copy `node_modules` or generated artifacts.
- Modify ONLY `game/iteration-18/game.js`.
- Do NOT rewrite architecture or restructure the project.
- Preserve all iteration-17 systems (RNG, paylines, payout, DOM, Wild/Scatter, keyboard controls, ARIA system).

---

## Scope constraints:
- Do NOT use external libraries.
- Do NOT convert into modules or frameworks.
- Do NOT add imports/exports.
- Do NOT modify HTML/CSS unless absolutely necessary.
- Keep logic explicit, minimal, and maintainable.
- Keep UI rendering separate from game logic.

---

## Rules for this iteration:

## 1. Audio (New Feature)
- Implement the Web Audio API, which works with the current mute button and isMuted state.
- Add 4 sounds generated procedurally with AudioContext: a mechanical clink on bet placement, a short ascending tone on a small win, a longer cascading coin sound on a big win, and a neutral tick on a loss
- All sounds must check isMuted before playing

---

## Implementation requirements:
- Preserve ARIA live region behavior from Iteration 16.
- Ensure symbol rendering changes do not break accessibility.
- Use JavaScript to dynamically render SVG/image-based symbols.
- Validate helper functions with clear error handling.
- Use small, well-named functions (DRY principle).
- Include full JSDoc annotations for all functions.
- Before writing code, explain function logic in a plain text comment.

---

## Compatibility requirements:
- Preserve `state` object unless minimally extended:
  - Only allowed additions:
    - `announcementsEnabled` (if needed)
- Preserve `SYMBOLS` as the UI metadata source.
- Preserve weighted RNG + spin pipeline unchanged.
- Preserve payline evaluation, payout, Wild/Scatter logic unchanged.
- Preserve DOM structure and keyboard interactions from Iterations 6–17.

---

## Output rules:
- Apply all changes directly in `game/iteration-18/`.
- Do not create additional folders or files outside iteration-18.

---

## Static Analysis (Linters & Validators)
1. HTML Validation:
   - `npx html-validate "iteration-18/*.html"`

2. CSS Linting:
   - `npx stylelint "iteration-18/**/*.css"`

3. JavaScript Linting:
   - `npx eslint "iteration-18/**/*.js"`

4. Full Lint Check:
   - Run all linters together and fix issues before proceeding.

---

## Logic Testing (Unit Tests)
- Run: `npm run test:unit`
- Validate:
  - Symbols still match HTML definitions
  - RNG output remains consistent
- Update tests if symbol system changes require it

---

## UI Testing (End-to-End Tests)
- Ensure server is running:
  - `npx kill-port 3000`
  - `npx serve iteration-18 -p 3000`
- Run:
  - `npm run test:e2e`
- Verify:
  - Spin works correctly
  - SVG icons render properly
  - Paylines highlight correctly
  - ARIA announcements still fire correctly

---

## Final "Safe to Commit" Check
- All lint checks pass
- All unit tests pass
- All E2E tests pass
- No architecture changes introduced
- Only Iteration 18 logic added
- No regressions from Iteration 17

---

## The Result (What happened?):

**Iteration 18 successfully added the audio to the game, with full functionality and compatibility with the mute button. The only minor thing is there's no sound of cascading coins, instead replaced with a fancier beep sequence. The model was able to implement the feature without any holdups or reprompting. Nothing else was touched or changed that was irrelevant to adding audio functionality to the slot machine.**

**Hand-Edits Required? (Yes/No):**
* No. No manual logic changes were made in `game/iteration-18/game.js`.
