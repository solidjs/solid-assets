<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=assets" alt="Solid Assets">
</p>

# Solid Assets

Access official community assets for SolidJS through our simple asserts API; This provides the community with dynamic and static resources to get started with libraries and projects related to the SolidJS community.

## Usage

To get a banner for a project, use the following url:

```https://assets.solidjs.com/banner?project=<project-name>```

If you want another type of background, you can choose between `tiles` and `blocks`.

```https://assets.solidjs.com/banner?project=<project-name>&background=[tiles|blocks]```

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
