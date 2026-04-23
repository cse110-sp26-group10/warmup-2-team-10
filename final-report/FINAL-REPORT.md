# FINAL-REPORT.md

## Overview

The goal of this warmup activity is to assess the viability of using generative AI as a potential engineering tool. Our process followed a structured approach with research, planning, and development and testing, with clear requirements and constraints given to the AI assistant during each iteration.

## Research

To help us better understand our users, we conducted a domain research on slot machines.
| Topic | Examples |
| ----- | -------- |
| Slot Machine Mechanics | RNG, paylines, RTP, volatility |
| Design Principles | Simple layout, clear feedback, fast interaction loop |
| Psychological Factors | Variable rewards, low-effort interactions, near-miss effects |
| Accessibility Considerations | High contrast, keyboard-friendly, reduced motion |
| Target Audience | College students, older adults, casual web users |

## Planning Phase

The planning phase is where we brainstorm ideas for features of the slot machine, as well as devise strategies for utilizing generative AI as an engineering tool to build the slot machine from scratch.

### User-Focused Activities

The purpose of creating personas and user stories is to think from the perspective of users to make better technical decisions when building the slot machine.

- **Persona 1:** Bob, a thrill-seeking college student who wants a slot machine with extremely fast-paced gameplay, stimulating lights, colors, and animation to celebrate winning, and allows for high-risk bets.
- **Persona 2:** Elena, a casual and responsible college student who wants a slot machine that serves as a brain break, has a clean interface, and doesn't have excessive colors and loud audio.
- **Features From User Stories:** Visible balance and bet size, bet size controls, stimulating visual effects, mute/unmute button, audio for screen-reader users, relateable slot symbols, intuitive controls.

### Tools & Models

We chose OpenAI Codex with codex-5.4 at medium effort given our familiarity with the tool from the first warmup activity, its generous free plan, as well as its strong code generation capabilities. By keeping the effort level at medium, we are able to obtain a strong balance between reasoning quality, speed, and token usage. A higher effort model would consume more tokens and the reasoning level was deemed unnecessary for the scope of this project, while a lower effort model could compromise the quality of more complex tasks.

### Strategies

| Planned Strategy | Execution |
| ---------------- | --------- |
| Small Increments (The 5-5-5-5 Workflow) | Mostly followed. The project is still divided into four phases as planned, but with 22 instead of 20 iterations, splitted 5-5-5-7. |
| Skill Files & Context Priming | Partially followed. `research-overview.md` started being used as a "skill file" context in Iteration 6, and `nicole-research.md` started being used in Iteration 7. `user-personas.md` was never used. |
| Headless First | Not followed. The code was already integrated into the browser script in Iteration 4 (when `game.js` was first created) instead of being extracted into a separate headless model due to lack of clear instructions in the prompt. |
| Adversarial Testing | Partially followed. Linting started being included in the prompt in Iteration 7. Unit tests and E2E tests started being included in the prompt in Iteration 15. |
| Hand-Editing Protocol | Followed. Hand-edits were only made in some iterations to fulfill the iteration requirements. |

## Development Phase 1

The goal for the first phase is to establish the strict minimalist UI, semantic HTML, and empty JavaScript architecture. The game logic should not be implemented yet in this phase.

| # | Iteration Task | What Worked | What Didn't |
| - | -------------- | ----------- | ----------- |
| 1 | Create the semantic HTML skeleton. | - Created a clean and readable structure with aria attributes. <br> - Result region uses aria-live. | - aria-label attributes failed test cases and required manual edits. |
| 2 | Create a minimalist CSS framework using CSS grid to map out the 3x5 reel layout. | - Created an unstyled and unresponsive slot-machine layout with vertically stacked elements. | - N/A |
| 3 | Set up the static visual elements. | - Basic visual static elements are all implemented. <br> - Structure from Iteration 2 is preserved. | - Linter shows errors caused by invalid aria-labels. |
| 4 | Build the foundational Vanilla JS file structure. | - The file structure was created with JSDoc type annotations. | - Basic functions such as spinning, resetting, currency switch, bet size change, and mute/unmute is already working when it should be kept for Phase 3. |
| 5 | Create a CI/CD configuration. | - Four new files were created for the CI/CD configuration. | - The CI/CD setup didn't work on GitHub because the files were created within the iteration subfolder rather than at the root of the repository. <br> - A root-level `.github/workflows/ci.yml` had to be manually created afterwards. |

## Development Phase 2

The goal for the second phase is to build the invisible math and logic that is completely detached from the UI. All changes should be within the JavaScript model.

| # | Iteration Task | What Worked | What Didn't |
| - | -------------- | ----------- | ----------- |
| 6 | Build the RNG algorithm utilizing the weighted probability arrays from research. | - Matched the Iteration 6 prompt closely. <br> - Kept UI-facing spin logic thin. <br> - Introduced reusable pure helper functions that later iterations can build on for matrix population, payline traversal, payout calculation, and wild/scatter handling. | - The code is not fully detached from the UI. |
| 7 | Write the logic that populates the 3x5 2D array grid based on the RNG spin results. | - Requirement for invisible math and logic was met. <br> - UI-facing spin path stayed thin. <br> - Helpers are pure and reusable. <br> - Code is set up for later work on paylines, payout calculation, and wild/scatter handling without changing the current rendered behavior. | - The repo-level lint command requested in the prompt could not be brought to green. | - The first folder copy included game/iteration-7/node_modules, which violated the “do not duplicate generated artifacts” rule. |
| 8 | Write the payline traversal logic. | - The new helpers are small, clearly named, and reusable, and the logic stays focused on payline traversal only. | - The generated validator ended up more rigid than ideal for future paylines. <br> - An unrelated root `package-lock.json` change was flagged during review. |
| 9 | Write the payout calculation logic. | - The new helpers are small, clearly named, and reusable. <br> - The balance update logic builds directly on the existing payline-evaluation output without rewriting the project structure. | - The initial Iteration 9 result exposed payout-specific win/loss text in the visible status message. |
| 10 | Handle the "Wilds" and "Scatters" logic. | - The new helpers are small, clearly named, and reusable. <br> - The payout flow remains compatible. | - Unmatched evaluations still needed a cleaner `matchedSymbolId: null` contract. <br> All-Wild paylines were semantically ambiguous. <br> Scatter evaluation included one redundant traversal. |

## Development Phase 3

The goal for the third phase is to connect the first two phases (UI and logic), allowing the game to be accessible and playable.

| # | Iteration Task | What Worked | What Didn't |
| - | -------------- | ----------- | ----------- |
| 11 | Write the DOM manipulation functions. | - N/A | - Abstraction didn't seem entirely necessary. |
| 12 | Wire up the "Spin" button and the Bet +/- buttons to trigger the game logic. | Conveyed core changes expected for this iteration. | - Manual logic changes had to be made to fix errors in the validator, linter, and tester. |
| 13 | Add accessibility features: bind the spin action to the Spacebar and Enter keys. | - Created bindings to keys that allow the user to interact with the game physically. | - N/A |
| 14 | Create visual feedback that triggers when a specific payline wins. | - Created minimalist CSS state changes for user wins. | - CSS state changes only exist for the win and nothing else. |
| 15 | Add ARIA live region updates. | - Added ARIA live region accessibility support and enhanced winning payline visualization using a neon red border. | - N/A |

## Development Phase 4

The goal for the fourth and final phase is to harden the application to meet the strict software engineering standards outlined by the rubric. This includes implementing additional features and enhancing the visuals.

| # | Iteration Task | What Worked | What Didn't |
| - | -------------- | ----------- | ----------- |
| 16 | Replace text-only symbol slots with consistent SVG/inline images for all symbols and have text be hidden in the DOM for screen readers via aria-label. | - Upgraded the slot machine UI from text-based symbols to SVG/icon-based rendering. | N/A |
| 17 | Add a visual reel spin animation that is staggered across reels, disables the spin button during the animation, and respect prefers-reduced-motion settings. | - Added the spin animation to the game. <br> - Accessibility is maintained through disabling the animation with reduced motion. | - The spin animation looks limited. |
| 18 | Use the Audio Web API to create four procedural sounds that plays upon bet placements, small wins, big wins, and losses. All sounds must respect the mute state. | - Added the audio to the game. <br> - Audio compatible with the mute button. | - A fancy beep was used in place of the sound of cascading coins. |
| 19 | Implement a coin shower animation for wins, highlighted symbols on the winning payline, and win amount overlay text. All three features must be suppressed when prefers-reduced-motion. | - Implemented the bells and whistles. <br> - Added a coin shower animation with win text and pulsing animation. | - Had to change the `.coin-shower-layer.is-visible` opacity property from 0 to 1. |
| 20 | Add the autoplay feature with varying number of spins. Autoplay can be canceled at any time. | - Implemented the free spin mechanic. <br> - Scatter detection correctly triggers the bonus. <br> - Added a free spin counter along with visual indicator for bonus mode. | - N/A |
| 21 | Add arrow key support on the bet controls, ensure that animations are disabled when reduced motion is active, and replace the static paytable with a JS-generated modal that opens via a button and closes by pressing the Escape button or backdrop click. | - Implemented the Autoplay feature. <br> - User is able to select predefined number of spins and stop autoplay. | - N/A |
| 22 | Implement features for showing session statistics and a banner that appears when balance drops below half of the initial balance. | - Improved accessibility with arrow key support for bet controls. <br> - Replaced static paytable with dynamic, data-driven modal. <br> - Animations are suppressed under `prefers-reduced-motion`. | - N/A |

## Conclusion

AI assistants like Codex are powerful tools that can accelerate the development of software engineering projects. However, successful use of such tools require careful planning and oversight. As seen in this warmup, most of the problems encountered were during the first phase of development, where the context was only briefly described as opposed to feeding research files, Codex only had access to the iteration subfolder as opposed to the entire repository, and the prompt was not as detailed. In later iterations, prompts included context provided by text and files, the task at hand, folder requirements, scope and file constraints, architecture constraints, implementation requirements, compatibility requirements, output rules, and validation, linting, and testing environments. This gives a clear direction that future use of AI assistants in software engineering requires considerable investment of time into detailing the prompts and writing tests in order to guide them to successfully complete the task requirements.