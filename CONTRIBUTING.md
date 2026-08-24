# Contributing
1. Clone the repository
    `git clone https://github.com/solidjs/solid-assets.git`
2. Install dependencies
    `pnpm install`
3. Run the vite and miniflare server local.
    `pnpm run dev`

## Requirements
1. Node.js: ^16.7

## Add A Background

To add a background open one of the existing SVGs, there you will find that backgrounds need to have the wrapper as:

```tsx
<svg x="0" y="0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 100">
```

You have to use a SVG of 500 x 100 for it to work and set x and y to 0. Add the background asset to the SVG and apply it.

## Updating Example Images

Successful banner responses are cached at Cloudflare's edge for 31 days (`s-maxage` in `src/worker.ts`), keyed by the full request URL. That cache is independent of the deployed code — redeploying does **not** invalidate it, so a URL that was already requested before your deploy keeps serving its old, pre-deploy render until the cache entry expires or is purged.

The example images in `README.md` and `PREVIEW.md` carry a `&v=<date>` (or `?v=<date>` where there's no other query string) parameter for exactly this reason: it makes each documented example a fresh, never-before-requested URL, so it can't be served from a stale cache entry left over from before your change. If you deploy a change that alters the visual output of an already-documented example, bump that example's `v` value (e.g. to today's date) so the doc picks up a fresh render instead of risking a stale cached one. GitHub's own image proxy (`camo.githubusercontent.com`) caches independently too, so changing the URL is also the most reliable way to force it to refetch.
