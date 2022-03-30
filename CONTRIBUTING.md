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
