# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Add renderer `hc.http.onAfterSend`, `hc.ipc.invoke`, and `hc.host` (`openRequestDraft`, `loadRequest`) to `PluginContext`.
- Add `OpenRequestDraftPayload`, `OpenRequestDraftParam`, `PluginRendererHttp`, `PluginIpcInvoker`, and `PluginHost` types.
- Extend `PluginHttpRequest` with `bodyType`, `params`, `sourceRequestId`, and `sourceRequestName`.

## 0.2.3 - 2026-06-24

- Add React/JSX runtime (`installReact`, `createPluginComponent`, `@harborclient/plugin-api/react`, `@harborclient/plugin-api/jsx-runtime`).
- Add `pluginId` to `PluginContext`.

## 0.2.1 - 2026-06-24

- Extend `RequestTabContext` with `variables` for merged collection and environment {{key}} substitution.

## 0.2.0 - 2026-06-24

- Add `AuthType`, `AuthConfig`, and `BodyType` types for plugin authors.
- Extend `RequestDraft` with `auth` and `body_type` fields.
- Extend `RequestTabContext` with `collectionAuth` and `collectionHeaders` for send-time defaults.

## 0.1.2 - 2026-06-24

- Add main-process types (`MainPluginContext`, `PluginHttp`, `PluginIpc`, `PluginHttpRequest`, `PluginHttpResponse`) and `@harborclient/plugin-api/main` subpath export.
- Add renderer `PluginFs` types and `fs` on `PluginContext`.

## 0.1.1 - 2026-06-24

- Initial standalone npm package extracted from HarborClient monorepo.
