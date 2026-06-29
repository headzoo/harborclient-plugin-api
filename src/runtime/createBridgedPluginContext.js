import { bridgeInvoke, bridgeOn } from './hcBridge.js';
import {
  getContributionComponent,
  getContributionHeaderActions,
  getContributionIndicator,
  registerContributionComponent,
  registerContributionHeaderActions,
  registerContributionIndicator
} from './contributionRegistry.js';
import { setHostReact } from './reactHost.js';

/** @type {Map<string, Set<(...args: unknown[]) => void | Promise<void>>>} */
const commandHandlers = new Map();

/**
 * Parses a view-host role string into agent vs view contribution id.
 *
 * @param {string | null | undefined} role - Role query parameter from the shell URL.
 * @returns {{ mode: 'agent' | 'view'; contributionId?: string }}
 */
export function parseViewHostRole(role) {
  if (role == null || role === 'agent') {
    return { mode: 'agent' };
  }
  if (role.startsWith('view:')) {
    return { mode: 'view', contributionId: role.slice('view:'.length) };
  }
  if (role === 'view') {
    return { mode: 'view' };
  }
  return { mode: 'agent' };
}

/**
 * Builds a disposable handle that removes one command handler registration.
 *
 * @param {string} scopedId - Namespaced command id.
 * @param {(...args: unknown[]) => void | Promise<void>} handler - Handler to remove.
 * @returns {{ dispose: () => void }}
 */
function createCommandDisposable(scopedId, handler) {
  return {
    dispose: () => {
      const handlers = commandHandlers.get(scopedId);
      if (!handlers) {
        return;
      }
      handlers.delete(handler);
      if (handlers.size === 0) {
        commandHandlers.delete(scopedId);
      }
    }
  };
}

/**
 * Executes a registered plugin command inside this webview realm.
 *
 * @param {string} pluginId - Plugin manifest id.
 * @param {string} commandId - Command id declared in the manifest.
 * @param {unknown[]} args - Arguments passed to the handler.
 */
export async function executeLocalPluginCommand(pluginId, commandId, ...args) {
  const scopedId = `${pluginId}:${commandId}`;
  const handlers = commandHandlers.get(scopedId);
  if (!handlers) {
    throw new Error(`Unknown plugin command: ${scopedId}`);
  }
  for (const handler of handlers) {
    await handler(...args);
  }
}

/**
 * Creates the plugin activation context backed by the main-process broker.
 *
 * @param {object} options - Activation options parsed from the shell URL.
 * @param {string} options.pluginId - Plugin manifest id.
 * @param {'agent' | 'view'} options.mode - Agent runs logic; view renders one contribution.
 * @param {string | undefined} options.contributionId - Manifest contribution id for view mode.
 * @param {typeof import('react')} options.react - React namespace for this webview realm.
 * @param {Record<string, unknown>} options.manifest - Parsed plugin manifest.
 * @returns {import('../types').PluginContext}
 */
export function createBridgedPluginContext({ pluginId, mode, contributionId, react, manifest }) {
  const subscriptions = [];
  const permissions = new Set(manifest.permissions ?? []);
  const isAgent = mode === 'agent';

  /**
   * Asserts that the plugin declared a permission in its manifest.
   *
   * @param {string} permission - Required permission flag.
   */
  const assertPermission = (permission) => {
    if (!permissions.has(permission)) {
      throw new Error(`Plugin ${pluginId} lacks permission: ${permission}`);
    }
  };

  /**
   * Asserts UI permission for contribution registration.
   */
  const assertUi = () => assertPermission('ui');

  /**
   * Returns whether UI registration should run in this webview role.
   */
  const canRegisterUi = () => isAgent || mode === 'view';

  /**
   * Asserts that a contribution id is declared in manifest.contributes.
   *
   * @param {string} key - contributes.* key.
   * @param {string} id - Contribution id.
   */
  const assertManifestContribution = (key, id) => {
    const entries = manifest.contributes?.[key];
    if (!Array.isArray(entries) || !entries.some((entry) => entry.id === id)) {
      throw new Error(`Contribution id "${id}" is not declared in manifest.contributes.${key}.`);
    }
  };

  /**
   * Asserts that a menu command is declared in manifest.contributes.menus.
   *
   * @param {string} command - Command id referenced by the menu item.
   */
  const assertManifestMenuCommand = (command) => {
    const entries = manifest.contributes?.menus;
    if (!Array.isArray(entries) || !entries.some((entry) => entry.command === command)) {
      throw new Error(`Command "${command}" is not declared in manifest.contributes.menus.`);
    }
  };

  /**
   * Registers a UI contribution locally and forwards metadata to the host when agent.
   *
   * @param {string} kind - Contribution bucket key.
   * @param {string} id - Manifest contribution id.
   * @param {Record<string, unknown>} metadata - Serializable metadata for the host registry.
   * @param {unknown} component - React component registered in this realm.
   * @param {object} [options] - Optional indicator/headerActions components.
   * @param {unknown} [options.indicator] - Footer panel indicator component.
   * @param {unknown} [options.headerActions] - Sidebar section header actions component.
   * @returns {{ dispose: () => void }}
   */
  const registerUiContribution = (kind, id, metadata, component, options = {}) => {
    assertUi();
    registerContributionComponent(kind, id, component);
    if (options.indicator) {
      registerContributionIndicator(id, options.indicator);
    }
    if (options.headerActions) {
      registerContributionHeaderActions(id, options.headerActions);
    }

    if (isAgent) {
      void bridgeInvoke('registerContribution', {
        kind,
        contribution: { pluginId, ...metadata }
      });
    }

    return {
      dispose: () => {
        if (isAgent) {
          void bridgeInvoke('unregisterContribution', { kind, contributionId: id });
        }
      }
    };
  };

  /**
   * No-op UI registration in view webviews (agent owns metadata).
   *
   * @returns {{ dispose: () => void }}
   */
  const noopDisposable = () => ({ dispose: () => {} });

  setHostReact(react);

  return {
    pluginId,
    react,
    subscriptions,
    storage: {
      get: async (key) => {
        assertPermission('storage');
        return bridgeInvoke('storage.get', { key });
      },
      set: async (key, value) => {
        assertPermission('storage');
        await bridgeInvoke('storage.set', { key, value });
      }
    },
    database: {
      query: (mode, sql, params, txnId) => {
        assertPermission('database');
        return bridgeInvoke('database.query', { mode, sql, params, txnId });
      },
      exec: (sql) => {
        assertPermission('database');
        return bridgeInvoke('database.exec', { sql });
      },
      beginTransaction: () => {
        assertPermission('database');
        return bridgeInvoke('database.beginTransaction');
      },
      endTransaction: (txnId, action) => {
        assertPermission('database');
        return bridgeInvoke('database.endTransaction', { txnId, action });
      }
    },
    fs: {
      pickFile: async (options) => {
        assertPermission('filesystem:pick');
        return bridgeInvoke('fs.pickFile', { options });
      },
      pickDirectory: async (defaultPath) => {
        assertPermission('filesystem:pick');
        return bridgeInvoke('fs.pickDirectory', { defaultPath: defaultPath ?? '' });
      },
      saveFile: async (content, options) => {
        assertPermission('filesystem:pick');
        return bridgeInvoke('fs.saveFile', { content, options });
      },
      readFile: async (path) => {
        assertPermission('filesystem:read');
        return bridgeInvoke('fs.readFile', { path });
      },
      writeFile: async (path, content) => {
        assertPermission('filesystem:write');
        await bridgeInvoke('fs.writeFile', { path, content });
      },
      watchFile: (path, listener) => {
        assertPermission('filesystem:read');
        const unsubscribe = bridgeOn(`fs.watch:${path}`, () => {
          listener(path);
        });
        void bridgeInvoke('fs.watchFile', { path });
        return { dispose: unsubscribe };
      }
    },
    commands: {
      register: (id, handler) => {
        assertUi();
        assertManifestContribution('commands', id);
        if (!isAgent) {
          return noopDisposable();
        }
        const scopedId = `${pluginId}:${id}`;
        const handlers = commandHandlers.get(scopedId) ?? new Set();
        handlers.add(handler);
        commandHandlers.set(scopedId, handlers);
        return createCommandDisposable(scopedId, handler);
      },
      execute: async (id, ...args) => {
        const [ownerId, commandId] = id.includes(':') ? id.split(':', 2) : [pluginId, id];
        if (ownerId === pluginId) {
          await executeLocalPluginCommand(ownerId, commandId, ...args);
          return;
        }
        await bridgeInvoke('commands.executeRemote', { pluginId: ownerId, commandId, args });
      }
    },
    themes: {
      register: (theme) => {
        assertUi();
        assertManifestContribution('themes', theme.id);
        if (!isAgent) {
          return noopDisposable();
        }
        void bridgeInvoke('themes.register', { theme });
        return {
          dispose: () => {
            void bridgeInvoke('themes.unregister', { themeId: theme.id });
          }
        };
      },
      getActive: async () => bridgeInvoke('themes.getActive'),
      onDidChange: (listener) => {
        const unsubscribe = bridgeOn('themes.changed', listener);
        void bridgeInvoke('themes.getActive').then(listener);
        return { dispose: unsubscribe };
      }
    },
    ui: {
      registerSettingsSection: (section) => {
        assertManifestContribution('settingsSections', section.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'settingsSections',
          section.id,
          {
            id: `plugin:${pluginId}:${section.id}`,
            title: section.title,
            contributionId: section.id
          },
          section.Component
        );
      },
      registerSidebarPanel: (panel) => {
        assertManifestContribution('sidebarPanels', panel.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'sidebarPanels',
          panel.id,
          {
            id: `plugin:${pluginId}:${panel.id}`,
            title: panel.title,
            icon: panel.icon,
            order: panel.order,
            contributionId: panel.id
          },
          panel.Component
        );
      },
      registerSidebarSection: (section) => {
        assertManifestContribution('sidebarSections', section.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'sidebarSections',
          section.id,
          {
            id: `plugin:${pluginId}:${section.id}`,
            title: section.title,
            order: section.order,
            contributionId: section.id,
            hasHeaderActions: Boolean(section.headerActions)
          },
          section.Component,
          { headerActions: section.headerActions }
        );
      },
      registerMainView: (view) => {
        assertManifestContribution('mainViews', view.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'mainViews',
          view.id,
          { id: `plugin:${pluginId}:${view.id}`, title: view.title, contributionId: view.id },
          view.Component
        );
      },
      registerRequestTab: (tab) => {
        assertManifestContribution('requestTabs', tab.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'requestTabs',
          tab.id,
          {
            id: `plugin:${pluginId}:${tab.id}`,
            title: tab.title,
            order: tab.order,
            contributionId: tab.id
          },
          tab.Component
        );
      },
      registerResponseTab: (tab) => {
        assertManifestContribution('responseTabs', tab.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'responseTabs',
          tab.id,
          {
            id: `plugin:${pluginId}:${tab.id}`,
            title: tab.title,
            order: tab.order,
            when: tab.when,
            contributionId: tab.id
          },
          tab.Component
        );
      },
      registerCollectionSettingsTab: (tab) => {
        assertManifestContribution('collectionSettingsTabs', tab.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'collectionSettingsTabs',
          tab.id,
          {
            id: `plugin:${pluginId}:${tab.id}`,
            title: tab.title,
            order: tab.order,
            contributionId: tab.id
          },
          tab.Component
        );
      },
      registerFooterPanel: (panel) => {
        assertManifestContribution('footerPanels', panel.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'footerPanels',
          panel.id,
          {
            id: `plugin:${pluginId}:${panel.id}`,
            title: panel.title,
            contributionId: panel.id,
            hasIndicator: Boolean(panel.Indicator)
          },
          panel.Component,
          { indicator: panel.Indicator }
        );
      },
      registerMenuItem: (item) => {
        assertManifestMenuCommand(item.command);
        if (!isAgent) {
          return noopDisposable();
        }
        void bridgeInvoke('registerContribution', {
          kind: 'menuItems',
          contribution: {
            pluginId,
            menu: item.menu,
            command: item.command,
            label: item.label,
            group: item.group,
            order: item.order
          }
        });
        return {
          dispose: () => {
            void bridgeInvoke('unregisterContribution', {
              kind: 'menuItems',
              contributionId: `${item.menu}:${item.command}`
            });
          }
        };
      },
      registerRequestToolbarAction: (action) => {
        assertManifestContribution('requestToolbarActions', action.id);
        if (!isAgent) {
          return noopDisposable();
        }
        void bridgeInvoke('registerContribution', {
          kind: 'requestToolbarActions',
          contribution: {
            pluginId,
            id: action.id,
            title: action.title,
            command: action.command,
            icon: action.icon,
            order: action.order
          }
        });
        return {
          dispose: () => {
            void bridgeInvoke('unregisterContribution', {
              kind: 'requestToolbarActions',
              contributionId: action.id
            });
          }
        };
      },
      registerContextMenuItem: (item) => {
        assertManifestContribution('contextMenus', item.id);
        if (!isAgent) {
          return noopDisposable();
        }
        void bridgeInvoke('registerContribution', {
          kind: 'contextMenuItems',
          contribution: {
            pluginId,
            id: item.id,
            title: item.title,
            command: item.command,
            when: item.when,
            group: item.group,
            order: item.order
          }
        });
        return {
          dispose: () => {
            void bridgeInvoke('unregisterContribution', {
              kind: 'contextMenuItems',
              contributionId: item.id
            });
          }
        };
      },
      registerStatusBarItem: (item) => {
        assertManifestContribution('statusBarItems', item.id);
        if (!canRegisterUi()) {
          return noopDisposable();
        }
        return registerUiContribution(
          'statusBarItems',
          item.id,
          {
            id: `plugin:${pluginId}:${item.id}`,
            alignment: item.alignment,
            order: item.order,
            contributionId: item.id
          },
          item.Component
        );
      },
      showToast: (message, options) => {
        assertUi();
        void bridgeInvoke('ui.showToast', { message, options });
      }
    },
    http: {
      onAfterSend: (handler) => {
        assertPermission('http');
        if (!isAgent) {
          return noopDisposable();
        }
        const unsubscribe = bridgeOn('http.afterSend', handler);
        return { dispose: unsubscribe };
      }
    },
    ipc: {
      invoke: async (channel, ...args) => {
        assertPermission('ipc');
        return bridgeInvoke('ipc.invoke', { channel, args });
      }
    },
    host: {
      openRequestDraft: async (payload) => {
        assertUi();
        await bridgeInvoke('host.openRequestDraft', { payload });
      },
      loadRequest: async (requestId) => {
        assertUi();
        await bridgeInvoke('host.loadRequest', { requestId });
      },
      sendRequest: async () => {
        assertUi();
        await bridgeInvoke('host.sendRequest');
      },
      createEnvironmentWithVariables: async (name, variables) => {
        assertUi();
        return bridgeInvoke('host.createEnvironmentWithVariables', { name, variables });
      },
      updateEnvironmentVariables: async (environmentId, variables) => {
        assertUi();
        await bridgeInvoke('host.updateEnvironmentVariables', { environmentId, variables });
      },
      createCollection: async (payload) => {
        assertUi();
        return bridgeInvoke('host.createCollection', { payload });
      },
      listCollectionRequests: async (collectionId, folderId) => {
        assertUi();
        return bridgeInvoke('host.listCollectionRequests', { collectionId, folderId });
      },
      getCollectionMetadata: async (collectionId) => {
        assertUi();
        return bridgeInvoke('host.getCollectionMetadata', { collectionId });
      },
      logRequestToConsole: async (payload) => {
        assertUi();
        await bridgeInvoke('host.logRequestToConsole', { payload });
      },
      sendHttpRequest: async (input) => {
        assertUi();
        return bridgeInvoke('host.sendHttpRequest', { input });
      },
      clearResponse: async () => {
        assertUi();
        await bridgeInvoke('host.clearResponse');
      }
    }
  };
}

/**
 * Maps a manifest contributes key to the contribution registry bucket name.
 *
 * @param {string} contributionId - Manifest contribution id for view mode.
 * @returns {string | undefined}
 */
export function resolveContributionKindFromUrl(contributionId, searchParams) {
  const kind = searchParams.get('kind');
  return kind ?? undefined;
}

/**
 * Mounts one contribution component into the view webview root element.
 *
 * @param {object} options - Mount options.
 * @param {typeof import('react')} options.react - React namespace.
 * @param {typeof import('react-dom/client')} options.reactDom - React DOM client namespace.
 * @param {string} options.kind - Contribution bucket.
 * @param {string} options.contributionId - Manifest contribution id.
 * @param {HTMLElement} options.root - DOM mount target.
 * @param {'content' | 'headerActions' | 'indicator'} [options.slot] - Contribution sub-slot.
 * @returns {() => void} Cleanup function that unmounts the React root.
 */
export function mountContributionView({
  react,
  reactDom,
  kind,
  contributionId,
  root,
  slot = 'content'
}) {
  let Component;
  if (slot === 'headerActions') {
    Component = getContributionHeaderActions(contributionId);
  } else if (slot === 'indicator') {
    Component = getContributionIndicator(contributionId);
  } else {
    Component = getContributionComponent(kind, contributionId);
  }
  if (Component == null) {
    throw new Error(`Unknown plugin contribution: ${kind}:${contributionId}`);
  }

  /** @type {unknown} */
  let currentContext = null;

  const needsContext =
    kind === 'requestTabs' || kind === 'responseTabs' || kind === 'collectionSettingsTabs';

  const reactRoot = reactDom.createRoot(root);

  /**
   * Renders the contribution with the latest pushed context snapshot. For
   * context-bearing contributions the first render is deferred until a context
   * snapshot is available so the component never receives a null context.
   */
  const render = () => {
    if (needsContext && currentContext == null) {
      return;
    }
    const element = needsContext
      ? react.createElement(Component, { context: currentContext })
      : react.createElement(Component);
    reactRoot.render(element);
  };

  const unsubscribe = bridgeOn('view.context', (payload) => {
    currentContext = payload;
    render();
  });

  if (needsContext) {
    // The host pushes context on mount/dom-ready, which can race ahead of this
    // subscription, so pull the current snapshot now that we are listening.
    void bridgeInvoke('view.getContext')
      .then((context) => {
        if (context != null && currentContext == null) {
          currentContext = context;
          render();
        }
      })
      .catch(() => {});
  }

  render();

  return () => {
    unsubscribe();
  };
}

export { getContributionComponent, getContributionHeaderActions, getContributionIndicator };
