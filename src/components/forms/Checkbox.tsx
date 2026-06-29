import type { InputHTMLAttributes, JSX, Ref } from 'react';
import { checkboxBox, checkboxInput } from './classes.js';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Additional Tailwind classes applied to the outer wrapper.
   */
  className?: string;

  /**
   * Ref forwarded to the underlying native checkbox input.
   */
  ref?: Ref<HTMLInputElement>;
}

/**
 * macOS-style checkbox with a custom box slightly larger than the native control.
 */
export function Checkbox({ ref, className, ...props }: Props): JSX.Element {
  const wrapperClasses = className
    ? `relative inline-flex shrink-0 ${className}`
    : 'relative inline-flex shrink-0';

  return (
    <span className={wrapperClasses}>
      <input ref={ref} type="checkbox" className={checkboxInput} {...props} />
      <span className={checkboxBox} aria-hidden>
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
