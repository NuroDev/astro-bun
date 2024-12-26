import { z } from 'zod';

export const OptionsSchema = z
  .object({
    assets: z.string(),
    client: z.string(),
    cluster: z.boolean().optional().default(false),
    host: z.union([z.string(), z.boolean()]),
    port: z.coerce.number().default(4321),
    server: z.string(),
    tls: z
      .object({
        certPath: z.string().optional(),
        keyPath: z.string().optional(),
      })
      .optional(),
  })
  .partial();
