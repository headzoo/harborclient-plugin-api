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

## hc.database

Plugin-scoped SQLite database. Each plugin id gets its own file under HarborClient userData (`plugin-databases/{pluginId}.sqlite`). Requires the `database` permission.

Use `hc.database` when you need indexed queries, relational data, or large structured stores. Keep small settings in `hc.storage`; the two APIs share no tables and neither can access HarborClient collections or other plugins' data.

`get`, `all`, and `run` accept **single-statement** parameterized SQL (`?` placeholders). Use `exec` for migration scripts (multi-statement DDL). Use `transaction` for atomic multi-step writes.

### hc.database.get(sql, params?)

**Signature:** `<T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T | undefined>`

Returns the first row, or `undefined` when no row matches.

```typescript
const row = await hc.database.get<{ count: number }>(
  'SELECT COUNT(*) AS count FROM events WHERE request_id = ?',
  [requestId]
);
```

### hc.database.all(sql, params?)

**Signature:** `<T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>`

Returns all matching rows.

### hc.database.run(sql, params?)

**Signature:** `(sql: string, params?: unknown[]) => Promise<PluginRunResult>`

Runs an `INSERT`, `UPDATE`, or `DELETE` statement. Returns `{ changes, lastInsertRowid }`.

### hc.database.exec(sql)

**Signature:** `(sql: string) => Promise<void>`

Executes a multi-statement SQL script (typically migrations). Rejects scripts containing `ATTACH`, `DETACH`, or `load_extension`.

```typescript
await hc.database.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    status INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_request_id ON events(request_id);
`);
```

### hc.database.transaction(fn)

**Signature:** `<T>(fn: (tx: PluginDatabaseTx) => Promise<T>) => Promise<T>`

Runs `fn` inside an exclusive transaction. The `tx` object exposes `get`, `all`, and `run` bound to the same transaction.

```typescript
await hc.database.transaction(async (tx) => {
  await tx.run('INSERT INTO outbox (payload) VALUES (?)', [JSON.stringify(body)]);
  await tx.run('UPDATE counters SET value = value + 1 WHERE name = ?', ['sent']);
});
```

Plugin database files are included in HarborClient `.hcb` backups and removed when the plugin is uninstalled.

## hc.fs

Plugin-scoped filesystem access backed by main-process permission checks and a per-plugin path allowlist. Requires `filesystem:pick` for open/save dialogs, `filesystem:read` for `readFile`, and `filesystem:write` for `writeFile`. User-selected paths from pick/save dialogs are added to the allowlist automatically; the plugin package directory is allowlisted on load. User-granted paths persist across app restarts and are restored when the plugin loads again.

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

Requires the `ui` permission. Use `hc.host.openRequestDraft`, `hc.host.loadRequest`, `hc.host.sendRequest`, and `hc.host.createCollection` instead of `hc.commands.execute('harborclient:…')`.

### hc.host.createCollection(payload)

**Signature:** `(payload: CreateCollectionPayload) => Promise<CreateCollectionResult>`

Bulk-creates a collection with folders and saved requests. Requests sharing the same `folder` string are grouped into one folder; requests without `folder` are created at the collection root.

```typescript
const { collectionId } = await hc.host.createCollection({
  name: 'Petstore API',
  requests: [
    {
      name: 'List pets',
      method: 'GET',
      url: 'https://api.example.com/pets',
      folder: 'pets'
    },
    {
      name: 'Create pet',
      method: 'POST',
      url: 'https://api.example.com/pets',
      folder: 'pets',
      body: '{"name":"Fluffy"}',
      bodyType: 'json'
    }
  ]
});
```

## Global variables

HarborClient stores app-wide variables in **Settings → Globals**. They use the same `Variable` shape as collection and environment variables (`key`, `value`, `defaultValue`, `share`) and participate in `{{key}}` substitution with the **lowest precedence** in the static chain:

**globals → collection → environment**

Request scripts can mutate globals with `hc.globals.get` / `hc.globals.set`; values persist after the send completes. See [Request scripts — hc.globals](https://harborclient.com/request-scripts#hcglobals).

### Reading globals from plugins

Request tab components receive the merged runtime map on `RequestTabContext.variables`. Global values are included automatically; collection and environment variables override globals when they define the same key:

```typescript
function AuditTab({ context }: { context: RequestTabContext }) {
  const baseUrl = context.variables.baseUrl;
  const token = context.variables.token;
  // ...
}
```

This snapshot reflects the editor state before send. It does not include ephemeral values from `hc.variables.set` during an in-flight send.

### Updating globals from plugins

Replace all global variables with a new list via the built-in host command (requires the `ui` permission):

```typescript
await hc.commands.execute('harborclient:updateGlobalVariables', [
  { key: 'baseUrl', value: 'https://api.example.com', defaultValue: '', share: true },
  { key: 'apiKey', value: '', defaultValue: 'dev-key', share: false }
]);
```

Each row uses `PluginVariableInput`: `key`, `value`, optional `defaultValue`, optional `share`.

To create or update **environment** variables instead, use `hc.host.createEnvironmentWithVariables` and `hc.host.updateEnvironmentVariables`.

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
