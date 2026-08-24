<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=assets" alt="Solid Assets">
</p>

# Solid Assets

Access official community assets for SolidJS through our simple asserts API; This provides the community with dynamic and static resources to get started with libraries and projects related to the SolidJS community.

## Usage

To get a banner for a project, use the following url:

```https://assets.solidjs.com/banner?project=<project-name>```

The banner accepts the following query parameters, all optional:

| Parameter     | Values                                | Default             | Description                                                                    |
| ------------- | -------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `project`     | any text                               | `example-package`    | The name shown in the tag in the bottom-right corner.                            |
| `type`        | `Core`, or any free text               | `Community`          | `Core` shows the plain SolidJS wordmark with no caption. Any other value (e.g. `Ecosystem`) is shown as a caption under the wordmark. |
| `background`  | `blocks`, `tiles`                      | `blocks`              | The background pattern.                                                          |
| `color`       | a hex color, e.g. `F97316`             | none (SolidJS blue)  | Retints the banner to match your project's own branding.                        |
| `integration` | a URL to an `image/svg+xml` logo       | none                  | Shows the given logo next to the SolidJS logo, for projects that integrate with another service. |

### Background

Choose between `tiles` and `blocks`:

```https://assets.solidjs.com/banner?project=<project-name>&background=[tiles|blocks]```

### Type

```https://assets.solidjs.com/banner?project=<project-name>&type=[Core|Community|Ecosystem|...]```

<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=solid-start&type=Core" alt="Core banner, no caption">
</p>

`Core` drops the caption entirely and shows just the SolidJS wordmark — anything else is rendered as free-text underneath it (`Community`, `Ecosystem`, or your own label).

### Color

Retint the banner to match your project's own branding by passing a hex color (with or without the leading `#`):

```https://assets.solidjs.com/banner?project=<project-name>&color=<hex-color>```

<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=solid-select&type=Ecosystem&background=tiles&color=F97316" alt="Banner tinted orange for solid-select">
</p>

The background, box, and SolidJS logo retint together; the caption and project tag text stay white regardless of color.

### Integrations

Show another project's logo alongside the SolidJS logo — useful for libraries that integrate with a specific service or platform:

```https://assets.solidjs.com/banner?project=<project-name>&integration=<url-encoded SVG URL>```

<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=github&background=tiles&integration=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fsimple-icons%4011%2Ficons%2Fgithub.svg" alt="SolidJS x GitHub banner">
</p>

A few things to know:

- The URL must use `https` and point directly to an `image/svg+xml` response under 100KB, or it's silently ignored and the banner renders without it.
- The integration logo is recolored to solid white to match the rest of the banner, regardless of its original colors.
- When an integration logo is shown, the `type` caption and the project name tag are both hidden so the logo lockup has room to stay centered.
- It also works together with `color`:

  ```https://assets.solidjs.com/banner?project=<project-name>&color=<hex-color>&integration=<url-encoded SVG URL>```

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
