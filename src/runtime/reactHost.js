/** @type {typeof import('react') | null} */
let hostReact = null;

/**
 * Installs the HarborClient renderer React instance for plugin JSX and hooks.
 *
 * @param {typeof import('react')} react - React namespace from `hc.react`.
 */
export function setHostReact(react) {
  hostReact = react;
}

/**
 * Returns the installed host React instance.
 *
 * @returns {typeof import('react')} Host React namespace.
 * @throws {Error} When {@link setHostReact} has not been called yet.
 */
export function requireHostReact() {
  if (hostReact == null) {
    throw new Error(
      'Plugin React host is not installed. Call installReact(hc.react) at the start of activate().'
    );
  }
  return hostReact;
}
