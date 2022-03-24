<p>
  <img width="100%" src="https://solid-assets.ch99q.workers.dev/banner?type=core&project=assets" alt="Solid Assets">
</p>

# Solid Assets

This is the home of the new assets api for Solid. This will provide the community and offical repositoryies with banners and logos for all kinds of projects.

## Development

The repository uses `pnpm` as the package manager. To install `pnpm`, run the following command in your terminal.

```bash
npm install -g pnpm
```

Run `pnpm install` to install all the dependencies for the packages.

Read more in [Contributing](CONTRIBUTING.md).

## Deployment

The repository is hosted on Cloudflare Workers. To deploy the repository, run the following command in your terminal.

```bash
pnpm run deploy
```

This will deploy the repository to Cloudflare Workers. For private deployments the url would be `solid-assets.<username>.workers.dev`.
Read more about [Cloudflare Workers](https://developers.cloudflare.com/workers/get-started/guide/#8-publish-your-project)