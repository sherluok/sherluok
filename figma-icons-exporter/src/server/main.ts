import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, isAbsolute, normalize, resolve } from 'node:path';
import { ReplaySubject } from 'rxjs';
import { receiveExportedData, saveToFiles } from '../exports/node';
import { ExportedData } from '../exports/zod';

const exportedData$ = new ReplaySubject<ExportedData>();

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { pathname, searchParams } = new URL(req.url ?? '/', 'http://localhost');

  if (pathname === '/api/figma-icons-exporter' && req.method === 'POST') {
    try {
      const data = await receiveExportedData(req);
      const filePathWithoutExtension = searchParams.get('filePathWithoutExtension');
      if (filePathWithoutExtension && isAbsolute(filePathWithoutExtension)) {
        console.log('Saving to %s', filePathWithoutExtension);
        const generateTypeDefination = searchParams.get('generateTypeDefination') === 'true';
        console.log('[save]', { filePathWithoutExtension, generateTypeDefination });
        await access(dirname(normalize(filePathWithoutExtension)));
        await saveToFiles(data, {
          filePathWithoutExtension,
          generateJsonFile: searchParams.has('generateJsonFile'),
          generateJsonTypeScriptDeclarationFile: searchParams.has('generateJsonDeclarationFile'),
          generateObjectDefinationFile: searchParams.has('generateIconDefinationsFile'),
          generateReactElementFile: searchParams.has('generateReactElementsFile'),
          generateReactComponentsFile: searchParams.has('generateReactComponentsFile'),
        });
        exportedData$.next(data);
      } else {
        console.warn('No filePathWithoutExtension search params, not saving.');
      }
    } catch (error) {
      console.error( error);
    }
    res.end();
    return;
  }

  if (pathname === '/api/exported-data' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const subscription = exportedData$.subscribe((data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    req.once('close', () => {
      subscription.unsubscribe();
    });

    return;
  }

  if (pathname === '/ui.js' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/javascript');
    createReadStream(resolve('build/server/ui.js')).pipe(res);
    return;
  }

  if (pathname === '/ui.css' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/css');
    createReadStream(resolve('build/server/ui.css')).pipe(res);
    return;
  }

  if (pathname === '/' && req.method === 'GET' && req.headers.accept?.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    createReadStream(resolve('build/server/ui.html')).pipe(res);
    return;
  }

  console.warn(req.url);
  res.writeHead(400);
  res.end();
}).listen(3974, () => {
  console.log('Server listening at http://localhost:3974');
  console.log('Send POST request to http://localhost:3974/api/figma-icons-exporter to try.');
  console.log('Open page http://localhost:3974 to see exported results.');
});
