# Renderer API

The renderer entry exports `activate(hc)` and optionally `deactivate()`. The `hc` argument is a `PluginContext`:

```typescript
import type * as React from 'react';
import type { RequestDraft, HttpResponse } from '@harborclient/sdk';

export interface Disposable {
  dispose(): void;
}

export interface UiContributionBase {
  /** Must match an id in the corresponding manifest contributes.* array */
  id: string;
  title: string;
}

export interface SettingsSectionContribution extends UiContributionBase {
  Component: React.ComponentType;
}

export interface SidebarPanelContribution extends UiContributionBase {
  icon?: string;
  Component: React.ComponentType;
  order?: number;
}

export interface SidebarSectionContribution extends UiContributionBase {
  Component: React.ComponentType;
  order?: number;
}

export interface MainViewContribution extends UiContributionBase {
  Component: React.ComponentType;
}

export interface RequestTabContext {
  draft: RequestDraft;
  response: HttpResponse | null;
  readOnly: true;
}

export interface RequestTabContribution extends UiContributionBase {
  Component: React.ComponentType<{ context: RequestTabContext }>;
  order?: number;
}

export interface ResponseTabContext {
  draft: RequestDraft;
  response: HttpResponse | null;
}

export interface ResponseTabContribution extends UiContributionBase {
  Component: React.ComponentType<{ context: ResponseTabContext }>;
  order?: number;
  /** When to show the tab. Default `hasResponse`. */
  when?: 'always' | 'hasResponse';
}

export interface CollectionSettingsTabContext {
  collectionId: number;
  readOnly: boolean;
}

export interface CollectionSettingsTabContribution extends UiContributionBase {
  Component: React.ComponentType<{ context: CollectionSettingsTabContext }>;
  order?: number;
}

export interface FooterPanelContribution extends UiContributionBase {
  Component: React.ComponentType;
}

export type AppMenu = 'file' | 'edit' | 'view' | 'help';

export interface MenuItemContribution {
  menu: AppMenu;
  command: string;
  label?: string;
  group?: string;
  order?: number;
}

export interface RequestToolbarActionContribution {
  id: string;
  title: string;
  command: string;
  icon?: string;
  order?: number;
}

export type ContextMenuTarget = 'collection' | 'folder' | 'request';

export interface ContextMenuItemContribution {
  id: string;
  title: string;
  command: string;
  when: ContextMenuTarget | ContextMenuTarget[];
  group?: string;
  order?: number;
}

export interface StatusBarItemContribution {
  id: string;
  Component: React.ComponentType;
  alignment?: 'left' | 'right';
  order?: number;
}

/**
 * HarborClient UI color tokens. Override via `colors` or a bundled stylesheet.
 * Maps to `--mac-*` CSS custom properties on `:root`.
 */
export type ThemeColorToken =
  | 'surface'
  | 'sidebar'
  | 'sidebar-section'
  | 'control'
  | 'field'
  | 'separator'
  | 'text'
  | 'text-secondary'
  | 'muted'
  | 'accent'
  | 'selection'
  | 'danger'
  | 'danger-light'
  | 'warning'
  | 'success'
  | 'info'
  | 'method-get'
  | 'method-post'
  | 'method-put'
  | 'method-patch'
  | 'method-delete'
  | 'method-head'
  | 'method-options';

export interface ThemeContribution {
  /** Must match an id in manifest.contributes.themes */
  id: string;
  title: string;
  /** Base appearance for `color-scheme` and native window chrome */
  type: 'light' | 'dark';
  /** Token overrides without the `--mac-` prefix */
  colors?: Partial<Record<ThemeColorToken, string>>;
  /** Plugin-relative CSS path (for example `dist/theme.css`) */
  stylesheet?: string;
}

export type BuiltinThemeId = 'light' | 'dark' | 'system' | 'high-contrast';

export type ActiveTheme =
  | { source: 'builtin'; id: BuiltinThemeId }
  | { source: 'plugin'; pluginId: string; themeId: string };

export interface PluginThemes {
  register(theme: ThemeContribution): Disposable;
  getActive(): Promise<ActiveTheme>;
  onDidChange(listener: (theme: ActiveTheme) => void): Disposable;
}

export interface PluginStorage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}

export interface PluginCommands {
  register(id: string, handler: (...args: unknown[]) => void | Promise<void>): Disposable;
  execute(id: string, ...args: unknown[]): Promise<void>;
}

export interface PluginUi {
  registerSettingsSection(section: SettingsSectionContribution): Disposable;
  registerSidebarPanel(panel: SidebarPanelContribution): Disposable;
  registerSidebarSection(section: SidebarSectionContribution): Disposable;
  registerMainView(view: MainViewContribution): Disposable;
  registerRequestTab(tab: RequestTabContribution): Disposable;
  registerResponseTab(tab: ResponseTabContribution): Disposable;
  registerCollectionSettingsTab(tab: CollectionSettingsTabContribution): Disposable;
  registerFooterPanel(panel: FooterPanelContribution): Disposable;
  registerMenuItem(item: MenuItemContribution): Disposable;
  registerRequestToolbarAction(action: RequestToolbarActionContribution): Disposable;
  registerContextMenuItem(item: ContextMenuItemContribution): Disposable;
  registerStatusBarItem(item: StatusBarItemContribution): Disposable;
  showToast(message: string, options?: { duration?: number }): void;
}

export interface PluginContext {
  pluginId: string;
  react: typeof React;
  ui: PluginUi;
  themes: PluginThemes;
  commands: PluginCommands;
  storage: PluginStorage;
  fs: PluginFs;
  http: PluginRendererHttp;
  ipc: PluginIpcInvoker;
  host: PluginHost;
  subscriptions: Disposable[];
}

export interface PluginRendererHttp {
  onAfterSend(
    handler: (request: PluginHttpRequest, response: PluginHttpResponse) => void | Promise<void>
  ): Disposable;
}

export interface PluginIpcInvoker {
  invoke<T>(channel: string, ...args: unknown[]): Promise<T>;
}

export interface OpenRequestDraftParam {
  key: string;
  value: string;
}

export interface OpenRequestDraftPayload {
  name?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  params?: OpenRequestDraftParam[];
  body?: string;
  bodyType?: BodyType;
}

export interface PluginHost {
  openRequestDraft(payload: OpenRequestDraftPayload): Promise<void>;
  loadRequest(requestId: number): Promise<void>;
}

export interface PluginHttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  bodyType?: string;
  params?: Array<{ key: string; value: string }>;
  sourceRequestId?: number;
  sourceRequestName?: string;
}

export interface PluginHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}
```

Install `@harborclient/sdk` as a **dev dependency** in your plugin project for types and the JSX runtime helpers. The package tracks HarborClient releases. Type definitions are maintained in [harborclient/sdk](https://github.com/harborclient/sdk). Main entries use `MainPluginContext` instead — import it from `@harborclient/sdk` or `@harborclient/sdk/main` for main-only plugins.

## hc.pluginId

**Type:** `string`

The plugin manifest `id`. Use for IPC routing and logging instead of hardcoding the manifest id in plugin source.

## hc.react

**Type:** `typeof React`

The same React instance HarborClient uses in the renderer. Do not import or bundle `react` / `react-dom` in your plugin bundle.

## React and JSX

Plugins must share the host React instance. `@harborclient/sdk` ships a small JSX runtime and hook barrel that forwards to `hc.react` after you call `installReact(hc.react)` at the start of `activate()`.

**TypeScript** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@harborclient/sdk"
  }
}
```

**esbuild** (renderer bundle):

```bash
esbuild src/renderer.tsx \
  --bundle --outfile=dist/renderer.js --format=esm \
  --jsx=automatic --jsx-import-source=@harborclient/sdk \
  --external:react --external:react-dom
```

**Renderer entry:**

```tsx
import { installReact } from '@harborclient/sdk';
import type { PluginContext } from '@harborclient/sdk';

export function activate(hc: PluginContext): void {
  installReact(hc.react);
  // register contributions…
}
```

**Hooks in components** — import from `@harborclient/sdk/react` (not from `react`):

```tsx
import { useState, useEffect } from '@harborclient/sdk/react';
```

**Single-file escape hatch** — `createPluginComponent` builds a component from a factory that receives host React:

```tsx
import { installReact, createPluginComponent } from '@harborclient/sdk';

export function activate(hc: PluginContext): void {
  installReact(hc.react);
  const Panel = createPluginComponent((React) => {
    return function Panel() {
      const [count, setCount] = React.useState(0);
      return React.createElement('button', { onClick: () => setCount(count + 1) }, count);
    };
  });
}
```

See [harborclient-plugin-skeleton](https://github.com/harborclient/plugin-skeleton) for a complete starter project with renderer and main entries.

## hc.http

Renderer-side HTTP lifecycle events for reacting to completed sends in the UI. Requires the `http` permission. Push returned disposables onto `hc.subscriptions`.

Prefer `hc.http.onAfterSend` over a main entry + custom IPC + polling when you only need to capture completed requests in the renderer (for example history or recent-requests panels).

### hc.http.onAfterSend(handler)

**Signature:** `(handler: (request, response) => void | Promise<void>) => Disposable`

Fires after each successful send in the renderer. The `request` payload matches main-process hooks (`PluginHttpRequest`); the `response` payload is `PluginHttpResponse`.

```typescript
hc.subscriptions.push(
  hc.http.onAfterSend(async (request, response) => {
    console.log(request.method, request.url, response.status);
  })
);
```

For mutating outgoing requests before they are sent, use a main entry with `hc.http.onBeforeSend` instead — see [Main API](/main-api).

## hc.ipc

Renderer-side RPC into the plugin's main entry. Requires the `ipc` permission. The host auto-reactivates the main runtime when it has been torn down.

### hc.ipc.invoke(channel, ...args)

**Signature:** `<T>(channel: string, ...args: unknown[]) => Promise<T>`

Invokes a handler registered with `hc.ipc.handle` in the main entry. Use `hc.pluginId` for logging — channel names are automatically scoped to your plugin.

```typescript
const pending = await hc.ipc.invoke<Array<{ id: string }>>('pullPending');
```

Do not call `window.api.invokePluginMain` directly — use this typed API instead.

## hc.host

Typed wrappers for built-in HarborClient request editor commands. Requires the `ui` permission. Prefer these over stringly-typed `hc.commands.execute('harborclient:…')`.

### hc.host.openRequestDraft(payload)

**Signature:** `(payload: OpenRequestDraftPayload) => Promise<void>`

Opens a new request tab seeded with captured send metadata.

```typescript
await hc.host.openRequestDraft({
  name: 'Recent GET',
  method: request.method,
  url: request.url,
  headers: request.headers,
  params: request.params,
  body: request.body,
  bodyType: request.bodyType as BodyType | undefined
});
```

### hc.host.loadRequest(requestId)

**Signature:** `(requestId: number) => Promise<void>`

Opens a saved collection request or focuses an existing tab for it.

```typescript
await hc.host.loadRequest(42);
```

### hc.host.sendRequest()

**Signature:** `() => Promise<void>`

Sends the active request editor tab using the same pipeline as the Send button. No-op when a send is already in flight for the active tab.

```typescript
await hc.host.sendRequest();
```

## Related reference

- [UI contributions](/renderer-ui) — `hc.ui.register*` methods
- [Themes and storage](/renderer-data) — themes, commands, storage, and filesystem
- [Main API](/main-api) — HTTP hooks and IPC in the main entry
