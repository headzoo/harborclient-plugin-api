# Quick start

Install `@harborclient/sdk` first — see [Install](/install).

## Renderer entry

```tsx
import { installReact } from '@harborclient/sdk';
import type { PluginContext } from '@harborclient/sdk';

export function activate(hc: PluginContext): void {
  installReact(hc.react);

  hc.subscriptions.push(
    hc.http.onAfterSend(async (request, response) => {
      // react to completed requests without a main entry
    })
  );
}
```

Do not bundle `react` / `react-dom` in your plugin bundle. For JSX setup, esbuild flags, and hook imports, see [React and JSX](/renderer-overview#react-and-jsx).

## Main entry

Main entries run in the SES utilityProcess for HTTP hooks and custom IPC — not for React UI. Import `MainPluginContext` from `@harborclient/sdk/main`:

```typescript
import type { MainPluginContext } from '@harborclient/sdk/main';

export function activate(hc: MainPluginContext): void {
  hc.subscriptions.push(
    hc.http.onBeforeSend((request) => {
      request.headers['X-Trace'] = '1';
    })
  );
}
```

See [Main API](/main-api) for HTTP hooks and IPC, and [Building](/building) to package your plugin as `.hcp`.

## Utility imports

Shared helpers ship as subpath exports (requires `@harborclient/sdk` **0.3.1+**):

```typescript
import { resolveRequest } from '@harborclient/sdk/http';
import { methodColorClass, formatRelativeTime } from '@harborclient/sdk/ui';
import { mergeById, createCappedList } from '@harborclient/sdk/storage';
import { copyToClipboard } from '@harborclient/sdk/clipboard';
import { randomId, truncateBody } from '@harborclient/sdk/runtime-utils';
import { createExternalStore } from '@harborclient/sdk/store';
```
