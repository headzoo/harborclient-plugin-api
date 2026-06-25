# @harborclient/plugin-api

**Full documentation:** [https://harborclient.github.io/plugin-api/](https://harborclient.github.io/plugin-api/)

**TypeScript definitions and React runtime helpers for HarborClient plugin development.**

`@harborclient/plugin-api` is a dev dependency for HarborClient plugin authors:

- **JSX runtime:** Forward to the host's React instance via `installReact(hc.react)` — do not bundle React in your plugin.
- **Renderer types:** `PluginContext`, hooks from `@harborclient/plugin-api/react`, and esbuild/TypeScript JSX configuration.
- **Main-process types:** `MainPluginContext` from `@harborclient/plugin-api/main` for HTTP hooks and custom IPC.

## Documentation

| Topic | Link |
| --- | --- |
| Getting started | [Introduction](https://harborclient.github.io/plugin-api/) |
| Installation | [Install](https://harborclient.github.io/plugin-api/install) |
| Usage | [Usage](https://harborclient.github.io/plugin-api/usage) |

Canonical docs live in [`docs/`](./docs/). Edit those pages directly, then run `pnpm docs:build:nav` to refresh the VitePress sidebar.

## Development

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm docs:serve    # VitePress dev server with nav watcher
pnpm docs:build    # production docs build
```

## License

MIT
