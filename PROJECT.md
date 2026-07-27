# Project: DiabetX UI & Navigation Refactoring

## Architecture
Next.js web application with Tailwind CSS, TypeScript, and Stitch MCP design system tokens (`stitch_diabetx_ai_digital_twin`).
Components include top navigation (`TopNavBar`), sidebar (`SideNavBar`), main page (`app/page.tsx`), and tab-specific views (Dashboard, Digital Twin 3D, Timeline, Simulator, AI Coach).

## Code Layout
- `app/page.tsx`: Main page layout and view switcher orchestrator.
- `components/SideNavBar.tsx`: Sidebar navigation menu.
- `components/TopNavBar.tsx`: Top header navigation bar.
- `components/views/`: Dedicated view components for Dashboard, Digital Twin 3D, Timeline, Simulator, AI Coach.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Fix Duplicate & Overlapping Header Elements | Audit and fix header/sidebar logo & title overlap across desktop and mobile in SideNavBar, TopNavBar, app/page.tsx | None | DONE |
| 2 | 100% Functional Hero Toolbar & Side Navigation | Wire tab switching logic state for Dashboard, Digital Twin 3D, Timeline, Simulator, AI Coach across toolbar and sidebar | M1 | DONE |
| 3 | Dedicated Tab Screens & Stitch MCP UI Integration | Create/integrate full-fledged dedicated view screens for all 5 tabs adhering to design tokens from stitch_diabetx_ai_digital_twin and Stitch MCP | M2 | DONE |
| 4 | Complete Build & Type Safety Verification | Run full `npx next build` verification, ensuring 0 TypeScript / linting errors and 100% build pass | M3 | DONE |

## Interface Contracts
### View Switching State
- Active Tab State: `'dashboard' | 'digital_twin' | 'timeline' | 'simulator' | 'ai_coach'`
- Sidebar & Hero Toolbar dispatch active tab changes cleanly to `app/page.tsx` state container.
