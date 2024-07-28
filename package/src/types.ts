import type { z } from 'zod';

import type { OptionsSchema } from '~/validators';

export type CreateExportsEnum = 'handle' | 'running' | 'start' | 'stop';

export type Options = z.infer<typeof OptionsSchema>;
