/// <reference types="astro/client" />

import cluster from 'node:cluster';
import os from 'node:os';

import { App } from 'astro/app';

import { extractHostname, serveStaticFile } from '~/server/utils';

import type { SSRManifest } from 'astro';
import type { Server } from 'bun';

import type { CreateExports, Options } from '~/types';

export function createExports(manifest: SSRManifest, options: Options): CreateExports {
  return {
    handle: handler(manifest, options),
    running: (): boolean => _server !== null,
    start: (): void => start(manifest, options),
    stop: (): void => {
      if (!_server) return;
      _server.stop();
      _server = null;
    },
  };
}

let _server: Server<undefined> | null = null;
export function start(manifest: SSRManifest, options: Options): void {
  const { env } = process;

  const hostname = env.HOST ?? extractHostname(options.host);
  const port = env.PORT ? Number.parseInt(env.PORT) : options.port;

  if (cluster.isPrimary && options.cluster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, _code, _signal) => {
      // biome-ignore lint/suspicious/noConsole: Soft error logging
      console.warn(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    const app = new App(manifest);
    const logger = app.getAdapterLogger();

    const tlsCertPath = env.TLS_CERT_PATH ?? options.tls?.certPath ?? null;
    const tlsKeyPath = env.TLS_KEY_PATH ?? options.tls?.keyPath ?? null;

    _server = Bun.serve({
      development: import.meta.env.DEV,
      error: (error): Response =>
        new Response(`<pre>${error}\n${error.stack}</pre>`, {
          headers: { 'Content-Type': 'text/html' },
        }),
      fetch: handler(manifest, options),
      hostname,
      port,
      tls: {
        cert: tlsCertPath ? Bun.file(tlsCertPath) : undefined,
        key: tlsKeyPath ? Bun.file(tlsKeyPath) : undefined,
      },
    });

    function exit(): void {
      if (_server) _server.stop();
      process.exit();
    }

    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
    process.on('exit', exit);

    logger.info(`Server listening on ${_server.url.href}`);
  }
}

function handler(
  manifest: SSRManifest,
  options: Options,
): (req: Request, server: Server<undefined>) => Promise<Response> {
  const clientRoot = options.client ?? new URL('../client/', import.meta.url).href;

  const app = new App(manifest);

  return (req: Request, server: Server<undefined>): Promise<Response> => {
    const routeData = app.match(req);
    if (!routeData) {
      const url = new URL(req.url);

      const manifestAssetExists = manifest.assets.has(url.pathname);

      // If the manifest asset doesn't exist, or the request url ends with a slash
      // we should serve the index.html file from the respective directory.
      if (!manifestAssetExists || req.url.endsWith('/')) {
        const localPath = new URL(
          `./${app.removeBase(url.pathname)}/index.html`,
          clientRoot,
        );
        return serveStaticFile(url.pathname, localPath, clientRoot, options);
      }

      // Otherwise we attempt to serve the static asset from the client directory.
      if (manifestAssetExists) {
        const localPath = new URL(app.removeBase(url.pathname), clientRoot);
        return serveStaticFile(url.pathname, localPath, clientRoot, options);
      }
    }

    return app.render(req, {
      addCookieHeader: true,
      clientAddress: server.requestIP(req)?.address,
      routeData,
    });
  };
}
