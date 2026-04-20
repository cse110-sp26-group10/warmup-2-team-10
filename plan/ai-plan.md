# AI Plan

## Intended AI Use
We will use AI assistance for code generation, debugging, documentation, and research summarization throughout the project.

## Tools & Models
- **Tool:** OpenAI Codex (via CLI)
- **Model:** codex-5.4 (medium effort)

## Model Justification
We selected OpenAI Codex with codex-5.4 at medium effort after evaluating the three available options (Codex, Claude Code, and Gemini CLI). Our team used Codex during Warm-Up I, so every member was already familiar with the tool, its CLI workflow, and its output patterns — removing any onboarding friction going into a more complex project. Codex also offers a generous free plan with a large credit allocation, making it practical for sustained, iterative use across the full project without cost concerns. Codex integrates directly into our development workflow with strong code generation capabilities suited for a software engineering project. We chose codex-5.4 at medium effort as it provides a strong balance between reasoning quality and speed — it is capable enough to handle multi-step coding tasks and code review while remaining efficient for iterative use across the full project lifecycle. Higher effort settings were considered but deemed unnecessary for the scope of this project, and lower effort risked reduced output quality on more complex tasks. Furthermore, the higher effort models used more tokens which wouldn't work well with the limitation of us being on the free plan.

## Prompting Strategy
- Provide clear, scoped prompts with relevant context (file names, function signatures, expected behavior)
- Use iterative refinement — start broad, then narrow down with follow-up prompts
- Log all significant AI interactions in ai-use-log.md with the prompt, output summary, and any edits made
