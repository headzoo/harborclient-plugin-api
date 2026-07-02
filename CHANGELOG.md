# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 1.0.20 - 2026-07-02

- Enhance TabCloseButton component with tabIndex prop for improved accessibility. (`4053939`)
- Enhance SegmentedTabs component with keyboard navigation improvements. (`6ec88d2`)

## 1.0.19 - 2026-07-02

- Enhance MethodSelect component with dynamic method color classes. (`6fbc2f2`)

## 1.0.18 - 2026-07-02

- Refactor SegmentedTabs component styles for improved layout and accessibility. (`5993349`)

## 1.0.17 - 2026-07-02

- Refactor SegmentedTabs component for improved accessibility attributes. (`c11f504`)
- Enhance SegmentedTabs component with editable tab visibility features. (`144d978`)

## 1.0.16 - 2026-07-02

- Enhance Radio component styling with new radioDot class. (`fe1ca3e`)

## 1.0.15 - 2026-07-02

- Enhance VariableInput and form styles for improved usability. (`fc6eca5`)

## 1.0.14 - 2026-07-02

- Refactor PageHeader component for improved readability. (`1654121`)
- Enhance FormGroup and PageHeader components for improved usability and styling. (`739a87b`)

## 1.0.13 - 2026-07-02

- Refactor FormGroup component to improve ID resolution logic. (`6ad450d`)
- Enhance FormGroup and VariableInput components for improved usability and styling. (`673bf2b`)

## 1.0.12 - 2026-07-01

- Enhance PageHeader component styling for improved visual hierarchy. (`d6dbfe6`)

## 1.0.11 - 2026-07-01

- Enhance PageSidebar component styling for improved user interaction. (`b3c5fd9`)

## 1.0.10 - 2026-07-01

- Update PageSidebar component styles for improved layout. (`3e63d44`)

## 1.0.9 - 2026-07-01

- chore: update version to 1.0.8 and enhance BackButton component accessibility and styling. (`bec3759`)

## 1.0.7 - 2026-07-01

- Refactor Modal and SegmentedTabs components for improved code clarity. (`0ac6fce`)
- Enhance component styling with consistent class prefixes. (`d86919a`)

## 1.0.6 - 2026-07-01

- Refactor PageHeader and SidebarLayout components for improved styling. (`49caa57`)

## 1.0.5 - 2026-07-01

- Update PageHeader component styles to improve padding and layout consistency. (`7205c06`)

## 1.0.4 - 2026-07-01

- Add linting instructions to AGENTS.md. (`440e1de`)
- Update PageHeader component styles for improved layout. (`88aa4e7`)
- Test changelog hook. (`12b6780`)

## 1.0.1 - 2026-06-30

- `createStorageStore` now hydrates from storage on creation.

## 0.6.17 - 2026-06-30

- Add `@harborclient/sdk/react-dom` with host-delegated `createPortal` for plugin portals.
- Add `portalToBody` helper in `@harborclient/sdk/components` for modals that must escape overflow-hidden plugin webview containers.

## 0.7.0 - 2026-06-30

- Add `registerTheme(hc, theme)` and `defineTheme(theme)` helpers for theme plugins — `registerTheme` registers a theme and pushes its disposable onto `hc.subscriptions`.
- Add `requestKey` to `RequestTabContext` and `ResponseTabContext` — stable per-request identifier for namespacing persistent plugin state (`req:<id>` for saved requests, `METHOD url` fallback for unsaved tabs).

## 0.6.11 - 2026-06-29

- Fix Checkbox and Radio click target alignment: pass pointer events through the decorative box/circle and pin the wrapper to 18px so the overlay input matches the visible control.

## 0.4.4 - 2026-06-26

- Document global variables for plugins: precedence chain, `RequestTabContext.variables`, and `harborclient:updateGlobalVariables` host command.
- Clarify `RequestTabContext.variables` JSDoc to include globals in the merge order.

## 0.4.3 - 2026-06-25

- Rename npm package from `@harborclient/plugin-api` to `@harborclient/sdk`.
- Move documentation site from `harborclient.github.io/plugin-api/` to `harborclient.github.io/sdk/`.
- **Breaking:** Plugin authors must update imports, `jsxImportSource`, and esbuild `--jsx-import-source` to `@harborclient/sdk`, then rebuild plugin bundles.

## 0.4.0 - 2026-06-25

- Add `@harborclient/sdk/signing` with `signPlugin`, `verifyPlugin`, and CLI tools (`hc-plugin-sign`, `hc-plugin-verify`).

## 0.3.3 - 2026-06-25

- Add `hc.host.sendRequest()` to send the active request editor tab from plugins.

## 0.3.1 - 2026-06-24

- Export utility subpaths: `./http`, `./ui`, `./storage`, `./clipboard`, `./runtime-utils`, and `./store`.
- Restore utility module sources under `src/` so `tsc` rebuilds them (previously only committed in `dist/`).

## 0.3.0 - 2026-06-24

- Add renderer `hc.http.onAfterSend`, `hc.ipc.invoke`, and `hc.host` (`openRequestDraft`, `loadRequest`) to `PluginContext`.
- Add `OpenRequestDraftPayload`, `OpenRequestDraftParam`, `PluginRendererHttp`, `PluginIpcInvoker`, and `PluginHost` types.
- Extend `PluginHttpRequest` with `bodyType`, `params`, `sourceRequestId`, and `sourceRequestName`.

## 0.2.5 - 2026-06-24

- Add React/JSX runtime (`installReact`, `createPluginComponent`, `@harborclient/sdk/react`, `@harborclient/sdk/jsx-runtime`).
- Add `pluginId` to `PluginContext`.

## 0.2.1 - 2026-06-24

- Extend `RequestTabContext` with `variables` for merged collection and environment {{key}} substitution.

## 0.2.0 - 2026-06-24

- Add `AuthType`, `AuthConfig`, and `BodyType` types for plugin authors.
- Extend `RequestDraft` with `auth` and `body_type` fields.
- Extend `RequestTabContext` with `collectionAuth` and `collectionHeaders` for send-time defaults.

## 0.1.2 - 2026-06-24

- Add main-process types (`MainPluginContext`, `PluginHttp`, `PluginIpc`, `PluginHttpRequest`, `PluginHttpResponse`) and `@harborclient/sdk/main` subpath export.
- Add renderer `PluginFs` types and `fs` on `PluginContext`.

## 0.1.1 - 2026-06-24

- Initial standalone npm package extracted from HarborClient monorepo.
