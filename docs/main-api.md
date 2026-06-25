# Main API

Optional `main` entry modules export `activate(hc)` and `deactivate()` like renderer entries, but run inside the SES-hardened utilityProcess. Use this entry for HTTP hooks and custom IPC — not for React UI.

Import `MainPluginContext` from `@harborclient/plugin-api` (or `@harborclient/plugin-api/main` for main-only plugins) and type your entry as `activate(hc: MainPluginContext)`.

See [Architecture](/architecture#two-runtimes) for how the main entry fits alongside the renderer entry.

## hc.storage

Same namespaced `get` / `set` API as the renderer. Requires the `storage` permission.

## hc.http.onBeforeSend(handler)

**Signature:** `(handler: (request) => void \| Promise<void>) => Disposable`

Register a callback that runs before each outgoing HTTP request. Mutate the request object to change method, URL, headers, or body. Requires the `http` permission. Remove a header with `delete request.headers['Header-Name']`.

```typescript
import type { MainPluginContext } from '@harborclient/plugin-api';

export function activate(hc: MainPluginContext): void {
  hc.subscriptions.push(
    hc.http.onBeforeSend(async (request) => {
      request.headers['X-Plugin-Trace'] = '1';
      delete request.headers['Authorization'];
    })
  );
}
```

## hc.http.onAfterSend(handler)

**Signature:** `(handler: (request, response) => void \| Promise<void>) => Disposable`

Register a callback that runs after the response is received. Requires the `http` permission.

For UI-only plugins that react to completed sends (history, recent-requests, response diff), prefer renderer-side `hc.http.onAfterSend` in the renderer entry — it fires in-process with no main entry, custom IPC channel, or polling. Use this main-process hook when you need to run logic in the SES-hardened utilityProcess or mutate shared main-side state.

## hc.ipc.handle(channel, handler)

**Signature:** `(channel: string, handler: (...args) => unknown) => Disposable`

Expose an RPC channel callable from the renderer half of the same plugin. Requires the `ipc` permission.

Main-process hooks are invoked by posting work to the utilityProcess runner; the main process applies mutations and enforces permissions before and after each callback.

See the [Request logger example](/examples/request-logger) for a main-only plugin using HTTP hooks.
