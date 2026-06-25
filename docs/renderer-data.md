# Themes and storage

## hc.themes

Custom appearance themes extend the built-in **Light**, **Dark**, **System**, and **High contrast** options in **Settings → General**. Plugin themes appear in the same dropdown once registered.

HarborClient styles the app with `--mac-*` CSS custom properties defined in `src/renderer/src/styles.css`. When a plugin theme is active, the host sets `data-theme="plugin-<pluginId>-<themeId>"` on `<html>` and applies your token overrides or injected stylesheet. Built-in light/dark/system behavior is unchanged when a builtin theme is selected.

Requires the `ui` permission. Push returned disposables onto `hc.subscriptions`.

### hc.themes.register(theme)

**Signature:** `(theme: ThemeContribution) => Disposable`

**Manifest:** `contributes.themes`

| Parameter    | Type                                       | Description                                          |
| ------------ | ------------------------------------------ | ---------------------------------------------------- |
| `id`         | `string`                                   | Theme id unique within your plugin                   |
| `title`      | `string`                                   | Label in the appearance dropdown                     |
| `type`       | `'light' \| 'dark'`                        | Sets `color-scheme` and Electron native chrome base  |
| `colors`     | `Partial<Record<ThemeColorToken, string>>` | Optional token overrides                             |
| `stylesheet` | `string`                                   | Optional plugin-relative CSS file for complex themes |

Provide `colors`, a `stylesheet`, or both. Use `colors` for simple palette swaps; use `stylesheet` when you need selectors beyond `:root` (for example plugin-specific tweaks under `[data-theme='plugin-…']`).

```typescript
hc.subscriptions.push(
  hc.themes.register({
    id: 'solarized',
    title: 'Solarized Dark',
    type: 'dark',
    colors: {
      surface: '#002b36',
      sidebar: '#073642',
      control: '#073642',
      text: '#839496',
      'text-secondary': '#93a1a1',
      accent: '#268bd2',
      selection: 'rgba(38, 139, 210, 0.25)'
    }
  })
);
```

When the user selects your theme, the persisted value is `plugin:<pluginId>:<themeId>`. If the plugin is disabled or uninstalled while its theme is active, HarborClient falls back to **System**.

### hc.themes.getActive()

**Signature:** `() => Promise<ActiveTheme>`

Returns the currently active theme — either a built-in id or a plugin theme reference.

```typescript
const active = await hc.themes.getActive();
if (active.source === 'plugin') {
  console.log(active.pluginId, active.themeId);
}
```

### hc.themes.onDidChange(listener)

**Signature:** `(listener: (theme: ActiveTheme) => void) => Disposable`

Fires when the user changes the appearance theme in Settings or when the host resets theme after plugin deactivation.

```typescript
hc.subscriptions.push(
  hc.themes.onDidChange((theme) => {
    if (theme.source === 'plugin' && theme.themeId === 'solarized') {
      hc.ui.showToast('Solarized theme active');
    }
  })
);
```

### Theme color tokens

Override any of these keys in `colors`. Each maps to `--mac-<token>` on the document root.

| Token                                                  | Used for                            |
| ------------------------------------------------------ | ----------------------------------- |
| `surface`                                              | Main content background             |
| `sidebar`                                              | Left sidebar background             |
| `sidebar-section`                                      | Sidebar section headers             |
| `control`                                              | Panels, inputs, footer bar          |
| `field`                                                | Input field fill                    |
| `separator`                                            | Borders and dividers                |
| `text`                                                 | Primary text                        |
| `text-secondary`                                       | Secondary labels                    |
| `muted`                                                | De-emphasized text                  |
| `accent`                                               | Links, focus rings, primary actions |
| `selection`                                            | Selected row / highlight fill       |
| `danger`, `danger-light`, `warning`, `success`, `info` | Status colors                       |
| `method-get`, `method-post`, …                         | HTTP method badge colors            |

See the [Solarized theme example](/examples/solarized-theme) for a complete theme plugin.

## hc.commands

Command handlers tie together menus, toolbar actions, and context menu items.

### hc.commands.register(id, handler)

**Signature:** `(id: string, handler: (...args: unknown[]) => void | Promise<void>) => Disposable`

**Manifest:** matching `contributes.commands` entry

Registers a command handler. The `id` must match a command declared in the manifest and referenced by menu, toolbar, or context menu contributions.

### hc.commands.execute(id, ...args)

**Signature:** `(id: string, ...args: unknown[]) => Promise<void>`

Runs a registered command programmatically — for example to open a main view from another part of your plugin.

```typescript
hc.commands.register('myPlugin.openDashboard', () => {
  void hc.commands.execute('myPlugin.navigateToView', 'myPlugin.view');
});
```

## hc.storage

Plugin-scoped persistent storage. Keys are namespaced by plugin `id` in the main process. Requires the `storage` permission.

### hc.storage.get(key)

**Signature:** `<T>(key: string) => Promise<T | undefined>`

Returns the stored value, or `undefined` if the key has never been set.

```typescript
const enabled = await hc.storage.get<boolean>('enabled');
```

### hc.storage.set(key, value)

**Signature:** `<T>(key: string, value: T) => Promise<void>`

Persists a JSON-serializable value.

```typescript
await hc.storage.set('enabled', true);
```

## hc.fs

Plugin-scoped filesystem access backed by main-process permission checks and a per-plugin path allowlist. Requires `filesystem:pick` for open/save dialogs, `filesystem:read` for `readFile`, and `filesystem:write` for `writeFile`. User-selected paths from pick/save dialogs are added to the allowlist automatically; the plugin package directory is allowlisted on load.

### hc.fs.pickFile(options?)

**Signature:** `(options?: PluginFsPickFileOptions) => Promise<string[]>`

Opens a native file picker. Returns absolute paths for the selected files, or an empty array when the dialog is canceled. Requires the `filesystem:pick` permission.

```typescript
const paths = await hc.fs.pickFile({
  title: 'Choose a schema',
  filters: [{ name: 'JSON', extensions: ['json'] }]
});
```

### hc.fs.pickDirectory(defaultPath?)

**Signature:** `(defaultPath?: string) => Promise<string | null>`

Opens a native directory picker. Returns the selected directory path, or `null` when canceled. Requires the `filesystem:pick` permission.

### hc.fs.saveFile(content, options?)

**Signature:** `(content: string, options?: PluginFsSaveFileOptions) => Promise<string | null>`

Opens a native save dialog and writes `content` to the chosen path. Returns the saved path, or `null` when canceled. Requires the `filesystem:pick` and `filesystem:write` permissions.

### hc.fs.readFile(path)

**Signature:** `(path: string) => Promise<string>`

Reads a UTF-8 text file from an allowlisted path. Requires the `filesystem:read` permission.

### hc.fs.writeFile(path, content)

**Signature:** `(path: string, content: string) => Promise<void>`

Writes UTF-8 text to an allowlisted path. Requires the `filesystem:write` permission.

## hc.http

Renderer-side HTTP lifecycle events. See [Renderer API](/renderer-overview) for full documentation.

Requires the `http` permission. Use `hc.http.onAfterSend` when you only need to react to completed sends in the UI — no main entry or polling required.

## hc.ipc

Renderer-side RPC into the plugin main entry. See [Renderer API](/renderer-overview).

Requires the `ipc` permission. Call `hc.ipc.invoke(channel, ...args)` instead of `window.api.invokePluginMain`.

## hc.host

Typed wrappers for built-in request editor commands. See [Renderer API](/renderer-overview).

Requires the `ui` permission. Use `hc.host.openRequestDraft`, `hc.host.loadRequest`, and `hc.host.sendRequest` instead of `hc.commands.execute('harborclient:…')`.

## hc.subscriptions

**Type:** `Disposable[]`

Push disposables returned by registration APIs here. The host disposes every entry when the plugin deactivates:

```typescript
hc.subscriptions.push(
  hc.ui.registerSettingsSection({
    /* ... */
  })
);
```

## Not extensible

These built-in surfaces are not open to plugin contributions:

- **Open request tab strip** — tabs for unsaved/saved requests in the editor workspace.
- **AI sidebar** — the built-in assistant panel.
- **Native window chrome** — title bar and window controls (menu contributions use the application menu only).
