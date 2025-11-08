/// <reference types="astro/client" />
import path, { relative } from 'node:path';
import url from 'node:url';
import { readdir } from 'node:fs/promises';
import cluster from 'node:cluster';
import os from 'node:os';
import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import type { Server } from 'bun';
import { extractHostname, serveStaticFile } from '~/server/utils';

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
  const port = env.PORT ? Number.parseInt(env.PORT, 10) : options.port;
  const unix = env.UNIX ?? options.unix;

  if (cluster.isPrimary && options.cluster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, _code, _signal) => {
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
      tls: {
        cert: tlsCertPath ? Bun.file(tlsCertPath) : undefined,
        key: tlsKeyPath ? Bun.file(tlsKeyPath) : undefined,
      },
      ...(unix ? { unix } : { hostname, port }),
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

  // The dist may be copied somewhere after building.
  // The build environment's full client path (options.client) can't be relied on in production.
  // `resolveClientDir()` finds the full path to the client directory in the current environment.
  const clientDir = resolveClientDir(options);

  const clientAssetsPromise = getStaticAssets(clientDir);
  let clientAssets: Awaited<typeof clientAssetsPromise> | undefined;

  return async (req: Request, server: Server<undefined>): Promise<Response> => {
    const routeData = app.match(req);
    if (!routeData) {
      const url = new URL(req.url);
      const staticAssetExists = (clientAssets ??= await clientAssetsPromise).has(
        url.pathname,
      );

      // If the manifest asset doesn't exist, or the request url ends with a slash
      // we should serve the index.html file from the respective directory.
      if (!staticAssetExists || req.url.endsWith('/')) {
        const localPath = new URL(
          `./${app.removeBase(url.pathname)}/index.html`,
          clientRoot,
        );
        return serveStaticFile(url.pathname, localPath, clientRoot, options);
      }

      // Otherwise we attempt to serve the static asset from the client directory.
      if (staticAssetExists) {
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

async function getStaticAssets(clientDir: string) {
  const dirEntries = await readdir(clientDir, { withFileTypes: true, recursive: true });
  const publicPath = new Set<string>();
  for (const entry of dirEntries) {
    if (entry.isFile() == false) continue;
    publicPath.add(
      prependForwardSlash(path.relative(clientDir, entry.parentPath) + '/' + entry.name),
    );
  }
  return publicPath;
}

/**
 * From https://github.com/withastro/adapters/blob/@astrojs/node@9.0.0/packages/node/src/serve-static.ts#L109-L125
 *
 * Copyright of withastro/adapters contributors, Reproduced under MIT License
 */
// @ts-expect-error client and server fields are always present
function resolveClientDir(options: InternalOptions) {
  const clientURLRaw = new URL(options.client);
  const serverURLRaw = new URL(options.server);
  const rel = path.relative(
    url.fileURLToPath(serverURLRaw),
    url.fileURLToPath(clientURLRaw),
  );

  // walk up the parent folders until you find the one that is the root of the server entry folder. This is how we find the client folder relatively.
  const serverFolder = path.basename(options.server);
  let serverEntryFolderURL = path.dirname(import.meta.url);
  while (!serverEntryFolderURL.endsWith(serverFolder)) {
    serverEntryFolderURL = path.dirname(serverEntryFolderURL);
  }

  const serverEntryURL = serverEntryFolderURL + '/entry.mjs';
  const clientURL = new URL(appendForwardSlash(rel), serverEntryURL);
  const client = url.fileURLToPath(clientURL);
  return client;
}

function prependForwardSlash(pth: string) {
  return pth.startsWith('/') ? pth : '/' + pth;
}

function appendForwardSlash(pth: string) {
  return pth.endsWith('/') ? pth : pth + '/';
}
