import { createElement } from '@harborclient/sdk/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { JSX } from 'react';

interface Props {
  /**
   * Font Awesome icon definition registered in the library.
   */
  icon: IconDefinition;

  /**
   * Optional Tailwind or custom classes for sizing and color.
   */
  className?: string;

  /**
   * When set, the icon is exposed to assistive tech instead of being decorative.
   */
  title?: string;
}

/**
 * Renders a Font Awesome SVG icon with consistent default sizing.
 */
export function FaIcon({ icon, className = 'h-3.5 w-3.5', title }: Props): JSX.Element {
  const classes = className ? `hc-fa-icon ${className}` : 'hc-fa-icon';
  return createElement(FontAwesomeIcon, {
    icon,
    className: classes,
    title,
    'aria-hidden': title ? undefined : true
  });
}
