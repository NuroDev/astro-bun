import type { Server } from 'bun';
import type { z } from 'zod';

import type { OptionsSchema } from '~/validators';

export const CreateExports = {
  HANDLE: 'handle',
  RUNNING: 'running',
  START: 'start',
  STOP: 'stop',
} as const;

export type CreateExports = {
  [CreateExports.HANDLE]: (req: Request, server: Server<undefined>) => Promise<Response>;
  [CreateExports.RUNNING]: () => boolean;
  [CreateExports.START]: () => void;
  [CreateExports.STOP]: () => void;
};

export interface Options {
  /**
   * Name of the publicly exposed directory where all
   * static assets are put.
   *
   * @default "_astro"
   */
  assets?: z.infer<typeof OptionsSchema>['assets'];

  /**
   * The full file URL to where astro is configured to put
   * the client bundle and assets such as images, fonts,
   * stylesheets, and static html.
   *
   * @default "<project root>/dist/client/"
   */
  client?: z.infer<typeof OptionsSchema>['client'];

  /**
   * Create a cluster of bun servers listening on the same port,
   * and automatically load-balance incoming requests across them.
   *
   * @default false
   *
   * @example
   * ```ts
   * export default defineConfig({
   *  adapter: bun({ cluster: true }),
   * });
   * ```
   */
  cluster?: z.infer<typeof OptionsSchema>['cluster'];

  /**
   * The hostname to serve the application on.
   */
  host?: z.infer<typeof OptionsSchema>['host'];

  /**
   * The port to serve the application on.
   *
   * @default 4321
   */
  port?: z.infer<typeof OptionsSchema>['port'];

  /**
   * The full file URL to where astro is configured to put
   * the server bundle.
   *
   * @default "<project root>/dist/server/"
   */
  server?: z.infer<typeof OptionsSchema>['server'];

  tls?: {
    /**
     * A file-system path to the certificate file.
     *
     * This file should contain the contents of your private key.
     */
    certPath?: string;
    /**
     * A file-system path to the key file.
     *
     * This file should contain the contents of your issued certificate.
     */
    keyPath?: string;
  };

  /**
   * The path to the unix socket on which to host the server.
   *
   * This can provide better performance when Bun is running alongside
   * a local reverse proxy that supports unix sockets.
   *
   * When a unix socket is provided, Bun does not bind to a TCP port,
   * and the options and environment variables for the hostname and port
   * are ignored.
   *
   * @example
   * ```ts
   * export default defineConfig({
   *  adapter: bun({ unix: "/tmp/my-socket.sock" })
   * });
   * ```
   */
  unix?: z.infer<typeof OptionsSchema>['unix'];
}
