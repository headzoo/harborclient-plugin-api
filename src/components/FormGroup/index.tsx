import { useId } from '@harborclient/sdk/react';
import type { JSX, ReactNode } from 'react';
import { FieldError } from '../FieldError/index.js';
import { enhanceControl } from '../enhanceControl.js';

/**
 * Layout preset for label and control placement within a form group.
 */
export type FormGroupLayout =
  | 'stacked'
  | 'checkbox'
  | 'inline'
  | 'radio'
  | 'checkboxAdjacent'
  | 'associated';

/**
 * Label color tone for form group headings.
 */
export type FormGroupLabelTone = 'default' | 'muted';

interface Props {
  /**
   * Visible label text, or screen-reader-only text when `srOnly` is set.
   */
  label: ReactNode;

  /**
   * Form control(s) rendered inside or beside the label. Omitted for `associated` layout.
   */
  children?: ReactNode;

  /**
   * Associates the label with a control via `htmlFor`.
   */
  htmlFor?: string;

  /**
   * Muted helper text rendered below the control (stacked layout only).
   */
  description?: ReactNode;

  /**
   * Validation error rendered below the control with linked `aria-describedby`.
   */
  error?: ReactNode;

  /**
   * Explicit id for the error element; defaults to `${htmlFor}-error` when `htmlFor` is set.
   */
  errorId?: string;

  /**
   * Explicit id for the description element; defaults to `${htmlFor}-description` when `htmlFor` is set.
   */
  descriptionId?: string;

  /**
   * Label and control placement. Defaults to stacked (label above control).
   */
  layout?: FormGroupLayout;

  /**
   * Label color style. Defaults to prominent `text-text`.
   */
  labelTone?: FormGroupLabelTone;

  /**
   * Hides the label visually while keeping it available to screen readers.
   */
  srOnly?: boolean;

  /**
   * Additional Tailwind classes on the outer wrapper.
   */
  className?: string;

  /**
   * Extra classes on the label element (associated and checkboxAdjacent layouts).
   */
  labelClassName?: string;
}

/**
 * Returns Tailwind classes for the label text based on tone and visibility.
 *
 * @param tone - Label color preset.
 * @param srOnly - Whether the label is visually hidden.
 * @param inline - Whether the label sits beside the control in a row.
 * @returns Class string for the label element.
 */
function labelClasses(tone: FormGroupLabelTone, srOnly: boolean, inline: boolean): string {
  const base = 'text-[14px]';
  const visibility = srOnly ? 'sr-only' : '';
  if (inline) {
    const color = tone === 'muted' ? 'shrink-0 text-muted' : 'shrink-0 font-medium text-text';
    return `${base} ${color} ${visibility}`.trim();
  }
  const color = tone === 'muted' ? 'text-muted' : 'font-medium text-text';
  return `${base} ${color} ${visibility}`.trim();
}

/**
 * Reusable form field wrapper that pairs a label with one or more controls.
 * Supports stacked fields, checkboxes, inline rows, radio options, and
 * adjacent checkbox rows used in list pickers.
 *
 * @param label - Field label text.
 * @param children - Input, select, or composite control content.
 * @param htmlFor - ID of the primary associated control.
 * @param description - Optional helper text below the control.
 * @param error - Optional validation error below the control.
 * @param errorId - Explicit error element id for `aria-describedby`.
 * @param descriptionId - Explicit description element id for `aria-describedby`.
 * @param layout - Label/control placement preset.
 * @param labelTone - Label color style.
 * @param srOnly - Hide label visually for screen-reader-only labels.
 * @param className - Extra classes on the outer wrapper.
 * @param labelClassName - Extra classes on the label element.
 */
export function FormGroup({
  label,
  children,
  htmlFor,
  description,
  error,
  errorId,
  descriptionId,
  layout = 'stacked',
  labelTone = 'default',
  srOnly = false,
  className,
  labelClassName
}: Props): JSX.Element {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const extra = className ?? '';

  if (layout === 'associated') {
    const associatedClasses = labelClassName
      ? `hc-form-group ${labelClassName}`
      : 'hc-form-group text-[14px] text-text';
    return (
      <label htmlFor={htmlFor} className={associatedClasses}>
        {label}
      </label>
    );
  }

  if (layout === 'checkboxAdjacent') {
    const wrapperClasses = extra
      ? `hc-form-group flex items-start gap-2 ${extra}`
      : 'hc-form-group flex items-start gap-2';
    const adjacentLabelClasses = labelClassName ?? 'min-w-0 flex-1 text-[14px] text-text';
    const linkedChildren = enhanceControl(children, { id: controlId });
    return (
      <div className={wrapperClasses}>
        {linkedChildren}
        <label htmlFor={controlId} className={adjacentLabelClasses}>
          {label}
        </label>
      </div>
    );
  }

  if (layout === 'radio') {
    const wrapperClasses = extra
      ? `hc-form-group inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-text app-no-drag ${extra}`
      : 'hc-form-group inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-text app-no-drag';
    const linkedChildren = enhanceControl(children, { id: controlId });
    return (
      <label htmlFor={controlId} className={wrapperClasses}>
        {linkedChildren}
        {label}
      </label>
    );
  }

  if (layout === 'checkbox') {
    const wrapperClasses = extra
      ? `hc-form-group flex items-center gap-2 ${extra}`
      : 'hc-form-group flex items-center gap-2';
    const linkedChildren = enhanceControl(children, { id: controlId });
    return (
      <label htmlFor={controlId} className={wrapperClasses}>
        {linkedChildren}
        <span className={labelClasses(labelTone, srOnly, false)}>{label}</span>
      </label>
    );
  }

  if (layout === 'inline') {
    const wrapperClasses = extra
      ? `hc-form-group flex min-w-0 flex-1 items-center gap-2 ${extra}`
      : 'hc-form-group flex min-w-0 flex-1 items-center gap-2';
    const linkedChildren = enhanceControl(children, { id: controlId });
    return (
      <label htmlFor={controlId} className={wrapperClasses}>
        <span className={labelClasses(labelTone, srOnly, true)}>{label}</span>
        {linkedChildren}
      </label>
    );
  }

  const resolvedDescriptionId =
    description != null && description !== ''
      ? (descriptionId ?? (htmlFor ? `${htmlFor}-description` : undefined))
      : undefined;
  const resolvedErrorId =
    error != null && error !== ''
      ? (errorId ?? (htmlFor ? `${htmlFor}-error` : undefined))
      : undefined;
  const describedByIds = [resolvedDescriptionId, resolvedErrorId].filter(
    (id): id is string => id != null
  );
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
  const control = enhanceControl(children, {
    describedBy,
    invalid: resolvedErrorId != null,
    id: htmlFor
  });
  const wrapperClasses = extra
    ? `hc-form-group flex flex-col gap-1 ${extra}`
    : 'hc-form-group flex flex-col gap-1';

  return (
    <div className={wrapperClasses}>
      <label htmlFor={htmlFor} className="flex flex-col gap-1">
        <span className={labelClasses(labelTone, srOnly, false)}>{label}</span>
        {control}
        {resolvedDescriptionId ? (
          <p id={resolvedDescriptionId} className="m-0 text-[14px] text-muted">
            {description}
          </p>
        ) : null}
      </label>
      {resolvedErrorId ? (
        <FieldError id={resolvedErrorId} spacing="field">
          {error}
        </FieldError>
      ) : null}
    </div>
  );
}
