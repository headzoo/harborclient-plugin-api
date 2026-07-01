import type { JSX, Ref, TextareaHTMLAttributes } from 'react';
import { mergeFieldClasses, type FieldVariant } from './classes.js';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Base field styling preset.
   */
  variant?: FieldVariant;

  /**
   * Additional Tailwind classes merged after the variant preset.
   */
  className?: string;

  /**
   * Ref forwarded to the underlying native textarea.
   */
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * macOS-style multiline input with shared field styling presets.
 */
export function Textarea({ ref, variant = 'control', className, ...props }: Props): JSX.Element {
  return (
    <textarea
      ref={ref}
      className={mergeFieldClasses(variant, className, 'hc-textarea')}
      {...props}
    />
  );
}
