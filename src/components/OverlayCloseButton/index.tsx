import type { JSX } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';

interface Props {
  /**
   * Accessible name for the close control.
   */
  label?: string;

  /**
   * Called when the user activates the close button.
   */
  onClose: () => void;

  /**
   * Additional Tailwind classes merged onto the button element.
   */
  className?: string;
}

/**
 * Always-visible overlay close icon used on full-page settings and plugin views.
 *
 * @param label - Accessible name; defaults to "Close".
 * @param onClose - Close handler.
 * @param className - Extra classes appended after the overlay preset.
 */
export function OverlayCloseButton({ label = 'Close', onClose, className }: Props): JSX.Element {
  const classes = className
    ? `hc-overlay-close-button text-[28px] ${className}`
    : 'hc-overlay-close-button text-[28px]';

  return (
    <Button type="button" variant="icon" className={classes} aria-label={label} onClick={onClose}>
      <FaIcon icon={faXmark} className="h-4 w-4" />
    </Button>
  );
}
