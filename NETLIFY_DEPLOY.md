# PrimeSign Netlify Deployment

This repo is set up for a GitHub-connected Netlify deployment.

## Build Settings

- Build command: `./node_modules/.bin/vite build && cp -f public/config.json dist/config.json && cp -f public/admin.html dist/admin.html`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Netlify detects `pnpm-lock.yaml`, installs with pnpm, then runs the build command above directly from the shell. That avoids pnpm re-entry issues during the build itself. The build copies the public admin/config files into `dist`, and Vite copies the rest of `public/` automatically.

## Required Environment Variables

Set these in Netlify site settings:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key. Keep this only in Netlify environment variables.
- `ADMIN_PUBLISH_TOKEN`: a separate random secret used by the admin panel publish button.
- `SUPABASE_CONFIG_TABLE`: optional, defaults to `site_config`.
- `SITE_CONFIG_KEY`: optional, defaults to `primary`.

Do not put GitHub or Supabase secrets in `netlify.toml`, browser code, or `public/config.json`. The admin panel asks for `ADMIN_PUBLISH_TOKEN` when publishing on Netlify and stores it only in browser session storage.

GitHub publishing is still supported only as a fallback if `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH` are configured, but the preferred production path is Supabase so normal content edits do not need commits or deploys.

## Supabase Setup

Create this table in the Supabase SQL editor:

```sql
create table if not exists public.site_config (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz not null default now()
);
```

No public row-level policy is required for the admin workflow because Netlify functions access the table with the server-side service-role key. The browser never receives that key.

## Editing Flow

1. Open `/admin.html`.
2. Edit services, categories, images, hero, portfolio, or content.
3. Save from the admin panel.
4. On Netlify, enter the publish token when prompted.
5. The Netlify function writes the updated config to Supabase.
6. The public site reads the same published config through `/api/config`, with `/config.json` as a static fallback.

## Important Config Rule

`serviceCategories` is the source of truth for category identity, label, icon, description, and order. Services attach to categories through `categoryId`. Do not put nested service `items` inside categories.
