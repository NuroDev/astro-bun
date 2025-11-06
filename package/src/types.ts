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

// export type Options = z.infer<typeof OptionsSchema>;

export interface Options {
  /** TODO(@nurodev): Undocumented */
  assets?: z.infer<typeof OptionsSchema>['assets'];
  /** TODO(@nurodev): Undocumented */
  client?: z.infer<typeof OptionsSchema>['client'];
  /**
   * Enable clustering for the server. (Only linux!)
   *
   * @default false
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
  /** TODO(@nurodev): Undocumented */
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
}
