/**
 * In-memory contribution registry for one plugin activation inside an isolated webview.
 */

/** @type {Map<string, unknown>} */
const components = new Map();

/** @type {Map<string, unknown>} */
const indicators = new Map();

/** @type {Map<string, unknown>} */
const headerActions = new Map();

/**
 * Stores a UI contribution component keyed by manifest contribution id.
 *
 * @param {string} kind - Contribution bucket (requestTabs, sidebarPanels, etc.).
 * @param {string} contributionId - Manifest contributes.* id.
 * @param {unknown} component - React component reference.
 */
export function registerContributionComponent(kind, contributionId, component) {
  components.set(`${kind}:${contributionId}`, component);
}

/**
 * Stores an optional footer panel indicator component.
 *
 * @param {string} contributionId - Manifest footerPanels id.
 * @param {unknown} component - React indicator component.
 */
export function registerContributionIndicator(contributionId, component) {
  indicators.set(contributionId, component);
}

/**
 * Stores an optional sidebar section headerActions component.
 *
 * @param {string} contributionId - Manifest sidebarSections id.
 * @param {unknown} component - React headerActions component.
 */
export function registerContributionHeaderActions(contributionId, component) {
  headerActions.set(contributionId, component);
}

/**
 * Returns a registered contribution component.
 *
 * @param {string} kind - Contribution bucket.
 * @param {string} contributionId - Manifest contributes.* id.
 * @returns {unknown | undefined}
 */
export function getContributionComponent(kind, contributionId) {
  return components.get(`${kind}:${contributionId}`);
}

/**
 * Returns a registered footer panel indicator component.
 *
 * @param {string} contributionId - Manifest footerPanels id.
 * @returns {unknown | undefined}
 */
export function getContributionIndicator(contributionId) {
  return indicators.get(contributionId);
}

/**
 * Returns a registered sidebar section headerActions component.
 *
 * @param {string} contributionId - Manifest sidebarSections id.
 * @returns {unknown | undefined}
 */
export function getContributionHeaderActions(contributionId) {
  return headerActions.get(contributionId);
}

/**
 * Clears all stored contribution components for a fresh activation.
 */
export function clearContributionRegistry() {
  components.clear();
  indicators.clear();
  headerActions.clear();
}
