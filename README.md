# astro-bun

This adapter allows Astro to deploy your SSR site to Bun targets.

To see how to get started, check out the [package README](./package/README.md)

## Features

While based on [`astro-bun-adapter`](https://github.com/ido-pluto/astro-bun-adapter), there is a handful of features that this project offers to improve on:

 - **Hybrid Output Support**: You can now use `"output": "hybrid"` in your `astro.config.mjs` to output both static and server-rendered pages.
 - **Improved server URL logging**: The URL printed to the console when the server is started now shows the full URL rather than just the port.
 - **Process exit & shutdown handlers**: Added support for `process.on` handlers for when the server exists, or intercepts `SIGINT` and `SIGTERM` signals.

## Licensing

[MIT Licensed](./LICENSE). Made with ❤️ by [Florian Lefebvre](https://github.com/florian-lefebvre).

## Credits

Huge credit to [@ido-pluto](https://github.com/ido-pluto), and subsequently @andremralves, for their work on [`astro-bun-adapter`](https://github.com/ido-pluto/astro-bun-adapter) which a large portion of this project is based on but with some improvements included.
