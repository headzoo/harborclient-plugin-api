import { useCallback, useContext } from '@harborclient/sdk/react';
import type { JSX, KeyboardEvent, ReactNode } from 'react';
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

  /**
   * Moves focus back to the owning tab when ArrowUp is pressed inside the panel,
   * except inside CodeMirror editors where Up should edit text.
   *
   * @param event - Keyboard event from the tab panel container.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key !== 'ArrowUp' || event.defaultPrevented) return;

      const panel = event.currentTarget;
      if (!panel.contains(document.activeElement)) return;

      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest('.cm-editor')) return;

      const tab = document.getElementById(context.getTabId(value));
      if (tab instanceof HTMLElement) {
        event.preventDefault();
        tab.focus();
      }
    },
    [context, value]
  );

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={context.getPanelId(value)}
      aria-labelledby={context.getTabId(value)}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
