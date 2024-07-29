import { defineIntegration } from 'astro-integration-kit';
import { AstroError } from 'astro/errors';

import { name as packageName } from '~/package.json';
import { OptionsSchema } from '~/validators';

import type { AstroAdapter } from 'astro';

import type { Options } from '~/types.ts';
import type { CreateExportsEnum } from '~/types.ts';

export function getAdapter(args: Options = {}): AstroAdapter {
  return {
    args,
    exports: ['handle', 'running', 'start', 'stop'] satisfies Array<CreateExportsEnum>,
    name: packageName,
    serverEntrypoint: `${packageName}/server.js`,
    supportedAstroFeatures: {
      assets: {
        supportKind: 'stable',
        isSharpCompatible: true,
        isSquooshCompatible: true,
      },
      envGetSecret: 'experimental',
      hybridOutput: 'stable',
      serverOutput: 'stable',
      staticOutput: 'unsupported',
    },
  };
}

export default defineIntegration({
  name: packageName,
  optionsSchema: OptionsSchema.optional(),
  setup: (integration) => ({
    hooks: {
      'astro:config:done': (params) => {
        params.setAdapter(
          getAdapter({
            ...integration.options,
            assets: params.config.build.assets,
            client: params.config.build.client?.toString(),
            host: params.config.server.host,
            port: params.config.server.port,
            server: params.config.build.server?.toString(),
          }),
        );

        if (params.config.output === 'static')
          throw new AstroError(
            `Only \`output: "server"\` or \`output: "hybrid"\` is supported by this adapter.`,
          );
      },
    },
  }),
});
