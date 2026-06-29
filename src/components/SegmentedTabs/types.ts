import type { ReactNode } from 'react';

export interface TabItem<T extends string> {
  /**
   * Unique tab identifier.
   */
  value: T;

  /**
   * Tab label or custom content.
   */
  label: ReactNode;

  /**
   * When true, the tab is not rendered.
   */
  hidden?: boolean;

  /**
   * When true, the tab button is disabled.
   */
  disabled?: boolean;

  /**
   * When true, renders a small dot indicating the tab has values set.
   */
  indicator?: boolean;
}
