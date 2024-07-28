import type { Options } from '~/types.ts';

/**
 * Extract the hostname from a provided string.
 *
 * @param host - The host string to extract the hostname from.
 *
 * @returns The hostname to pass to `Bun.serve`.
 */
export function extractHostname(host: Options['host']): string | undefined {
  if (typeof host === 'boolean') return host ? '0.0.0.0' : 'localhost';
  return host;
}

/**
 * Serve a static file from the local filesystem.
 *
 * @param pathname - The pathname of the request.
 * @param localPath - The local path to the file.
 * @param options - The Astro options object.
 *
 * @returns A response object.
 */
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
