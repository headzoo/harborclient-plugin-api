#!/usr/bin/env node
import { cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

cpSync(join(root, 'src/runtime'), join(root, 'dist/runtime'), { recursive: true });
cpSync(join(root, 'src/runtime/view-host'), join(root, 'dist/runtime/view-host'), {
  recursive: true
});
cpSync(join(root, 'src/client.d.ts'), join(root, 'dist/client.d.ts'));
