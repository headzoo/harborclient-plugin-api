# Manifest

Every plugin requires a manifest at the root of the `.hcp` archive. The example below shows every field; real plugins usually declare only the entries they use.

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",

  "author": "Example Inc.",
  "description": "README.md",
  "icon": "assets/icon.png",
  "screenshots": [
    {
      "path": "assets/screenshots/settings.png",
      "caption": "Settings panel"
    },
    {
      "path": "assets/screenshots/sidebar.png",
      "caption": "Sidebar tools"
    }
  ],
  "homepage": "https://example.com/my-plugin",
  "bugs": {
    "url": "https://github.com/example/my-plugin/issues"
  },

  "engines": {
    "harborclient": ">=1.7.0"
  },
  "renderer": "dist/renderer.js",
  "main": "dist/main.js",
  "permissions": ["ui", "storage"],

  "contributes": {
    "settingsSections": [{ "id": "myPlugin.settings", "title": "My Plugin" }],
    "sidebarPanels": [{ "id": "myPlugin.panel", "title": "My Plugin" }],
    "sidebarSections": [{ "id": "myPlugin.section", "title": "My Plugin" }],
    "mainViews": [{ "id": "myPlugin.view", "title": "My Plugin" }],
    "requestTabs": [{ "id": "myPlugin.requestTab", "title": "Audit" }],
    "responseTabs": [{ "id": "myPlugin.responseTab", "title": "Summary" }],
    "collectionSettingsTabs": [{ "id": "myPlugin.collTab", "title": "Plugin" }],
    "footerPanels": [{ "id": "myPlugin.footer", "title": "My Plugin" }],
    "requestToolbarActions": [{ "id": "myPlugin.sendAction", "title": "Run check" }],
    "contextMenus": [{ "id": "myPlugin.requestMenu", "title": "Plugin action" }],
    "statusBarItems": [{ "id": "myPlugin.status", "title": "Status" }],
    "themes": [{ "id": "solarized", "title": "Solarized Dark", "type": "dark" }],
    "commands": [{ "id": "myPlugin.run", "title": "Run plugin command" }],
    "menus": [
      {
        "menu": "view",
        "command": "myPlugin.run",
        "group": "plugin"
      }
    ]
  }
}
```

| Field                  | Required | Description                                                                                                                         |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | Yes      | Reverse-DNS identifier. Namespaces storage and plugin updates.                                                                      |
| `name`                 | Yes      | Display name shown in Settings and install dialogs.                                                                                 |
| `version`              | Yes      | Semver version string.                                                                                                              |
| `author`               | No       | Publisher or author name shown on the plugin detail page.                                                                           |
| `description`          | No       | Path to a Markdown file (for example `README.md`) with the full plugin description. Rendered in **Settings → Plugins** detail view. |
| `icon`                 | No       | Path to a square PNG or SVG icon (recommended 128×128 px or larger). Shown in the plugin list and install dialog.                   |
| `screenshots`          | No       | Gallery images for the plugin detail page. See [Screenshots](#screenshots) below.                                                   |
| `homepage`             | No       | URL to the plugin's website or documentation. Shown as a link on the detail page.                                                   |
| `bugs`                 | No       | Issue tracker for bug reports. Use `{ "url": "https://…" }`. Shown as **Report issue** on the detail page.                          |
| `engines.harborclient` | Yes      | Minimum HarborClient version (for example `>=1.7.0`).                                                                               |
| `renderer`             | No       | Path to the renderer entry bundle (UI).                                                                                             |
| `main`                 | No       | Path to the main entry bundle (hooks, IPC, logic).                                                                                  |
| `permissions`          | Yes      | Capabilities the plugin needs. Summarized in the install confirmation dialog.                                                       |
| `contributes`          | No       | Declarative UI slots listed before plugin code activates.                                                                           |

## Plugin metadata

Listing metadata is separate from `contributes` — it describes the package for users browsing **Settings → Plugins**, not UI slots inside the app.

### description

Points to a Markdown file at the plugin package root (relative path only; no absolute paths or URLs). HarborClient renders the file in the plugin detail view with the same Markdown subset used elsewhere in the app (headings, lists, links, code fences, emphasis).

Use this for install-time documentation: features, setup notes, permission rationale, and changelog highlights. Keep `manifest.json` lean; put prose in `README.md` or `description.md`.

```markdown
# My Plugin

Logs every outbound HTTP request to the terminal and adds a **Solarized Dark** theme.

## Permissions

- `http` — before/after send hooks for request logging
- `ui` — theme registration
```

### icon

Path to a PNG or SVG under the plugin directory. Recommended **128×128 px** minimum; HarborClient scales down for list rows and up for the detail header. Use a transparent background for PNG icons.

### Screenshots

An array of screenshot entries. Each entry is either:

- a **string** — plugin-relative image path, or
- an **object** — `{ "path": "assets/…", "caption": "Optional label" }`

Supported formats: PNG, JPEG, WebP. Recommended width **1280 px** or wider; HarborClient scales images to fit the detail gallery. Include two to five screenshots that show primary UI contributions.

```json
"screenshots": [
  "assets/screenshots/overview.png",
  { "path": "assets/screenshots/settings.png", "caption": "Plugin settings" }
]
```

### author, homepage, and bugs

| Field      | Example                                         | Shown in UI                   |
| ---------- | ----------------------------------------------- | ----------------------------- |
| `author`   | `"Acme HTTP Tools"`                             | Publisher line on detail page |
| `homepage` | `"https://example.com/my-plugin"`               | **Website** link              |
| `bugs.url` | `"https://github.com/example/my-plugin/issues"` | **Report issue** link         |

All URL fields must use `https://` (or `http://` for local development documentation only). HarborClient opens links in the system default browser.

## Contribution types

The `contributes` block declares where your plugin can appear. Each entry's `id` must match the `id` passed to the corresponding `hc.ui.register*` call at activation time.

| Manifest key             | `hc.ui` registrar               | UI surface                                            |
| ------------------------ | ------------------------------- | ----------------------------------------------------- |
| `settingsSections`       | `registerSettingsSection`       | Settings sidebar and panel                            |
| `sidebarPanels`          | `registerSidebarPanel`          | Switchable left sidebar destination                   |
| `sidebarSections`        | `registerSidebarSection`        | Collapsible block inside the scrollable sidebar       |
| `mainViews`              | `registerMainView`              | Full main-area overlay (Team Hubs pattern)            |
| `requestTabs`            | `registerRequestTab`            | Request editor segmented tabs                         |
| `responseTabs`           | `registerResponseTab`           | Response viewer tabs                                  |
| `collectionSettingsTabs` | `registerCollectionSettingsTab` | Collection settings segmented tabs                    |
| `footerPanels`           | `registerFooterPanel`           | Slide-up footer panel                                 |
| `requestToolbarActions`  | `registerRequestToolbarAction`  | Button near Send in the URL bar                       |
| `contextMenus`           | `registerContextMenuItem`       | Row actions on sidebar collections, folders, requests |
| `statusBarItems`         | `registerStatusBarItem`         | Footer status area (beside sidebar / AI toggles)      |
| `themes`                 | `hc.themes.register`            | Appearance theme in Settings → General                |
| `commands`               | `hc.commands.register`          | Command handlers (menus, toolbar, context menus)      |
| `menus`                  | `registerMenuItem`              | File, Edit, View, or Help application menu            |

Settings sections ship in the initial plugin release. Other contribution types are part of the target API documented in the [Renderer API](/renderer-overview) and will roll out in subsequent HarborClient versions. Declare them in the manifest now so install dialogs and future host versions can discover slots before your code loads.

See [UI contributions](/renderer-ui) for registration method reference.
