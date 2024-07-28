import type { Options } from '~/types.ts';

export function hostOptions(host: Options['host']): string | undefined {
  if (typeof host === 'boolean') return host ? '0.0.0.0' : 'localhost';
  return host;
}

export async function serveStaticFile(
  pathname: string,
  localPath: URL,
  options: Options,
): Promise<Response> {
  const file = Bun.file(localPath);
  const assetsPrefix = `/${options.assets}/`;

  const isImmutableAsset = (pathname: string) => pathname.startsWith(assetsPrefix);
  if (isImmutableAsset(pathname))
    return new Response(file, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  return new Response(file);
}
