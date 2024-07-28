/// <reference types="astro/client" />

import { App } from 'astro/app';

import { extractHostname, serveStaticFile } from '~/server/utils.ts';

import type { SSRManifest } from 'astro';
import type { Server } from 'bun';

import type { CreateExportsEnum, Options } from '~/types.ts';

export function createExports(
  manifest: SSRManifest,
  options: Options,
): Record<CreateExportsEnum, unknown> {
  return {
    handle: handler(manifest, options),
    running: () => _server !== null,
    start: () => start(manifest, options),
    stop() {
      if (!_server) return;
      _server.stop();
      _server = null;
    },
  };
}

let _server: Server | null = null;
export function start(manifest: SSRManifest, options: Options) {
  const app = new App(manifest);
  const logger = app.getAdapterLogger();

  const hostname = process.env.HOST ?? extractHostname(options.host);
  const port = process.env.PORT ? Number.parseInt(process.env.PORT) : options.port;

  _server = Bun.serve({
    development: import.meta.env.DEV,
    error: (error) =>
      new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: { 'Content-Type': 'text/html' },
      }),
    fetch: handler(manifest, options),
    hostname,
    port,
  });

  function exit() {
    if (_server) _server.stop();
    process.exit();
  }

  process.on('SIGINT', exit);
  process.on('SIGTERM', exit);
  process.on('exit', exit);

  logger.info(`Server listening on ${_server.url.href}`);
}

function handler(
  manifest: SSRManifest,
  options: Options,
): (req: Request, server: Server) => Promise<Response> {
  const clientRoot = options.client ?? new URL('../client/', import.meta.url).href;

  const app = new App(manifest);

  return (req: Request) => {
    if (!app.match(req)) {
      const url = new URL(req.url);

      const manifestAssetExists = manifest.assets.has(url.pathname);

      // If the manifest asset doesn't exist, or the request url ends with a slash
      // we should serve the index.html file from the respective directory.
      if (!manifestAssetExists || req.url.endsWith('/')) {
        const localPath = new URL(
          `./${app.removeBase(url.pathname)}/index.html`,
          clientRoot,
        );
        return serveStaticFile(url.pathname, localPath, options);
      }

      // Otherwise we attempt to serve the static asset from the client directory.
      if (manifestAssetExists) {
        const localPath = new URL(app.removeBase(url.pathname), clientRoot);
        return serveStaticFile(url.pathname, localPath, options);
      }
    }

    return app.render(req);
  };
}
