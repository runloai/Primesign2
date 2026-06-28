# PrimeSign Netlify Deployment

This repo is set up for a GitHub-connected Netlify deployment.

## Build Settings

- Build command: `./node_modules/.bin/vite build && cp -f public/config.json dist/config.json && cp -f public/admin.html dist/admin.html`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Netlify detects `pnpm-lock.yaml`, installs with pnpm, then runs the build command above directly from the shell. That avoids pnpm re-entry issues during the build itself. The build copies the public admin/config files into `dist`, and Vite copies the rest of `public/` automatically.

## Required Environment Variables

Set these in Netlify site settings:

- `GITHUB_TOKEN`: fine-scoped GitHub token with contents read/write access to this repo.
- `GITHUB_OWNER`: `runloai`
- `GITHUB_REPO`: `primesign2`
- `GITHUB_BRANCH`: usually `main`.
- `ADMIN_PUBLISH_TOKEN`: a separate random secret used by the admin panel publish button.

Do not reuse the GitHub token as the admin publish token. The admin panel asks for `ADMIN_PUBLISH_TOKEN` when publishing on Netlify and stores it only in browser session storage.

## Editing Flow

1. Open `/admin.html`.
2. Edit services, categories, images, hero, portfolio, or content.
3. Save from the admin panel.
4. On Netlify, enter the publish token when prompted.
5. The Netlify function commits the updated `public/config.json` back to GitHub.
6. Netlify redeploys from GitHub, so public site, navbar, Arsenal categories, and image galleries stay in sync.

## Important Config Rule

`public/config.json` uses services as the source of truth for what appears under each category. `serviceCategories` should only contain category metadata: `id`, `label`, `icon`, and `description`. Do not put nested service `items` inside categories.
