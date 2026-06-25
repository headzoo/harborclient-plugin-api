import type * as React from 'react';

/**
 * Installs the HarborClient renderer React instance for plugin JSX and hooks.
 *
 * Call once at the start of `activate(hc)` before registering UI contributions.
 *
 * @param react - React namespace from `hc.react`.
 */
export function installReact(react: typeof React): void;

/**
 * Creates a React component from a factory that receives the host React namespace.
 *
 * @param factory - Builds a component type using hooks or createElement from host React.
 * @returns Component safe to pass to `hc.ui.register*` registration APIs.
 */
export function createPluginComponent<P extends Record<string, unknown>>(
  factory: (react: typeof React) => React.ComponentType<P>
): React.ComponentType<P>;
