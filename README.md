# Task 2 — AI-Assisted Development Plan
**CSE 110 | Group 10 | Spring 2026**

## Overview
This repository contains our team's structured plan for integrating AI tooling into our software engineering project. It documents our research, chosen AI harness, model justification, and a running log of AI usage throughout the project lifecycle.

## Repository Structure
```
warmup-2-team-10/
├── game/
│   ├── iteration-1/             # AI batch 1 — slot machine source code
│   ├── iteration-2/             # AI batch 2
│   ├── iteration-3/             # AI batch 3
│   ├── iteration-4/             # AI batch 4
│   ├── tests/
│   │   ├── unit/                # Vitest unit tests
│   │   └── e2e/                 # Playwright end-to-end tests
│   ├── eslint.config.js         # JS linter (ESLint + JSDoc enforcement)
│   ├── .stylelintrc.json        # CSS linter
│   ├── .htmlvalidate.json       # HTML validator
│   ├── vitest.config.js         # Unit test runner config
│   ├── playwright.config.js     # E2E test runner config
│   └── package.json             # npm scripts and dependencies
├── plan/
│   ├── raw-research/            # Raw notes and research artifacts
│   │   ├── individual-research  # Individual contributions
│   │   ├── personas-and-users   # Persona docs + User stories
│   │   ├── visuals              # Visuals for reference
│   ├── research-overview.md     # Summary of research
│   ├── ai-plan.md               # Tool/model, justification and project features/strategy
│   └── ai-use-log.md            # Running log of AI interactions
└── final-report/                # Final deliverable (to be completed)
```

## Running the Linter and Tests

All tooling lives in the `game/` folder. Run everything from there.

**First-time setup** — install dependencies:
```bash
cd game
npm install
```

**Run everything at once** (HTML validation + linting + tests):
```bash
npm run check
```

**Run individual tools:**
```bash
npm run validate:html   # HTML validator (all iteration-* folders)
npm run lint:css        # CSS linter (stylelint)
npm run lint:js         # JS linter with JSDoc enforcement (ESLint)
npm run lint            # CSS + JS linters together
npm run test:unit       # Vitest unit tests
npm run test:e2e        # Playwright E2E tests (requires a server — see below)
```

**E2E tests** require a local server pointing at whichever iteration you're testing:
```bash
npx serve game/iteration-1 -p 3000
# then in a separate terminal:
npm run test:e2e
```

Run `npm run check` after every AI-generated batch to catch issues before they compound.

## AI Tooling Decision
| | |
|---|---|
| **Tool** | OpenAI Codex |
| **Model** | codex-5.4 (medium effort) |
| **Rationale** | Best balance of reasoning quality and speed for iterative software engineering tasks |

See [plan/ai-plan.md](plan/ai-plan.md) for the full justification.

## Team
Group 10 — CSE 110, UC San Diego
