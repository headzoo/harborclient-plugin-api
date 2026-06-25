import { setHostReact, requireHostReact } from './reactHost.js';

/**
 * Installs the HarborClient renderer React instance for plugin JSX and hooks.
 *
 * Call once at the start of `activate(hc)` before registering UI contributions.
 *
 * @param {typeof import('react')} react - React namespace from `hc.react`.
 */
export function installReact(react) {
  setHostReact(react);
}

/**
 * Creates a React component from a factory that receives the host React namespace.
 *
 * Useful when you need hooks or createElement in the same module as activate()
 * without importing React directly.
 *
 * @template {Record<string, unknown>} P
 * @param {(react: typeof import('react')) => import('react').ComponentType<P>} factory
 * @returns {import('react').ComponentType<P>}
 */
export function createPluginComponent(factory) {
  /** @type {import('react').ComponentType<P> | null} */
  let Component = null;

  /**
   * Lazily builds the component on first render after installReact().
   *
   * @param {P} props - Component props.
   * @returns {import('react').ReactElement | null}
   */
  function PluginComponent(props) {
    if (Component == null) {
      Component = factory(requireHostReact());
    }
    const react = requireHostReact();
    return react.createElement(Component, props);
  }

  return PluginComponent;
}
