import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from '@harborclient/sdk/react';
import type { JSX, KeyboardEvent } from 'react';
import { resolveTabListKeyAction } from '../utils.js';
import { segment, segmentGroup } from '../classes.js';
import { SegmentedTabsContext } from './SegmentedTabsContext.js';
import { SegmentedTabsVisibilityMenu } from './SegmentedTabsVisibilityMenu.js';
import type { TabItem } from './types.js';

export { SegmentedTabsGroup } from './SegmentedTabsGroup.js';
export { SegmentedTabPanel } from './SegmentedTabPanel.js';
export type { TabItem } from './types.js';

interface Props<T extends string> {
  /**
   * Tab definitions to render.
   */
  tabs: TabItem<T>[];

  /**
   * Currently selected tab value. Omit when used inside `SegmentedTabsGroup`.
   */
  value?: T;

  /**
   * Called when the user selects a different tab. Omit when used inside
   * `SegmentedTabsGroup`.
   *
   * @param value - Newly selected tab value.
   */
  onChange?: (value: T) => void;

  /**
   * When true, shows a menu for toggling tab visibility.
   */
  editable?: boolean;

  /**
   * Controlled set of tab values shown in the tab strip. Used with
   * `onVisibleTabValuesChange` when tab visibility is persisted.
   */
  visibleTabValues?: T[];

  /**
   * Initial visible tab values for uncontrolled visibility. Defaults to all
   * non-`hidden` tabs. Keep a copy in the parent to reset saved preferences.
   */
  defaultVisibleTabValues?: T[];

  /**
   * Called when the user toggles tab visibility in the edit menu.
   *
   * @param visibleTabValues - Updated visible tab values.
   */
  onVisibleTabValuesChange?: (visibleTabValues: T[]) => void;

  /**
   * When true, the group and each tab stretch to full width.
   */
  fullWidth?: boolean;

  /**
   * Additional CSS classes for the tab group container.
   */
  className?: string;

  /**
   * ARIA pattern for the control. Use `radiogroup` for single-choice settings
   * pickers; use `tabs` with `SegmentedTabsGroup` for content switchers.
   */
  pattern?: 'tabs' | 'radiogroup';

  /**
   * Accessible name for the tab list or radio group. Omit when used inside
   * `SegmentedTabsGroup`.
   */
  ariaLabel?: string;
}

/**
 * macOS-style segmented tab control with WAI-ARIA tabs or radiogroup semantics.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value: valueProp,
  onChange: onChangeProp,
  editable = true,
  visibleTabValues: visibleTabValuesProp,
  defaultVisibleTabValues,
  onVisibleTabValuesChange,
  fullWidth = false,
  className,
  pattern = 'tabs',
  ariaLabel: ariaLabelProp
}: Props<T>): JSX.Element {
  const context = useContext(SegmentedTabsContext);
  const standaloneId = useId();
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());

  const value = (context?.value as T | undefined) ?? valueProp;

  /**
   * Resolves the change handler from group context or standalone props so the
   * keyboard handler dependency stays stable across renders.
   */
  const onChange = useMemo((): ((nextValue: T) => void) | undefined => {
    if (context) return (nextValue) => context.onChange(nextValue);
    return onChangeProp;
  }, [context, onChangeProp]);
  const ariaLabel = context?.ariaLabel ?? ariaLabelProp;

  if (value === undefined || onChange === undefined) {
    throw new Error(
      'SegmentedTabs requires value and onChange, or must be used within SegmentedTabsGroup'
    );
  }

  const getTabId = context
    ? (tabValue: T) => context.getTabId(tabValue)
    : (tabValue: T) => `${standaloneId}-tab-${tabValue}`;
  const getPanelId = context
    ? (tabValue: T) => context.getPanelId(tabValue)
    : (tabValue: T) => `${standaloneId}-panel-${tabValue}`;

  const editableTabs = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs]);
  const defaultVisible = useMemo(
    () => defaultVisibleTabValues ?? editableTabs.map((tab) => tab.value),
    [defaultVisibleTabValues, editableTabs]
  );

  const [internalVisibleTabValues, setInternalVisibleTabValues] = useState<T[]>(defaultVisible);
  const visibleTabValues = visibleTabValuesProp ?? internalVisibleTabValues;
  const visibleSet = useMemo(() => new Set(visibleTabValues), [visibleTabValues]);

  const visibleTabs = editable
    ? editableTabs.filter((tab) => visibleSet.has(tab.value))
    : editableTabs;

  /**
   * Updates visible tab values and notifies the parent when controlled props
   * are used for persistence.
   *
   * @param nextVisibleTabValues - New visible tab values.
   */
  const updateVisibleTabValues = useCallback(
    (nextVisibleTabValues: T[]): void => {
      if (visibleTabValuesProp === undefined) {
        setInternalVisibleTabValues(nextVisibleTabValues);
      }
      onVisibleTabValuesChange?.(nextVisibleTabValues);
    },
    [onVisibleTabValuesChange, visibleTabValuesProp]
  );

  /**
   * Toggles a tab's visibility in the edit menu, keeping at least one tab
   * visible and moving selection when the active tab is hidden.
   *
   * @param tabValue - Tab value to show or hide.
   */
  const handleVisibilityToggle = useCallback(
    (tabValue: T): void => {
      const isVisible = visibleSet.has(tabValue);
      if (isVisible && visibleTabs.length <= 1) return;

      const nextVisibleSet = new Set(visibleTabValues);
      if (isVisible) {
        nextVisibleSet.delete(tabValue);
      } else {
        nextVisibleSet.add(tabValue);
      }

      const nextVisibleTabValues = editableTabs
        .filter((tab) => nextVisibleSet.has(tab.value))
        .map((tab) => tab.value);

      updateVisibleTabValues(nextVisibleTabValues);

      if (isVisible && tabValue === value) {
        const nextSelectedTab = editableTabs.find((tab) => nextVisibleSet.has(tab.value));
        if (nextSelectedTab) {
          onChange(nextSelectedTab.value);
        }
      }
    },
    [
      editableTabs,
      onChange,
      updateVisibleTabValues,
      value,
      visibleSet,
      visibleTabValues,
      visibleTabs.length
    ]
  );

  /**
   * When visibility changes externally, select the first visible tab if the
   * current selection is hidden.
   */
  useEffect(() => {
    if (!editable || visibleSet.has(value)) return;

    const nextSelectedTab = visibleTabs[0];
    if (nextSelectedTab) {
      onChange(nextSelectedTab.value);
    }
  }, [editable, onChange, value, visibleSet, visibleTabs]);

  const outerClassName = [
    'hc-segmented-tabs',
    segmentGroup,
    'items-center gap-1',
    fullWidth ? 'flex-1 min-w-0' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const tabListClassName = ['inline-flex min-w-0 flex-1 items-center', fullWidth ? 'w-full' : '']
    .filter(Boolean)
    .join(' ');

  /**
   * Moves selection with arrow, Home, and End keys and focuses the newly
   * selected tab or radio control.
   *
   * @param event - Keyboard event from the tab list or radio group container.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      const currentIndex = visibleTabs.findIndex((tab) => tab.value === value);
      const disabledIndices = visibleTabs
        .map((tab, index) => (tab.disabled ? index : -1))
        .filter((index) => index >= 0);

      const nextIndex = resolveTabListKeyAction(event.key, currentIndex, visibleTabs.length, {
        disabledIndices
      });
      if (nextIndex === null) return;

      event.preventDefault();
      const nextTab = visibleTabs[nextIndex];
      if (nextTab.value !== value) {
        onChange(nextTab.value);
      }

      requestAnimationFrame(() => {
        tabRefs.current.get(nextTab.value)?.focus();
      });
    },
    [visibleTabs, value, onChange]
  );

  const isRadiogroup = pattern === 'radiogroup';

  return (
    <div className={outerClassName}>
      <div
        className={tabListClassName}
        role={isRadiogroup ? 'radiogroup' : 'tablist'}
        aria-label={ariaLabel}
        {...(!isRadiogroup ? { 'aria-orientation': 'horizontal' as const } : {})}
        onKeyDown={handleKeyDown}
      >
        {visibleTabs.map((tab) => {
          const selected = value === tab.value;
          const tabClassName = `${segment(selected)}${fullWidth ? ' flex-1' : ''}`;

          return (
            <button
              key={tab.value}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.value, element);
                else tabRefs.current.delete(tab.value);
              }}
              type="button"
              className={tabClassName}
              disabled={tab.disabled}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              {...(isRadiogroup
                ? { role: 'radio', 'aria-checked': selected }
                : {
                    role: 'tab',
                    id: getTabId(tab.value),
                    'aria-selected': selected,
                    ...(context ? { 'aria-controls': getPanelId(tab.value) } : {})
                  })}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.indicator && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {editable && (
        <SegmentedTabsVisibilityMenu
          tabs={editableTabs}
          visibleTabValues={visibleTabValues}
          onToggle={handleVisibilityToggle}
        />
      )}
    </div>
  );
}
