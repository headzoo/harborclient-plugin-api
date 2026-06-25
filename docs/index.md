# Plugin development

HarborClient plugins extend the app with installable packages: custom settings panels, sidebar views, request tabs, appearance themes, HTTP hooks, and persistent storage. Each plugin ships as a **HarborClient plugin** file (`.hcp`) containing a `manifest.json` and bundled JavaScript. A `.hcp` file is a normal ZIP archive — the extension is a naming convention only, not a separate container format. Plugins use the same `hc` namespace as [request scripts](https://harborclient.com/request-scripts), but with a broader API suited to long-lived extensions.

To install or manage plugins in the app, see [Settings → Plugins](https://harborclient.com/settings#plugins) or browse the [plugin marketplace](https://harborclient.com/plugins). This guide covers package layout, the manifest, APIs, examples, and the development workflow.

## Guide

- [Install](/install) — add `@harborclient/sdk` to your plugin project
- [Quick start](/usage) — minimal renderer and main entry examples
- [Package layout](/package-layout) — directory structure for a `.hcp` package
- [Manifest](/manifest) — `manifest.json` fields, metadata, and contribution types
- [Permissions](/permissions) — capability model and install-time grants
- [Architecture](/architecture) — renderer vs main runtimes and plugin lifecycle
- [Building](/building) — bundling and packaging as `.hcp`
- [Dev workflow](/dev-workflow) — unpacked loading, hot reload, and startup options
- [Renderer API](/renderer-overview) — `PluginContext`, React/JSX, and host integration
- [UI contributions](/renderer-ui) — settings panels, tabs, menus, and toolbar actions
- [Themes and storage](/renderer-data) — themes, commands, storage, and filesystem
- [Main API](/main-api) — HTTP hooks and IPC in the SES utilityProcess
- [Examples](/examples/) — request logger, audit tab, and Solarized theme
- [Marketplace](/marketplace) — publish to the HarborClient plugin catalog
- [Performance](/performance) — IPC and rendering best practices
- [Plugins vs scripts](/vs-request-scripts) — how plugins differ from request scripts
