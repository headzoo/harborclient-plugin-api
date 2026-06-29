import { useCallback, useEffect, useMemo, useRef, useState } from '@harborclient/sdk/react';
import type { JSX, KeyboardEvent } from 'react';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { resolveMenuTypeahead, resolveTabListKeyAction } from '../utils.js';

export type MenuItem = {
  label: string;
  onSelect: () => void;
  variant?: 'default' | 'danger';
};

interface Props {
  /**
   * Grouped menu entries shown when the trigger is open. Each inner array is
   * one visual group separated by a divider line.
   */
  groups: MenuItem[][];

  /**
   * Unique id for this menu instance (e.g. "collection-3").
   */
  menuId: string;

  /**
   * Id of the currently open menu, or null when all are closed.
   */
  openMenuId: string | null;

  /**
   * Called when the user opens or closes a menu.
   *
   * @param id - Open menu id, or null to close.
   */
  onOpenChange: (id: string | null) => void;
}

const TYPEAHEAD_TIMEOUT_MS = 500;

/**
 * Tailwind classes for a single menu item button.
 *
 * @param variant - Visual variant for default or destructive actions.
 */
function menuItemClass(variant: MenuItem['variant']): string {
  const base =
    'block w-full cursor-pointer border-none bg-transparent px-3.5 py-1.5 text-left text-[14px] app-no-drag';

  return variant === 'danger'
    ? `${base} text-text hover:bg-danger/15 hover:text-danger`
    : `${base} text-text hover:bg-selection`;
}

/**
 * Hamburger-triggered dropdown for row-level actions (rename, delete, etc.).
 */
export function RowActionsMenu({ groups, menuId, openMenuId, onOpenChange }: Props): JSX.Element {
  const isOpen = openMenuId === menuId;
  const menuElementId = `${menuId}-menu`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<number | null>(null);
  const wasOpenRef = useRef(isOpen);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const flatItems = useMemo(() => groups.flat(), [groups]);
  const itemLabels = useMemo(() => flatItems.map((item) => item.label), [flatItems]);

  /**
   * Clears the accumulated typeahead buffer.
   */
  const clearTypeahead = useCallback((): void => {
    typeaheadBuffer.current = '';
    if (typeaheadTimer.current != null) {
      window.clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = null;
    }
  }, []);

  /**
   * Closes the menu and returns focus to the trigger button.
   */
  const closeMenu = useCallback((): void => {
    clearTypeahead();
    onOpenChange(null);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [clearTypeahead, onOpenChange]);

  /**
   * Focuses a menu item by index and updates roving tabindex state.
   *
   * @param index - Flat index of the menu item to focus.
   */
  const focusItem = useCallback((index: number): void => {
    setFocusedIndex(index);
    requestAnimationFrame(() => {
      itemRefs.current[index]?.focus();
    });
  }, []);

  /**
   * Opens the menu and focuses the first or last item.
   *
   * @param focusLast - When true, focus the last item instead of the first.
   */
  const openMenu = useCallback(
    (focusLast = false): void => {
      if (flatItems.length === 0) return;
      setFocusedIndex(focusLast ? flatItems.length - 1 : 0);
      onOpenChange(menuId);
    },
    [flatItems.length, menuId, onOpenChange]
  );

  /**
   * Moves focus into the menu after it opens and item refs are mounted.
   */
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      requestAnimationFrame(() => {
        itemRefs.current[focusedIndex]?.focus();
      });
    }
    wasOpenRef.current = isOpen;
  }, [focusedIndex, isOpen]);

  /**
   * Resets item refs when the menu closes.
   */
  useEffect(() => {
    if (!isOpen) {
      itemRefs.current = [];
      setFocusedIndex(0);
      clearTypeahead();
    }
  }, [clearTypeahead, isOpen]);

  /**
   * Closes the menu on outside click or Escape while it is open.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  /**
   * Handles keyboard interaction on the menu trigger when closed.
   *
   * @param event - Keyboard event from the trigger button.
   */
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (isOpen) return;

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(false);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(true);
    }
  };

  /**
   * Handles keyboard navigation within the open menu.
   *
   * @param event - Keyboard event from the menu container.
   */
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (flatItems.length === 0) return;

    if (event.key === 'Tab') {
      closeMenu();
      return;
    }

    const arrowIndex = resolveTabListKeyAction(event.key, focusedIndex, flatItems.length);
    if (arrowIndex !== null) {
      event.preventDefault();
      clearTypeahead();
      focusItem(arrowIndex);
      return;
    }

    const typeahead = resolveMenuTypeahead(
      itemLabels,
      focusedIndex,
      event.key,
      typeaheadBuffer.current
    );
    if (typeahead) {
      event.preventDefault();
      typeaheadBuffer.current = typeahead.buffer;
      if (typeaheadTimer.current != null) {
        window.clearTimeout(typeaheadTimer.current);
      }
      typeaheadTimer.current = window.setTimeout(() => {
        typeaheadBuffer.current = '';
        typeaheadTimer.current = null;
      }, TYPEAHEAD_TIMEOUT_MS);
      focusItem(typeahead.index);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        innerRef={triggerRef}
        type="button"
        variant="icon"
        title="Actions"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuElementId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            closeMenu();
          } else {
            openMenu(false);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <FaIcon icon={faBars} className="h-3.5 w-3.5" />
      </Button>
      {isOpen && (
        <div
          id={menuElementId}
          role="menu"
          className="absolute right-0 top-full z-10 mt-0.5 min-w-[120px] rounded-md border border-separator bg-surface py-1 shadow-md app-no-drag"
          onKeyDown={handleMenuKeyDown}
        >
          {groups.map((group, groupIndex) => {
            let flatIndex = groups.slice(0, groupIndex).reduce((count, g) => count + g.length, 0);

            return (
              <div
                key={groupIndex}
                className={groupIndex > 0 ? 'border-t border-separator' : undefined}
              >
                {group.map((item) => {
                  const itemIndex = flatIndex++;
                  return (
                    <button
                      key={item.label}
                      ref={(el) => {
                        itemRefs.current[itemIndex] = el;
                      }}
                      type="button"
                      role="menuitem"
                      tabIndex={itemIndex === focusedIndex ? 0 : -1}
                      className={menuItemClass(item.variant)}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                        item.onSelect();
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
