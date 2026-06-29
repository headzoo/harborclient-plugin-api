import { useContext } from '@harborclient/sdk/react';
import type { JSX, ReactNode } from 'react';
import { SegmentedTabsContext } from './SegmentedTabsContext.js';

interface Props<T extends string> {
  /**
   * Tab value that controls visibility of this panel.
   */
  value: T;

  /**
   * Panel content shown when this tab is selected.
   */
  children: ReactNode;

  /**
   * Additional CSS classes for the panel container.
   */
  className?: string;
}

/**
 * Renders a WAI-ARIA tab panel linked to the matching tab in the parent group.
 */
export function SegmentedTabPanel<T extends string>({
  value,
  children,
  className
}: Props<T>): JSX.Element | null {
  const context = useContext(SegmentedTabsContext);
  if (!context) {
    throw new Error('SegmentedTabPanel must be used within SegmentedTabsGroup');
  }

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={context.getPanelId(value)}
      aria-labelledby={context.getTabId(value)}
      className={className}
    >
      {children}
    </div>
  );
}
