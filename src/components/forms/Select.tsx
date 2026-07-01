import type { JSX, Ref, SelectHTMLAttributes } from 'react';
import { mergeFieldClasses, type FieldVariant } from './classes.js';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Base field styling preset.
   */
  variant?: FieldVariant;

  /**
   * Additional Tailwind classes merged after the variant preset.
   */
  className?: string;

  /**
   * Ref forwarded to the underlying native select.
   */
  ref?: Ref<HTMLSelectElement>;
}

/**
 * macOS-style select menu with shared field styling presets.
 *
 * Children should be plain `<option>` elements.
 */
export function Select({
  ref,
  variant = 'control',
  className,
  children,
  ...props
}: Props): JSX.Element {
  return (
    <select ref={ref} className={mergeFieldClasses(variant, className, 'hc-select')} {...props}>
      {children}
    </select>
  );
}
