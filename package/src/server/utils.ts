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
  clientRoot: string,
  options: Options,
): Promise<Response> {
  const file = Bun.file(localPath);
  const assetsPrefix = `/${options.assets}/`;

  // If the file trying to be served does not exist,
  // try to serve a 404.html file if it exists. Otherwise
  // just return a default 404 response.
  const fileExists = await file.exists();
  if (!fileExists) {
    const _404Path = new URL('./404.html', clientRoot);
    const _404File = Bun.file(_404Path);
    const _404FileExists = await _404File.exists();

    const body = _404FileExists ? _404File : 'Not found';

    return new Response(body, {
      status: 404,
      statusText: 'Not Found',
    });
  }

  const isImmutableAsset = (pathname: string) => pathname.startsWith(assetsPrefix);
  if (isImmutableAsset(pathname))
    return new Response(file, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  return new Response(file);
}
