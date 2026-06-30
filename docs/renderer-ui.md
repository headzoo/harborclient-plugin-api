# UI contributions

All `hc.ui.register*` methods:

- Require the `ui` permission.
- Return a `Disposable` that unregisters the contribution when called.
- Require an `id` that matches an entry in the corresponding `manifest.contributes.*` array.

Push every returned disposable onto `hc.subscriptions` so the host cleans up on deactivation.

See [Manifest](/manifest#contribution-types) for the manifest keys that correspond to each registrar.

## hc.ui.registerSettingsSection(section)

**Signature:** `(section: SettingsSectionContribution) => Disposable`

**Manifest:** `contributes.settingsSections`

| Parameter   | Type                  | Description                   |
| ----------- | --------------------- | ----------------------------- |
| `id`        | `string`              | Settings section id           |
| `title`     | `string`              | Label in the Settings sidebar |
| `Component` | `React.ComponentType` | Panel content                 |

Registers a React component as a Settings panel alongside built-in sections (General, Storage, and so on).

```typescript
hc.subscriptions.push(
  hc.ui.registerSettingsSection({
    id: 'compactMode',
    title: 'Compact Mode',
    Component: CompactModePanel
  })
);
```

## hc.ui.registerSidebarPanel(panel)

**Signature:** `(panel: SidebarPanelContribution) => Disposable`

**Manifest:** `contributes.sidebarPanels`

| Parameter   | Type                  | Description                       |
| ----------- | --------------------- | --------------------------------- |
| `id`        | `string`              | Panel id                          |
| `title`     | `string`              | Label when switching sidebar mode |
| `icon`      | `string`              | Optional icon name                |
| `Component` | `React.ComponentType` | Full sidebar content              |
| `order`     | `number`              | Sort order among plugin panels    |

Registers a switchable left sidebar destination — a full-height panel the user selects instead of the default collections view.

```typescript
hc.subscriptions.push(
  hc.ui.registerSidebarPanel({
    id: 'myPlugin.panel',
    title: 'My Tools',
    icon: 'wrench',
    Component: MySidebarPanel
  })
);
```

## hc.ui.registerSidebarSection(section)

**Signature:** `(section: SidebarSectionContribution) => Disposable`

**Manifest:** `contributes.sidebarSections`

| Parameter       | Type                  | Description                                 |
| --------------- | --------------------- | ------------------------------------------- |
| `id`            | `string`              | Section id                                  |
| `title`         | `string`              | Collapsible section heading                 |
| `Component`     | `React.ComponentType` | Section body                                |
| `headerActions` | `React.ComponentType` | Optional controls in the section header row |
| `order`         | `number`              | Sort order below Collections / Environments |

Adds a collapsible block inside the scrollable sidebar, using the same pattern as the built-in Collections and Environments sections.

```typescript
hc.subscriptions.push(
  hc.ui.registerSidebarSection({
    id: 'myPlugin.section',
    title: 'Quick links',
    Component: QuickLinksSection,
    order: 100
  })
);
```

## hc.ui.registerMainView(view)

**Signature:** `(view: MainViewContribution) => Disposable`

**Manifest:** `contributes.mainViews`

| Parameter   | Type                  | Description                 |
| ----------- | --------------------- | --------------------------- |
| `id`        | `string`              | View id                     |
| `title`     | `string`              | Display name for navigation |
| `Component` | `React.ComponentType` | Full main-area content      |

Registers a full main-area overlay, replacing the request editor while open (same pattern as Team Hubs or Sharing Keys). Open the view with `hc.commands.execute` from a menu item or other trigger.

```typescript
hc.subscriptions.push(
  hc.ui.registerMainView({
    id: 'myPlugin.view',
    title: 'My Dashboard',
    Component: DashboardView
  })
);
```

## hc.ui.registerModal(modal)

**Signature:** `(modal: ModalContribution) => Disposable`

**Manifest:** `contributes.modals`

| Parameter   | Type                                         | Description                                     |
| ----------- | -------------------------------------------- | ----------------------------------------------- |
| `id`        | `string`                                     | Modal id                                        |
| `title`     | `string`                                     | Accessible title for the modal surface          |
| `Component` | `React.ComponentType<{ context?: unknown }>` | Modal body; receives `context` from `openModal` |

Registers a modal rendered in a full-window overlay at the application root. Open it with `hc.ui.openModal(modalId, context?)` and close it with `hc.ui.closeModal(modalId?)`. Requires the `ui` permission.

```typescript
hc.subscriptions.push(
  hc.ui.registerModal({
    id: 'myPlugin.editor',
    title: 'Edit item',
    Component: ({ context }) => <EditorModal context={context} />
  })
);

hc.ui.openModal('myPlugin.editor', { itemId: 'abc' });
```

## hc.ui.openModal(modalId, context?)

**Signature:** `(modalId: string, context?: unknown) => void`

**Manifest:** `contributes.modals` — `modalId` must match a registered modal contribution.

Opens the registered modal overlay in the host application window. Optional `context` is passed to the modal component as a `context` prop.

## hc.ui.closeModal(modalId?)

**Signature:** `(modalId?: string) => void`

Closes the open plugin modal overlay. When `modalId` is provided, the overlay closes only if that modal is currently open.

## hc.ui.registerRequestTab(tab)

**Signature:** `(tab: RequestTabContribution) => Disposable`

**Manifest:** `contributes.requestTabs`

| Parameter   | Type                                                  | Description                  |
| ----------- | ----------------------------------------------------- | ---------------------------- |
| `id`        | `string`                                              | Tab id                       |
| `title`     | `string`                                              | Tab label                    |
| `Component` | `React.ComponentType<{ context: RequestTabContext }>` | Tab content                  |
| `order`     | `number`                                              | Sort order among editor tabs |

Adds a segmented tab to the request editor (alongside Params, Headers, Body, and so on). The component receives `context.draft` for the active request, `context.response` when a response exists, and `context.variables` for merged global, collection, and environment substitution values (see [Global variables](/renderer-data#global-variables)).

```typescript
hc.subscriptions.push(
  hc.ui.registerRequestTab({
    id: 'myPlugin.requestTab',
    title: 'Audit',
    Component: AuditTab
  })
);
```

## hc.ui.registerResponseTab(tab)

**Signature:** `(tab: ResponseTabContribution) => Disposable`

**Manifest:** `contributes.responseTabs`

| Parameter   | Type                                                   | Description                                     |
| ----------- | ------------------------------------------------------ | ----------------------------------------------- |
| `id`        | `string`                                               | Tab id                                          |
| `title`     | `string`                                               | Tab label                                       |
| `Component` | `React.ComponentType<{ context: ResponseTabContext }>` | Tab content                                     |
| `order`     | `number`                                               | Sort order among response tabs                  |
| `when`      | `'always' \| 'hasResponse'`                            | When the tab is visible. Default `hasResponse`. |

Adds a tab to the response viewer (alongside Body, Headers, Tests).

```typescript
hc.subscriptions.push(
  hc.ui.registerResponseTab({
    id: 'myPlugin.responseTab',
    title: 'Summary',
    when: 'hasResponse',
    Component: ResponseSummaryTab
  })
);
```

## hc.ui.registerCollectionSettingsTab(tab)

**Signature:** `(tab: CollectionSettingsTabContribution) => Disposable`

**Manifest:** `contributes.collectionSettingsTabs`

| Parameter   | Type                                                             | Description                               |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `id`        | `string`                                                         | Tab id                                    |
| `title`     | `string`                                                         | Tab label                                 |
| `Component` | `React.ComponentType<{ context: CollectionSettingsTabContext }>` | Tab content                               |
| `order`     | `number`                                                         | Sort order among collection settings tabs |

Adds a segmented tab to Collection Settings (alongside General, Variables, Headers, and so on). The component receives `context.collectionId` and `context.readOnly`.

```typescript
hc.subscriptions.push(
  hc.ui.registerCollectionSettingsTab({
    id: 'myPlugin.collTab',
    title: 'Plugin',
    Component: CollectionPluginTab
  })
);
```

## hc.ui.registerFooterPanel(panel)

**Signature:** `(panel: FooterPanelContribution) => Disposable`

**Manifest:** `contributes.footerPanels`

| Parameter   | Type                  | Description                                                   |
| ----------- | --------------------- | ------------------------------------------------------------- |
| `id`        | `string`              | Panel id                                                      |
| `title`     | `string`              | Toggle label in the footer bar                                |
| `Component` | `React.ComponentType` | Slide-up panel content                                        |
| `Indicator` | `React.ComponentType` | Optional decoration beside the toggle label (e.g. active dot) |

Registers a slide-up footer panel using the same pattern as Console and Variables.
The host wraps your component in a resizable shell — you do not implement resize
logic yourself. The shell provides:

- A top drag handle (and keyboard resize on the handle)
- Per-panel height persistence in `localStorage` (`hc.footerPanel.<namespaced-id>`)
- A close button in the top-right corner

**Layout contract:** Your `Component` should fill the resizable area with
`flex h-full min-h-0 flex-col` and put scrollable content in a
`flex-1 overflow-auto` child. Leave roughly 32px of right padding on header
rows so controls do not sit under the host close button.

```typescript
hc.subscriptions.push(
  hc.ui.registerFooterPanel({
    id: 'myPlugin.footer',
    title: 'My Log',
    Component: PluginLogPanel
  })
);
```

Example panel structure:

```tsx
function PluginLogPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-control">
      <div className="flex shrink-0 items-center border-b border-separator px-3 py-2 pr-8">
        <h3 className="text-[14px] font-medium text-text">My Log</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{/* scrollable body */}</div>
    </div>
  );
}
```

## hc.ui.registerMenuItem(item)

**Signature:** `(item: MenuItemContribution) => Disposable`

**Manifest:** `contributes.menus` plus a matching `contributes.commands` entry

| Parameter | Type                                   | Description                 |
| --------- | -------------------------------------- | --------------------------- |
| `menu`    | `'file' \| 'edit' \| 'view' \| 'help'` | Target application menu     |
| `command` | `string`                               | Command id to run on click  |
| `label`   | `string`                               | Menu label override         |
| `group`   | `string`                               | Menu group for separators   |
| `order`   | `number`                               | Sort order within the group |

Adds an item to the application menu. Register the command handler with `hc.commands.register` separately.

```typescript
hc.commands.register('myPlugin.run', () => {
  hc.ui.showToast('Command ran');
});
hc.subscriptions.push(
  hc.ui.registerMenuItem({ menu: 'view', command: 'myPlugin.run', group: 'plugin' })
);
```

## hc.ui.registerRequestToolbarAction(action)

**Signature:** `(action: RequestToolbarActionContribution) => Disposable`

**Manifest:** `contributes.requestToolbarActions` plus a matching `contributes.commands` entry

| Parameter | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `id`      | `string` | Action id                       |
| `title`   | `string` | Button label or tooltip         |
| `command` | `string` | Command id to run on click      |
| `icon`    | `string` | Optional icon name              |
| `order`   | `number` | Sort order near the Send button |

Adds a button to the request URL bar toolbar.

```typescript
hc.commands.register('myPlugin.sendAction', () => {
  hc.ui.showToast('Pre-send check passed');
});
hc.subscriptions.push(
  hc.ui.registerRequestToolbarAction({
    id: 'myPlugin.sendAction',
    title: 'Run check',
    command: 'myPlugin.sendAction'
  })
);
```

## hc.ui.registerContextMenuItem(item)

**Signature:** `(item: ContextMenuItemContribution) => Disposable`

**Manifest:** `contributes.contextMenus` plus a matching `contributes.commands` entry

| Parameter | Type                                             | Description                                         |
| --------- | ------------------------------------------------ | --------------------------------------------------- |
| `id`      | `string`                                         | Menu item id                                        |
| `title`   | `string`                                         | Menu label                                          |
| `command` | `string`                                         | Command id; handler receives target context as args |
| `when`    | `'collection' \| 'folder' \| 'request'` or array | Sidebar row types                                   |
| `group`   | `string`                                         | Menu group                                          |
| `order`   | `number`                                         | Sort order within the group                         |

Adds an action to row context menus in the sidebar.

```typescript
hc.commands.register('myPlugin.requestMenu', (target) => {
  hc.ui.showToast(`Action on request ${target.requestId}`);
});
hc.subscriptions.push(
  hc.ui.registerContextMenuItem({
    id: 'myPlugin.requestMenu',
    title: 'Plugin action',
    command: 'myPlugin.requestMenu',
    when: 'request'
  })
);
```

## hc.ui.registerStatusBarItem(item)

**Signature:** `(item: StatusBarItemContribution) => Disposable`

**Manifest:** `contributes.statusBarItems`

| Parameter   | Type                  | Description                   |
| ----------- | --------------------- | ----------------------------- |
| `id`        | `string`              | Item id                       |
| `Component` | `React.ComponentType` | Status content                |
| `alignment` | `'left' \| 'right'`   | Footer side. Default `right`. |
| `order`     | `number`              | Sort order on that side       |

Adds a custom status indicator to the footer bar.

```typescript
hc.subscriptions.push(
  hc.ui.registerStatusBarItem({
    id: 'myPlugin.status',
    alignment: 'right',
    Component: PluginStatusBadge
  })
);
```

## hc.ui.showToast(message, options?)

**Signature:** `(message: string, options?: { duration?: number }) => void`

Shows a non-blocking toast for success or info feedback. Do not use toasts for errors that require acknowledgment — show those inline in your plugin UI instead.

```typescript
hc.ui.showToast('Settings saved', { duration: 3000 });
```
