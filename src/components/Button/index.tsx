import type { ButtonHTMLAttributes, JSX, RefObject } from 'react';

/**
 * Visual style for a macOS-style button.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'primaryDanger'
  | 'secondaryDanger'
  | 'toolbar'
  | 'icon'
  | 'iconDanger';

type IconButtonVariant = 'icon' | 'iconDanger';

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: undefined }
  | { 'aria-labelledby': string; 'aria-label'?: undefined };

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-labelledby'> & {
  /**
   * Additional Tailwind classes merged after the variant preset.
   */
  className?: string;

  /**
   * Ref forwarded to the underlying native button element.
   */
  innerRef?: RefObject<HTMLButtonElement | null>;
};

export type ButtonProps =
  | (BaseProps & { variant: IconButtonVariant } & AccessibleName)
  | (BaseProps & { variant?: Exclude<ButtonVariant, IconButtonVariant> });

const BUTTON_BASE = 'inline-flex cursor-pointer items-center rounded-md app-no-drag';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${BUTTON_BASE} min-h-[32px] justify-center border border-transparent bg-accent px-3 py-1 text-[15px] font-medium text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`,
  secondary: `${BUTTON_BASE} min-h-[32px] justify-center border border-separator bg-control px-3 py-1 text-[15px] text-text shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50`,
  primaryDanger: `${BUTTON_BASE} min-h-[32px] justify-center border border-transparent bg-danger px-3 py-1 text-[15px] font-medium text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`,
  secondaryDanger: `${BUTTON_BASE} min-h-[32px] justify-center border border-separator bg-control px-3 py-1 text-[15px] text-danger shadow-sm hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-50`,
  toolbar: `${BUTTON_BASE} min-h-[32px] border-none bg-transparent px-2 py-1 text-[15px] hover:bg-selection`,
  icon: `${BUTTON_BASE} size-[30px] shrink-0 justify-center border-none bg-transparent text-muted hover:bg-selection hover:text-text`,
  iconDanger: `${BUTTON_BASE} size-[30px] shrink-0 justify-center border-none bg-transparent text-muted hover:bg-danger/15 hover:text-danger`
};

/**
 * macOS-style button with shared variant presets for primary actions, secondary
 * actions, toolbar controls, and icon-only controls.
 *
 * Defaults to `type="button"` so clicks do not accidentally submit a parent form.
 * Pass `type="submit"` explicitly when submit behavior is intended.
 *
 * Icon variants (`icon`, `iconDanger`) require `aria-label` or `aria-labelledby`.
 *
 * @param variant - Visual preset; defaults to `primary`.
 * @param className - Extra classes appended after the variant classes.
 * @param type - Native button type; defaults to `button`.
 */
export function Button({
  variant = 'primary',
  className,
  type = 'button',
  innerRef,
  ...props
}: ButtonProps): JSX.Element {
  const classes = className ? `${VARIANT_CLASSES[variant]} ${className}` : VARIANT_CLASSES[variant];
  return <button ref={innerRef} type={type} className={classes} {...props} />;
}
