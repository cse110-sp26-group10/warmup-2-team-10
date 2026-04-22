# Tech Warmup II: Generative AI as an Engineering Tool?
**CSE 110 | Group 10 | Spring 2026**

## Overview
This repository documents our team's experiment in using Generative AI as an engineering tool to build a strategic, high-quality slot machine game. We aim to measure the effectiveness of AI in producing software that adheres to strict engineering standards, including comprehensive testing, linting, and accessibility.

## Repository Structure
```
warmup-2-team-10/
├── game/                        # All source code and test configurations
│   ├── iteration-1/             # All iterations 
│   ├── ...         
│   ├── iteration-20/            
│   ├── tests/
│   │   ├── unit/                # Vitest unit tests
│   │   └── e2e/                 # Playwright end-to-end tests
│   ├── eslint.config.js         # JS linter (ESLint + JSDoc enforcement)
│   ├── vitest.config.js         # Unit test runner config
│   ├── playwright.config.js     # E2E test runner config
│   └── package.json             # npm scripts and dependencies
├── plan/                        # Required project planning artifacts
│   ├── raw-research/            # Individual notes, Miro links, and wireframes
│   │   ├── personas-and-users   # Minimum 2 persona docs + 5 user stories
│   │   └── visuals/             # Visual theme assets and jargon research
│   ├── research-overview.md     # Summary of research and team roster
│   ├── ai-plan.md               # Initial strategy for AI usage (skill files, agents)
│   └── ai-use-log.md            # Real-time log of AI interactions (min. 20 entries)
└── final-report/                # Final deliverables (Report + Video + PDF)
```

## Engineering Standards
To ensure software quality, we enforce the following standards throughout the process:
* **Testing**: Unit tests (Vitest) are required at a minimum; E2E tests (Playwright) are used to verify user flows.
* **Linting**: Automated checks for HTML validation, CSS usage, and JS style (ESLint with JSDoc).
* **Documentation**: All JavaScript code uses JSDoc with type annotations for clarity and maintainability.
* **Clean Code**: We prioritize meaningful names, small functions, and DRY (Don't Repeat Yourself) principles.

## Running the Linter and Tests
Run all commands from the `game/` folder.

**First-time setup**:
```bash
cd game
npm install
```

**Run all checks** (HTML validation + linting + tests):
```bash
npm run check
```

**Individual tool commands**:
* `npm run validate:html`: Validates HTML structure across all iterations.
* `npm run lint`: Runs both CSS and JS linters.
* `npm run test:unit`: Executes Vitest unit tests.
* `npm run test:e2e`: Executes Playwright tests (requires server at port 3000).

## AI Tooling Decision
| Component | Choice |
| :--- | :--- |
| **Harness** | OpenAI Codex |
| **Model** | codex-5.4 (medium effort) |
| **Rationale** | Selected for its balance of reasoning quality and speed in iterative tasks. |

## Rules of Engagement
* **AI-First**: Attempt to correct code via prompting before manually editing.
* **Human-Verified**: All code must be read and evaluated by the team before committing.
* **Manual Log**: Every interaction with the AI is documented in `plan/ai-use-log.md`.