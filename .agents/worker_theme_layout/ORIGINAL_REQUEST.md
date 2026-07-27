## 2026-07-27T13:05:52Z

You are Worker 1 (Theme & Layout Specialist) for DiabetX UI Redesign.
Your working directory is `d:\diabetx\.agents\worker_theme_layout`. Please create this folder if needed.

Task Overview:
Update `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, and `app/page.tsx`, and create navigation & WebGL components to establish the Google Stitch `diabetx_balanced_aligned_dashboard` theme layout infrastructure in `d:\diabetx`.

Detailed Instructions:
1. **Tailwind & CSS Setup**:
   - Update `tailwind.config.ts` to include Stitch design system color tokens (`surface-container-lowest: "#0A0E1A"`, `surface-container-low`, `cyan: "#22D3EE"`, `violet: "#8B5CF6"`), font families (`Comfortaa`, `Space Grotesk`, `Inter`), spacing tokens (`gutter`, `xl`, `xxl`), and keyframe animations (`breathe-pulse`, `fade-in-up`, `slide-in-left`).
   - Update `app/globals.css` with WebGL noise canvas styles (`#shader-background`), backdrop blur glass card utilities (`.glass-card`), slider thumb styling, and ambient radial glow helpers.
   - Install `three` and `@types/three` using `npm install three @types/three` if needed for 3D canvas rendering.
2. **Navigation & WebGL Components**:
   - Create `components/SideNavBar.tsx`: Fixed vertical desktop sidebar (`w-64 fixed left-0 top-0 h-screen`), logo, nav links (Dashboard, Digital Twin, Timeline, Simulator, AI Coach), glassmorphic design.
   - Create `components/TopNavBar.tsx`: Mobile header (`md:hidden fixed top-0 w-full z-50`).
   - Create `components/BottomNavBar.tsx`: Mobile bottom navigation bar (`md:hidden fixed bottom-0 w-full z-50`).
   - Create `components/Footer.tsx`: Desktop offset footer (`md:ml-64`).
   - Create `components/ShaderBackground.tsx`: Fixed viewport WebGL noise background canvas (`#shader-background`).
   - Create `components/ThreeDigitalTwinCanvas.tsx`: Interactive Three.js 3D body canvas rendering translucent digital twin silhouette, mouse tilt/rotation, and ambient lighting.
3. **App Layout Assembly**:
   - Update `app/layout.tsx` to include `Comfortaa`, `Space Grotesk`, `Inter` font links/classes, `ShaderBackground`, `SideNavBar`, `TopNavBar`, `BottomNavBar`, and `Footer`.
   - Update `app/page.tsx` main content container with `md:ml-64` margin offset, fluid 12-column grid layout, and top Hero section (Score Ring + 3D Twin canvas).
4. **Verification**:
   - Run `npx next build` to verify clean build without TypeScript or CSS errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output requirements:
- Create `d:\diabetx\.agents\worker_theme_layout\progress.md` with liveness timestamp.
- Write your detailed implementation report to `d:\diabetx\.agents\worker_theme_layout\handoff.md`.
- Communicate completion to parent via send_message with build/test results.
