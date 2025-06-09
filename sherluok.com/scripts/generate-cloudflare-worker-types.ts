import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync(resolve('.wrangler'), { recursive: true });
spawnSync('pnpm', ['exec', 'wrangler', 'types', '.wrangler/worker-configuration.d.ts'], { stdio: 'inherit', shell: true });
