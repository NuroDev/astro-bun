# `astro-bun`

This adapter allows Astro to deploy your SSR site to Bun targets.

## Features

All functionality offered in [`astro-bun-adapter`](https://github.com/ido-pluto/astro-bun-adapter) is also available in this project, along with some additional features:

 - **Hybrid Output Support**: You can now use `"output": "hybrid"` in your `astro.config.mjs` to output both static and server-rendered pages.
 - **Improved server URL logging**: The URL printed to the console when the server is started now shows the full URL rather than just the port.
 - **Process exit & shutdown handlers**: Added support for `process.on` handlers for when the server exists, or intercepts `SIGINT` and `SIGTERM` signals.

## Usage

### Installation

1. Install the required dependencies

```bash
bun add @nurodev/astro-bun
```

2. Add the integration to your astro config

```diff
+import bun from "@nurodev/astro-bun";

export default defineConfig({
+ 	adapter: bun(),
+ 	output: "hybrid",
});
```

3. Update your `package.json` `start` script

```diff
{
	"scripts": {
-		"start": "astro dev"
+		"start": "bun run ./dist/server/entry.mjs"
	}
}
```

## Contributing

This package is structured as a monorepo:

- `playground` contains code for testing the package
- `package` contains the actual package

Install dependencies using pnpm: 

```bash
bun i --frozen-lockfile
```

Start the playground and package watcher:

```bash
bun dev
```

You can now edit files in `package`. Please note that making changes to those files may require restarting the playground dev server.

## Licensing

[MIT Licensed](https://github.com/nurodev/astro-bun/blob/main/LICENSE). Made with ❤️ by [Ben Dixon](https://github.com/nurodev).

## Credits

 - [@ido-pluto](https://github.com/ido-pluto), and subsequently @andremralves: This project is massively based on [`astro-bun-adapter`](https://github.com/ido-pluto/astro-bun-adapter) on but with some improvements added.
 - [@florian-lefebvre](https://github.com/florian-lefebvre/): The structure & a lot of copy text is based on their `astro-integration-template` project template.
