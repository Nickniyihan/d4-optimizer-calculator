# Release / GitHub Pages Deployment

## Local Check

```bash
pnpm install
pnpm test
pnpm build
pnpm preview
```

## GitHub Pages Setup

1. Push the repo to GitHub.
2. Go to Repo -> Settings -> Pages.
3. Under Build and deployment, set Source to GitHub Actions.
4. Push to `main`.
5. Wait for the Deploy to GitHub Pages workflow to finish.
6. Open the Pages URL.

## Vite Base Path

For a GitHub Pages project site:

```text
https://<username>.github.io/<repo-name>/
```

the Vite base path should be:

```text
/<repo-name>/
```

This repo uses `VITE_BASE_PATH` in the GitHub Actions workflow.

For `nickniyihan-DNEG/d4-optimizer-calculator`, the workflow sets:

```text
/d4-optimizer-calculator/
```

## Sharing Calculator Setups

The app stores data in each user's browser localStorage.

To share a setup:

1. Export JSON from the app.
2. Send the JSON file to someone else.
3. They open the GitHub Pages app and import JSON.

## Notes

Do not open `dist/index.html` directly with `file://`. Use `pnpm preview`
locally or GitHub Pages online.
