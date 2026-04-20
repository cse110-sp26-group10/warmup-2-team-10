# Persona Docs: Project Slot Machine
**Document Purpose:** To define personas for our AI-assisted slot machine application, ensuring our prompt engineering and architectural decisions remain user-centric, specifically prioritizing accessibility and minimalist design.

## Persona 1: Bob - The Thrill-Seeker College Student

### Demographics & Background
* **Age:** 24
* **Occupation:** Undergraduate Student in Computer Science
* **Tech Proficiency:** High. Extremely proficient with mobile games, Discord bots, and fast-paced web apps.
* **Context:** Bob is a highly caffeinated student who uses gaming to blow off steam and distract himself from the 500 rejections he's had from internship hunting. He loves to gamble with real money, he is fiercely competitive and loves chasing the psychological thrill of a high-risk, high-reward system. 

### Goals
* To experience continuous, rapid-fire gameplay without artificial delays between spins.
* To be visually and audibly stimulated; he associates bright, chaotic colors (like energy drink branding) and explosive CSS animations with winning.
* To have access to high variance/volatility mechanics where he can risk a massive amount of his money for a rare, massive payout.

### Pain Points
* **Slow Pacing:** Mandatory delays, slow reel animations, or unskippable transitions ruin his momentum and frustrate him.
* **"Boring" Aesthetics:** Overly muted or "corporate" designs feel unrewarding. If he hits a jackpot, he wants the screen to reflect that excitement.
* **Bet Limits:** Restrictive maximum bet caps prevent him from doing a simulated "all-in" with his meal plan swipes.

### Software Engineering & AI Prompt Implications
* **State Management (Turbo Mode):** The application architecture must support a "Turbo Spin" state that bypasses standard setTimeout animation delays, requiring the AI to write highly efficient DOM updates for instant results.
* **Visual Engine:** The AI must be prompted to include bold, high-contrast CSS design elements utilizing our chosen vibrant accent colors (Neon Green, Safety Orange, Electric Yellow). When a win occurs, the JS should trigger classes like `.flash-excitement` for maximum visual pop.
* **Math Model:** The underlying RTP/Volatility algorithms must allow for a "High Volatility" toggle. The prompt needs to ensure the math logic supports rare, massive simulated payouts (e.g., hitting 5 'Wild Diplomas' in a row) to satisfy the desire for a massive Dining Dollar win.
