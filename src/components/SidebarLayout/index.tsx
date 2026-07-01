import type { JSX, ReactNode } from 'react';

interface Props {
  /**
   * Sidebar navigation rendered in the left column.
   */
  sidebar: ReactNode;

  /**
   * Scrollable main content rendered in the right column.
   */
  children: ReactNode;

  /**
   * Additional Tailwind classes merged onto the outer flex column wrapper.
   */
  className?: string;
}

/**
 * Two-pane layout shell: a fixed sidebar column and a scrollable content area
 * with standard page padding.
 */
export function SidebarLayout({ sidebar, children, className }: Props): JSX.Element {
  const outer = className
    ? `flex min-h-0 flex-1 flex-col ${className}`
    : 'flex min-h-0 flex-1 flex-col';

  return (
    <div className={outer}>
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <div className="flex-1 overflow-y-auto p-6 pt-0!">{children}</div>
      </div>
    </div>
  );
}
