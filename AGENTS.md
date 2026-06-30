\# AGENTS.md



\## Project goal

Build a local-only React + TypeScript app called "D4 Multiplier Edge Calculator".



\## Development rules

\- Use React + TypeScript + Vite.

\- Keep calculation logic separate from UI.

\- Put all core formulas in `src/lib/damageModel.ts`.

\- Put user-facing strings in `src/i18n/en.ts`; do not hardcode UI labels directly in components.

\- Use localStorage for persistence.

\- Support JSON import/export.

\- Add unit tests for the damage model.

\- Do not add a backend.

\- Do not add external state-management libraries unless necessary.



\## Validation

Before finishing, run:

\- npm install, if dependencies are missing

\- npm run build

\- npm test, if test script exists



\## Communication

After implementation, summarize:

\- files changed

\- formulas implemented

\- test results

\- remaining limitations

