# Stemly Landing

SvelteKit-based landing site for Stemly, deployed to GitHub Pages with a custom domain.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Build output is written to `build/`.

## Deployment

Deployment is handled by GitHub Actions and published to GitHub Pages.

- Workflow: `.github/workflows/pages.yml`
- Custom domain: `stemly.me` (served via `static/CNAME`)

## Project layout

- `src/routes/` SvelteKit routes (EN/KO pages, disclosure)
- `src/lib/` shared components and copy
- `static/` static assets (CSS, JS, images, admin HTML)

## CI

Basic checks and build on push/PR:

- Workflow: `.github/workflows/ci.yml`
