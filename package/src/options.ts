import { z } from 'zod';

export const OptionsSchema = z
  .object({
    /** TODO(@nurodev): Undocumented */
    assets: z.string(),
    /** TODO(@nurodev): Undocumented */
    client: z.string(),
    /** TODO(@nurodev): Undocumented */
    host: z.union([z.string(), z.boolean()]),
    /** TODO(@nurodev): Undocumented */
    port: z.coerce.number().default(4321),
    /** TODO(@nurodev): Undocumented */
    server: z.string(),
  })
  .partial();

export type Options = z.infer<typeof OptionsSchema>;
