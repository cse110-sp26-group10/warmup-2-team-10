# Research Artifact: Student-Life Theme Alignment With Current Slot Iterations
**Researcher:** Xuanye

This note focuses on the student-life theme already visible in the current slot machine iterations and explains how that theme can be extended without contradicting the implemented code. The goal is to keep the design direction coherent across research, prompts, and the actual game.

## 1. Current Theme Already Present in Code

The current game is not using a generic casino theme. The implemented direction is already a college-student slot machine with everyday campus-oriented symbols and labels.

Current symbol set used in the later iterations:

- **Ramen**
- **Energy**
- **Textbook**
- **Change**
- **Diploma** as the **Wild**
- **Scholarship** as the **Scatter**

This means the research should support that symbol vocabulary rather than proposing a different primary set as if the theme is still undecided.

## 2. Why This Theme Works

The student-life theme fits the project because it makes the slot machine feel specific to the team’s audience and user stories. It also helps the game feel playful and fictional rather than like a direct imitation of a real-money casino product.

Benefits of the current theme:

- **Differentiation:** It gives the project a stronger identity than default fruit-machine symbols.
- **Readability:** Objects like ramen, textbooks, and loose change are easy to recognize.
- **Humor and relatability:** Symbols reflect student stress, budgeting, and campus life.
- **Consistency with user stories:** The existing user research already mentions student-life assets.

## 3. Theme-to-Mechanic Mapping in the Current Build

The current implementation already maps the student theme into game logic, not just visuals.

- **Ramen, Energy, Textbook, and Change** function as regular payout symbols.
- **Diploma** functions as a **Wild**, which fits thematically because it represents the big goal that can help complete a winning line.
- **Scholarship** functions as a **Scatter**, which also makes thematic sense because it is a special event rather than an everyday item.

This is a strong mapping and should be treated as the baseline model for future prompts and planning artifacts.

## 4. Current Mechanical Direction to Preserve

The later iterations already include several concrete design decisions that research notes should not contradict:

- A **3-reel by 5-slot** layout
- **Horizontal paylines** across the visible rows
- A visible **paytable**
- **Weighted randomness** instead of uniform symbol selection
- **Wild substitution** logic
- **Scatter counting** logic
- Adjustable **bet sizes**
- Multiple **currency modes**
- **Keyboard-accessible** spin behavior and live region updates

Because these are already implemented, research should frame them as established direction rather than open questions.

## 5. Current Payout / Rarity Direction

The code also already suggests a rarity and payout hierarchy:

- **Ramen** appears most often and pays the least
- **Energy** is slightly more valuable
- **Change** and **Textbook** are stronger standard wins
- **Diploma Wild** is rare and does not pay as a regular symbol
- **Scholarship Scatter** is special-state logic, not a normal payline payout

This supports a clear student-life progression:

- everyday survival items
- useful academic/work items
- milestone or opportunity symbols

That progression is already good enough for the current theme and does not need to be replaced.

## 6. What Should Count as Future Extension, Not Current Fact

Some student-life symbols could still be good ideas later, but they should be presented as optional extensions instead of current requirements.

Examples of future alternatives or additions:

- Student ID card
- Coffee cup
- Laptop
- Meal card
- Internship email

These should only be introduced in future iterations if the team intentionally changes the symbol set. They should not be described as if they are already part of the current game.

## 7. Prompting Guidance That Matches the Current Code

If the team uses AI for visuals or refinements, prompts should preserve the implemented theme rather than reset it.

Useful prompt constraints:

- Use a college-student slot machine theme.
- Keep the existing symbol family centered on ramen, energy, textbook, change, diploma, and scholarship.
- Treat diploma as the Wild symbol.
- Treat scholarship as the Scatter symbol.
- Use clean, high-contrast icon design with readable silhouettes.
- Avoid replacing the current theme with generic casino icons like gems, crowns, or sevens.
- Keep the interface visually clean so symbols remain readable across the 3x5 layout.

## 8. Recommended Research Takeaway

The strongest contribution of this research is not inventing a brand-new theme. It is confirming that the current code already has a coherent student-life identity and that future work should reinforce it. The safest path is to preserve the existing symbol meanings, visual tone, and mechanical mapping while polishing animation, accessibility, and presentation in later iterations.

