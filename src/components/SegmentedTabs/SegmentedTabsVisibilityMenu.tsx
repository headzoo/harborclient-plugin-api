import { useCallback, useEffect, useId, useRef, useState } from '@harborclient/sdk/react';
import type { JSX, KeyboardEvent, ReactNode } from 'react';
import { faCaretDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { resolveTabListKeyAction } from '../utils.js';
import type { TabItem } from './types.js';

interface Props<T extends string> {
  /**
   * Tabs that can be shown or hidden via the menu.
   */
  tabs: TabItem<T>[];

  /**
   * Tab values currently shown in the tab strip.
   */
  visibleTabValues: T[];

  /**
   * Called when the user toggles a tab's visibility in the menu.
   *
   * @param tabValue - Tab value to toggle.
   */
  onToggle: (tabValue: T) => void;
}

const menuItemClass =
  'flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3.5 py-1.5 text-left text-[14px] text-text hover:bg-selection app-no-drag';

const triggerClassName =
  '!rounded-full hover:!bg-[rgba(0,122,255,0.18)] dark:hover:!bg-[rgba(10,132,255,0.22)]';

/**
 * Caret-triggered menu for toggling which segmented tabs are visible.
 */
export function SegmentedTabsVisibilityMenu<T extends string>({
  tabs,
  visibleTabValues,
  onToggle
}: Props<T>): JSX.Element {
  const menuId = useId();
  const menuElementId = `${menuId}-menu`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wasOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const visibleSet = new Set(visibleTabValues);

  /**
   * Closes the menu and returns focus to the trigger button.
   */
  const closeMenu = useCallback((): void => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  /**
   * Opens the menu and focuses the first or last item.
   *
   * @param focusLast - When true, focus the last item instead of the first.
   */
  const openMenu = useCallback(
    (focusLast = false): void => {
      if (tabs.length === 0) return;
      setFocusedIndex(focusLast ? tabs.length - 1 : 0);
      setIsOpen(true);
    },
    [tabs.length]
  );

  /**
   * Focuses a menu item by index and updates roving tabindex state.
   *
   * @param index - Index of the menu item to focus.
   */
  const focusItem = useCallback((index: number): void => {
    setFocusedIndex(index);
    requestAnimationFrame(() => {
      itemRefs.current[index]?.focus();
    });
  }, []);

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
    }
  }, [isOpen]);

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
    if (tabs.length === 0) return;

    if (event.key === 'Tab') {
      closeMenu();
      return;
    }

    const arrowIndex = resolveTabListKeyAction(event.key, focusedIndex, tabs.length);
    if (arrowIndex !== null) {
      event.preventDefault();
      focusItem(arrowIndex);
    }
  };

  return (
    <div ref={rootRef} className="hc-segmented-tabs-visibility-menu relative shrink-0">
      <Button
        innerRef={triggerRef}
        type="button"
        variant="icon"
        className={triggerClassName}
        aria-label="Customize visible tabs"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuElementId : undefined}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu(false);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <FaIcon icon={faCaretDown} className="h-3.5 w-3.5" />
      </Button>
      {isOpen && (
        <div
          id={menuElementId}
          role="menu"
          className="absolute right-0 top-full z-10 mt-0.5 min-w-[140px] rounded-md border border-separator bg-surface py-1 shadow-md app-no-drag"
          onKeyDown={handleMenuKeyDown}
        >
          {tabs.map((tab, index) => {
            const checked = visibleSet.has(tab.value);
            return (
              <MenuCheckboxItem
                key={tab.value}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                checked={checked}
                tabIndex={index === focusedIndex ? 0 : -1}
                label={tab.label}
                onSelect={() => onToggle(tab.value)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MenuCheckboxItemProps {
  checked: boolean;
  label: ReactNode;
  tabIndex: number;
  onSelect: () => void;
  ref?: (element: HTMLButtonElement | null) => void;
}

/**
 * Single checkbox-style row in the tab visibility menu.
 */
function MenuCheckboxItem({
  checked,
  label,
  tabIndex,
  onSelect,
  ref
}: MenuCheckboxItemProps): JSX.Element {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={tabIndex}
      className={menuItemClass}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <span className="inline-flex w-4 shrink-0 justify-center" aria-hidden>
        {checked ? <FaIcon icon={faCheck} className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0">{label}</span>
    </button>
  );
}
