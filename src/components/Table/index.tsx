import { createContext, createElement, useContext } from '@harborclient/sdk/react';
import type { HTMLAttributes, JSX, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

/**
 * Layout preset for {@link Table} and its subcomponents.
 */
export type TableVariant = 'bordered' | 'loose';

/**
 * Default header cell classes for bordered editor tables.
 */
export const tableHeadClass =
  'border-r border-b border-separator p-3 text-left text-[14px] font-medium uppercase tracking-wide text-muted last:border-r-0';

/**
 * Default body cell classes for bordered editor tables.
 */
export const tableCellClass = 'border-r border-b border-separator p-3 last:border-r-0';

/**
 * Header cell classes for loose tables with separate cell spacing.
 */
export const tableHeadClassLoose =
  'pb-1 text-left text-[14px] font-medium uppercase tracking-wide text-muted';

/**
 * Body cell classes for loose tables with separate cell spacing.
 */
export const tableCellClassLoose = '';

const TableVariantContext = createContext<TableVariant>('bordered');

/**
 * Returns preset classes merged with optional overrides.
 *
 * @param base - Variant preset classes.
 * @param className - Additional classes appended after the preset.
 */
function mergeClasses(base: string, className?: string): string | undefined {
  if (base && className) {
    return `${base} ${className}`;
  }
  if (base) {
    return base;
  }
  if (className) {
    return className;
  }
  return undefined;
}

interface TableProps {
  /**
   * Table header and body sections.
   */
  children: ReactNode;

  /**
   * Layout preset for the table shell and cell styling.
   */
  variant?: TableVariant;

  /**
   * Additional Tailwind classes merged onto the outer wrapper or table element.
   */
  className?: string;
}

/**
 * Table shell for editable row layouts.
 *
 * @param children - {@link TableHeader} and {@link TableBody} sections.
 * @param variant - Bordered collapsed layout or loose separate-cell spacing.
 * @param className - Extra classes on the wrapper (bordered) or table element (loose).
 */
export function Table({ children, variant = 'bordered', className }: TableProps): JSX.Element {
  if (variant === 'loose') {
    const tableBase = 'hc-table w-full border-separate border-spacing-x-1.5 border-spacing-y-1.5';
    const tableClasses = className ? `${tableBase} ${className}` : tableBase;

    return createElement(
      TableVariantContext.Provider,
      { value: variant },
      createElement('table', { className: tableClasses }, children)
    );
  }

  const wrapperBase = 'hc-table overflow-hidden rounded-md border border-separator';
  const wrapperClasses = className ? `${wrapperBase} ${className}` : wrapperBase;

  return createElement(
    TableVariantContext.Provider,
    { value: variant },
    createElement(
      'div',
      { className: wrapperClasses },
      createElement('table', { className: 'w-full border-collapse' }, children)
    )
  );
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Header or body row content.
   */
  children: ReactNode;

  /**
   * Additional Tailwind classes merged onto the section element.
   */
  className?: string;
}

/**
 * Table header section wrapper.
 *
 * @param children - Header row elements, typically native `tr` nodes.
 * @param className - Extra classes appended after any section preset.
 */
export function TableHeader({ children, className, ...rest }: TableSectionProps): JSX.Element {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

/**
 * Table body section wrapper.
 *
 * @param children - Body row elements, typically native `tr` nodes.
 * @param className - Extra classes appended after the layout preset.
 */
export function TableBody({ children, className, ...rest }: TableSectionProps): JSX.Element {
  const variant = useContext(TableVariantContext);
  const base = variant === 'bordered' ? '[&_tr:last-child_td]:border-b-0' : '';
  const classes = mergeClasses(base, className);

  return (
    <tbody className={classes} {...rest}>
      {children}
    </tbody>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Header cell content.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged after the header cell preset.
   */
  className?: string;
}

/**
 * Header cell with table styling for the active variant.
 *
 * @param children - Header label content.
 * @param className - Extra classes appended after the layout preset.
 */
export function TableHead({
  children,
  className,
  scope = 'col',
  ...rest
}: TableHeadProps): JSX.Element {
  const variant = useContext(TableVariantContext);
  const base = variant === 'loose' ? tableHeadClassLoose : tableHeadClass;
  const classes = mergeClasses(base, className);

  return (
    <th scope={scope} className={classes} {...rest}>
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Body cell content.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged after the body cell preset.
   */
  className?: string;
}

/**
 * Body cell with table styling for the active variant.
 *
 * @param children - Cell content.
 * @param className - Extra classes appended after the layout preset.
 */
export function TableCell({ children, className, ...rest }: TableCellProps): JSX.Element {
  const variant = useContext(TableVariantContext);
  const base = variant === 'loose' ? tableCellClassLoose : tableCellClass;
  const classes = mergeClasses(base, className);

  return (
    <td className={classes} {...rest}>
      {children}
    </td>
  );
}
