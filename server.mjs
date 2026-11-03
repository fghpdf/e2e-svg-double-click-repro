import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./repro.html', import.meta.url));
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path !== '/' && path !== '/repro.html') {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
});
server.listen(4287, '127.0.0.1', () => console.log('Repro: http://127.0.0.1:4287'));
