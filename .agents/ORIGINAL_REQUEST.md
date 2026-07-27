# Original User Request

## 2026-07-27T16:08:52Z

<USER_REQUEST>
Fix UI layout bugs, eliminate overlapping header logos/titles, and ensure all toolbar navigation buttons (Dashboard, Digital Twin 3D, Timeline, Simulator, AI Coach) switch flawlessly to dedicated views using `stitch_diabetx_ai_digital_twin` design system and Stitch MCP generated screens.

Working directory: d:\diabetx
Integrity mode: development

## Requirements

### R1. Fix Duplicate & Overlapping Header Elements
Remove overlapping brand logos and header titles on desktop and mobile (`SideNavBar`, `TopNavBar`, `app/page.tsx`). Ensure a single, ultra-clean header and side navigation layout.

### R2. 100% Functional Hero Toolbar & Side Navigation
Ensure every tab button in the toolbar and sidebar (**Dashboard**, **Digital Twin 3D**, **Timeline**, **Simulator**, **AI Coach**) is fully interactive and switches the main content area to its dedicated view cleanly.

### R3. Dedicated Tab Screens & Stitch MCP UI Integration
Incorporate full-fledged dedicated view screens for each tab using design tokens from `stitch_diabetx_ai_digital_twin` and generate any missing screens via Stitch MCP (`generate_screen_from_text` or `get_screen`).

### R4. Complete Build & Type Safety Verification
Ensure `npx next build` compiles 100% cleanly with 0 TypeScript or linting errors, and verify local development server readiness.

## Acceptance Criteria

### UI Layout & Overlap Fixes
- [ ] No duplicate or overlapping brand titles/logos in header or sidebar on desktop and mobile.
- [ ] Layout grid and side navigation align cleanly with consistent padding.

### Navigation & Screen Switching
- [ ] Clicking **Dashboard** displays the main summary cards, score gauge, and daily entry log.
- [ ] Clicking **Digital Twin (3D)** displays the full interactive 3D human silhouette model canvas with biometric overlays.
- [ ] Clicking **Timeline** displays full-width historical trends and analytics.
- [ ] Clicking **Simulator** displays the what-if parameter sliders and live score delta projections.
- [ ] Clicking **AI Coach** displays the dedicated full-screen AI chat interface with real-time biometric grounding.

### Build Verification
- [ ] `npx next build` completes cleanly with 0 errors.

## 2026-07-27T21:36:58+05:00

<USER_REQUEST>
Prepare DiabetX AI for final grading and public release: push complete codebase to public GitHub repository `https://github.com/Rahim36712/diabetx`, deploy live on Vercel, and author an exemplary `README.md` project report containing problem statement, live URL, feature breakdown, AI prompt architecture, tech stack, screenshots, and local setup guide.

Working directory: d:\diabetx
Integrity mode: development

## Requirements

### R1. Complete Public GitHub Repository Push
Initialize git repository in `d:\diabetx`, set remote to `https://github.com/Rahim36712/diabetx.git`, ensure `.gitignore` excludes `.env.local` and `node_modules`, commit all code, and push to main branch.

### R2. Comprehensive README.md Project Report
Author a complete, high-impact `README.md` covering:
- **App Name & Problem Statement**: DiabetX AI — Cyber-Physiological Digital Twin for Type-2 Diabetes and Pre-Diabetes self-management.
- **Live Deployed URL**: Clickable public link.
- **Features List**: Interactive 3D Human Model, 0–100 Health Score, What-If Simulator, AI Coach, Trend Analytics, Private Local Storage.
- **AI Feature Architecture**: Full system prompt, context-grounding engine, Gemini 3.1 Flash Lite API fallback chain.
- **Tech Stack & AI Tools**: Next.js 16, React 19, TypeScript, TailwindCSS, Three.js, Recharts, Google Gemini API, Google Stitch MCP.
- **Screenshots**: High-resolution screenshots of Dashboard, 3D Twin, Simulator, and AI Coach.
- **Local Setup**: Step-by-step local installation and environment variables guide.

### R3. Live Deployment
Deploy the application live on Vercel or public hosting with environment variables configured (`GEMINI_API_KEY`), ensuring 0-downtime availability for graders.

### R4. Complete Build & Type Safety Verification
Ensure `npx next build` compiles 100% cleanly with 0 TypeScript or linting errors prior to deployment.

## Acceptance Criteria

### Repository & Security
- [ ] Public GitHub repository `https://github.com/Rahim36712/diabetx` contains all latest source code.
- [ ] No API keys or secrets committed to repository (verified in `.gitignore`).

### README Quality
- [ ] README.md contains all required sections (a-g) formatted in clean GitHub markdown.
- [ ] Live URL and GitHub repo link are clickable and functional.

### Live Deployment
- [ ] App is deployed and accessible at live public URL.
- [ ] AI Health Coach and 3D Digital Twin operate seamlessly on live deployment.
</USER_REQUEST>

