import type { Server } from 'bun';
import type { z } from 'zod';

import type { OptionsSchema } from '~/validators';

export enum CreateExportsEnum {
  HANDLE = 'handle',
  RUNNING = 'running',
  START = 'start',
  STOP = 'stop',
}

export type CreateExports = {
  [CreateExportsEnum.HANDLE]: (req: Request, server: Server) => Promise<Response>;
  [CreateExportsEnum.RUNNING]: () => boolean;
  [CreateExportsEnum.START]: () => void;
  [CreateExportsEnum.STOP]: () => void;
};

export type Options = z.infer<typeof OptionsSchema>;
