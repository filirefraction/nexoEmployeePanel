import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';

const rootDir = resolve(process.cwd(), 'dist', 'nexoEmployeePanel', 'browser');
const port = Number.parseInt(process.env.PORT ?? '4301', 10);

if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) {
  console.error(
    'No se encontro la build PWA en dist/nexoEmployeePanel/browser. Ejecuta primero `npm run build`.'
  );
  process.exit(1);
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function resolveFilePath(urlPath) {
  const cleanPath = (urlPath ?? '/').split('?')[0].split('#')[0];
  const requestedPath = cleanPath === '/' ? '/index.html' : cleanPath;
  const normalizedPath = normalize(requestedPath).replace(/^(\.\.[\\/])+/, '');
  const fullPath = join(rootDir, normalizedPath);

  if (existsSync(fullPath) && statSync(fullPath).isFile()) {
    return fullPath;
  }

  return join(rootDir, 'index.html');
}

const server = createServer((request, response) => {
  const filePath = resolveFilePath(request.url);
  const extension = extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] ?? 'application/octet-stream';

  response.setHeader('Content-Type', contentType);
  response.setHeader('Cache-Control', 'no-store');

  createReadStream(filePath)
    .on('error', () => {
      response.statusCode = 500;
      response.end('No fue posible servir la build PWA.');
    })
    .pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Nexo Employee PWA disponible en http://127.0.0.1:${port}`);
  console.log('Usa esta URL para validar instalacion, service worker y modo standalone.');
});
