import type { InputHTMLAttributes, JSX, Ref } from 'react';
import { radioCircle, radioInput } from './classes.js';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Additional Tailwind classes applied to the outer wrapper.
   */
  className?: string;

  /**
   * Ref forwarded to the underlying native radio input.
   */
  ref?: Ref<HTMLInputElement>;
}

/**
 * macOS-style radio button with a custom circle slightly larger than the native control.
 */
export function Radio({ ref, className, ...props }: Props): JSX.Element {
  const wrapperClasses = className
    ? `relative inline-flex shrink-0 ${className}`
    : 'relative inline-flex shrink-0';

  return (
    <span className={wrapperClasses}>
      <input ref={ref} type="radio" className={radioInput} {...props} />
      <span className={radioCircle} aria-hidden>
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
    </span>
  );
}
