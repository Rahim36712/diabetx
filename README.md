# DiabetX — Your Digital Twin for Diabetes Self-Management

## a. What it does, and for whom

DiabetX is a lightweight **digital twin** for people managing or at risk of
Type 2 diabetes. Instead of a static list of past lab reports, it keeps a
live, computed model of the user's metabolic health — built from the
numbers they log (weight, HbA1c, fasting glucose, sleep, exercise, diet
quality) — and lets them:

1. See a transparent, explainable health score instead of a raw lab report
2. Understand *why* their score looks the way it does, in plain language
3. Track their score and HbA1c over time as they log more entries
4. Run "what if" scenarios (lose weight / exercise more / eat better) and
   see the *estimated* effect before committing to a change
5. Ask an AI coach a question and get an answer grounded in their own
   numbers, not generic advice

**Real problem it solves:** most people with prediabetes/diabetes get their
labs once every few months and no clear sense of what day-to-day habits
actually move the needle, or why. DiabetX turns "HbA1c: 6.4%" into "here's
your score, here's what's driving it, here's your trend, and here's what
changing X would do."

**Who it's for:** individuals managing their own Type 2 diabetes or
prediabetes risk who want a day-to-day feedback loop between lab reports —
not a replacement for a doctor.

## b. Live URL

**[FILL IN AFTER DEPLOYING — see "Deploy" below]**

`https://your-project-name.vercel.app`

## c. Features

- **Log entries**: weight, HbA1c, fasting glucose, sleep, exercise minutes/week, self-rated diet quality
- **Digital Twin Score**: a composite 0–100 score shown as a gradient ring, plus three sub-scores (Metabolic, Activity, Nutrition), computed with transparent, documented formulas — not a black box
- **Plain-language explanation**: a deterministic, rule-based line under the score identifying which factor is holding it back and why (no AI call — reads the same numbers the scoring engine used)
- **Trend timeline**: chart of your Twin Score and HbA1c across every entry you've logged
- **What-if simulator**: sliders for weight change, exercise change, and diet quality change, with live before/after comparison — deterministic, not AI-guessed
- **Entry history**: every logged entry with its score, deletable individually
- **AI Coach**: ask free-text questions about your numbers; answers are grounded in your latest logged entry and computed scores
- **No account needed**: data is stored locally in your browser (`localStorage`), so you can try it immediately with zero signup friction

## d. The AI feature

**What it does:** the "AI Coach" panel lets the user ask a free-text
question (e.g. *"Why is my metabolic score low?"*). The question, plus the
user's most recent logged entry and their computed Twin Scores, are sent to
a server-side API route, which calls the Claude API (`claude-sonnet-5`) and
returns a short, grounded answer.

**Why server-side:** the API key never reaches the browser — the route
handler at `app/api/coach/route.ts` is the only place it's used, read from
an environment variable.

**The system prompt** (verbatim, from `app/api/coach/route.ts`):

```
You are the DiabetX Coach, an educational assistant inside a diabetes
self-management app. You are talking to someone who is logging their own
weight, HbA1c, fasting glucose, sleep, exercise, and diet quality.

Rules you must follow:
1. You are NOT a doctor. Never diagnose, never say "you have" a condition,
   and never recommend specific medication changes or dosages.
2. Every claim you make about the user's health MUST reference at least one
   specific number from the DATA block below (e.g. "your fasting glucose of
   118 mg/dL is..."). Do not give generic advice that ignores their numbers.
3. If a score or metric is missing from the data, say so instead of guessing.
4. Keep answers short: 3-5 sentences, plain language, no medical jargon
   without a one-line explanation.
5. End with one concrete, low-risk next step (e.g. a sleep or activity
   suggestion) — never a drug, supplement, or diagnostic claim.
6. If the user's question is about a medical emergency (chest pain, very
   high/low glucose with symptoms, etc.), tell them to seek in-person or
   emergency medical care immediately instead of answering normally.
```

The user's current data (weight, HbA1c, glucose, sleep, exercise, diet
quality, and all four computed scores) is appended to every request as a
`DATA` block, so the model is answering from the same numbers the user sees
on screen — not inventing figures.

## e. Tools, services, and models used

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS, Google Fonts (Inter + Space Grotesk)
- **Charts:** Recharts
- **AI model:** `claude-sonnet-5` via the Anthropic Messages API
- **Hosting:** Vercel
- **Storage:** browser `localStorage` (no external database)
- **Built with the help of:** Claude (Anthropic), used as a coding assistant to scaffold and write this codebase

## f. Screenshots

**[ADD AT LEAST 3 SCREENSHOTS BEFORE SUBMITTING]**

Suggested shots:
1. Empty state / entry form (first load)
2. Dashboard with score ring, sub-scores, and explanation populated
3. Trend chart with 2-3 entries logged
4. Simulation panel showing a before/after comparison
5. AI Coach with a question answered

Drop images in a `/screenshots` folder and reference them here, e.g.:

```markdown
![Dashboard](./screenshots/dashboard.png)
![Simulation](./screenshots/simulation.png)
![AI Coach](./screenshots/coach.png)
```

## g. How to run this project

### Locally

```bash
git clone https://github.com/Rahim36712/diabetx.git
cd diabetx
npm install
cp .env.example .env.local
# edit .env.local and paste your own Anthropic API key
npm run dev
# open http://localhost:3000
```

### Deploy (Vercel)

1. Push this repo to GitHub (public).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. In the project's **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
4. Deploy. Vercel auto-detects Next.js — no build config needed.
5. Copy the deployed URL into section **b** above.

---

*Educational tool only — not medical advice, diagnosis, or treatment.*
