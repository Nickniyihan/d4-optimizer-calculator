# Release / GitHub Pages Deployment

## Local Check

```bash
pnpm install
pnpm test
pnpm build
pnpm preview
```

## GitHub Pages Setup

This repo deploys by pushing built files to the `gh-pages` branch.

In GitHub:

1. Go to Repo -> Settings -> Pages.
2. Under Build and deployment, choose:
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: /root
3. Push to `main`.
4. The workflow builds the app and force-pushes `dist/` to `gh-pages`.
5. Open the Pages URL:
   `https://<username>.github.io/<repo-name>/`

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

For `Nickniyihan/d4-optimizer-calculator`, the workflow sets:

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
