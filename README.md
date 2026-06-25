# @harborclient/plugin-api

TypeScript definitions and React runtime helpers for [HarborClient](https://harborclient.com/) plugin development.

Install as a **dev dependency** in your plugin project. The package ships type declarations plus a small JSX runtime that forwards to the host's React instance via `installReact(hc.react)`.

## Install

```bash
pnpm add -D @harborclient/plugin-api
```

Requires HarborClient **>=1.9.0** when using `hc.pluginId`.

## Usage

### Renderer entry with JSX

**TypeScript** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@harborclient/plugin-api"
  }
}
```

**esbuild**:

```bash
esbuild src/renderer.tsx \
  --bundle --outfile=dist/renderer.js --format=esm \
  --jsx=automatic --jsx-import-source=@harborclient/plugin-api \
  --external:react --external:react-dom
```

**Renderer entry**:

```tsx
import { installReact } from '@harborclient/plugin-api';
import type { PluginContext } from '@harborclient/plugin-api';

export function activate(hc: PluginContext): void {
  installReact(hc.react);
  // register contributions…
}
```

**Hooks in components** — import from `@harborclient/plugin-api/react` (not from `react`):

```tsx
import { useState, useEffect } from '@harborclient/plugin-api/react';
```

Do not bundle `react` / `react-dom` in your plugin bundle.

### Main entry

Main entries run in the SES utilityProcess for HTTP hooks and custom IPC — not for React UI. Import `MainPluginContext` from `@harborclient/plugin-api/main`:

```typescript
import type { MainPluginContext } from '@harborclient/plugin-api/main';

export function activate(hc: MainPluginContext): void {
  hc.subscriptions.push(
    hc.http.onBeforeSend((request) => {
      request.headers['X-Trace'] = '1';
    })
  );
}
```

## License

MIT
