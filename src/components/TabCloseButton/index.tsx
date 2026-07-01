import type { JSX } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIcon } from '../FaIcon/index.js';

interface Props {
  /**
   * Accessible name for the close control, typically including the tab title.
   */
  ariaLabel: string;

  /**
   * Called when the user activates the close button.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Optional tooltip label; defaults to "Close tab".
   */
  title?: string;
}

/**
 * Close control for document-style tabs in the request editor and AI chat.
 *
 * @param ariaLabel - Accessible name describing which tab closes.
 * @param onClick - Click handler; callers should stop propagation when needed.
 * @param title - Optional native tooltip text.
 */
export function TabCloseButton({ ariaLabel, onClick, title = 'Close tab' }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="hc-tab-close-button inline-flex aspect-square shrink-0 cursor-pointer items-center justify-center self-stretch rounded-md border-none bg-transparent text-[14px] text-muted hover:bg-selection hover:text-text focus-visible:bg-selection focus-visible:text-text app-no-drag"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <FaIcon icon={faXmark} className="h-3.5 w-3.5" />
    </button>
  );
}
