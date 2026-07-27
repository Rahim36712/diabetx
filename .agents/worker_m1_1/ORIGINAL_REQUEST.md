## 2026-07-27T16:42:46Z
<USER_REQUEST>
You are Worker 1 for Milestone 1 (M1: Build & Lint Cleanup).
Working directory: d:\diabetx\.agents\worker_m1_1
Project root: d:\diabetx

Your task:
1. Fix package.json: move @types/three to devDependencies, add eslint (^8 or ^9) and eslint-config-next (^14 or ^15/16) to devDependencies.
2. Add a standard .eslintrc.json file extending "next/core-web-vitals" if missing, so that running `npm run lint` passes cleanly with 0 errors.
3. Update .env.example to specify `GEMINI_API_KEY=your_gemini_api_key_here` (instead of ANTHROPIC_API_KEY).
4. Update .gitignore to include security patterns: `.env*`, `.venv`, `*.pem`, `*.key`, `*.env`.
5. Run build and type safety verification commands using `run_command` in `d:\diabetx`:
   - `npx tsc --noEmit`
   - `npm run lint` (or `npx next lint`)
   - `npx next build`
6. Confirm all commands succeed with exit code 0.
7. Document your work in d:\diabetx\.agents\worker_m1_1\changes.md and write a handoff report in d:\diabetx\.agents\worker_m1_1\handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
