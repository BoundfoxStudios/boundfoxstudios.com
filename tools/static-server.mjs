import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

// The prerendered tree is served the way Apache will serve it: a directory resolves to its
// index.html and anything missing is a 404, so a script walking it sees the real URLs.
export const serveStaticDirectory = (directory, port) =>
  new Promise(resolve => {
    const server = createServer(async (request, response) => {
      const path = decodeURIComponent(request.url.split('?')[0]);
      const candidate = join(directory, path.endsWith('/') ? `${path}index.html` : path);

      try {
        const body = await readFile(candidate);

        response.writeHead(200, {
          'content-type': CONTENT_TYPES[extname(candidate)] ?? 'application/octet-stream',
        });
        response.end(body);
      } catch {
        response.writeHead(404).end('not found');
      }
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
