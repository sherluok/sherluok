import { ExportData } from '^/exports/common';
import { handleExportRequest, saveToFiles } from '^/exports/node';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, isAbsolute, normalize, resolve } from 'node:path';
import { BehaviorSubject } from 'rxjs';

const icons$ = new BehaviorSubject<ExportData>({
  vars: {},
  icons: {},
});

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { pathname, searchParams } = new URL(req.url ?? '/', 'http://localhost');

  if (pathname === '/api/figma-icons-exporter' && req.method === 'POST') {
    const data = await handleExportRequest(req);
    const filePathWithoutExtension = searchParams.get('filePathWithoutExtension');
    if (filePathWithoutExtension && isAbsolute(filePathWithoutExtension)) {
      const generateTypeDefination = searchParams.get('generateTypeDefination') === 'true';
      console.log('[save]', { filePathWithoutExtension, generateTypeDefination });
      try {
        await access(dirname(normalize(filePathWithoutExtension)));
        await saveToFiles(data, filePathWithoutExtension, generateTypeDefination);
      } catch (error) {
        console.error('[access error]', error);
      }
    }
    icons$.next(data);
    res.end();
    return;
  }

  if (pathname === '/api/icons' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const subscription = icons$.subscribe((icons) => res.write(`data: ${JSON.stringify(icons)}\n\n`));
    req.once('close', () => subscription.unsubscribe());

    return;
  }

  if (pathname === '/index.js' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/javascript');
    createReadStream(resolve('build/server/ui.js')).pipe(res);
    return;
  }

  if (pathname === '/index.css' && req.method === 'GET') {
    createReadStream(resolve('build/server/ui.css')).pipe(res);
    return;
  }

  if (pathname === '/' && req.method === 'GET' && req.headers.accept?.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    createReadStream(resolve('build/server/ui.html')).pipe(res);
    // const templateHTML = await readFile(join(__dirname, 'server-index.html'), 'utf-8');
    // const html = templateHTML.replace('_ICONS_DATA_REPLACE_PLACEHOLDER_', iconsJSONRawData$);
    // res.setHeader('Content-Type', 'text/html');
    // res.write(html);
    // res.end();
    return;
  }

  res.writeHead(400);
  res.end();
}).listen(3974, () => {
  console.log('Server listening at http://localhost:3974');
  console.log('Send POST request to http://localhost:3974/api/figma-icons-exporter to try.');
  console.log('Open page http://localhost:3974 to see exported results.');
});
