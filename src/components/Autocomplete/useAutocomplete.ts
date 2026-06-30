import { useCallback, useEffect, useId, useRef, useState } from '@harborclient/sdk/react';
import type { KeyboardEvent, RefObject } from 'react';
import type { AutocompleteSource } from './types.js';

interface UseAutocompleteOptions {
  /**
   * Optional async source for suggestions and persistence.
   */
  source?: AutocompleteSource;

  /**
   * Current input value.
   */
  value: string;

  /**
   * Called when the user selects a suggestion from the list.
   *
   * @param item - Selected suggestion value.
   */
  onSelect: (item: string) => void;

  /**
   * Optional ref for the anchor input; created internally when omitted.
   */
  anchorRef?: RefObject<HTMLInputElement | null>;
}

interface UseAutocompleteResult {
  /**
   * Whether the suggestion popup is visible.
   */
  open: boolean;

  /**
   * Filtered suggestion items for the current value.
   */
  items: string[];

  /**
   * Keyboard-highlighted suggestion index, or -1 when none.
   */
  activeIndex: number;

  /**
   * Ref attached to the anchor input element.
   */
  anchorRef: RefObject<HTMLInputElement | null>;

  /**
   * Id for the suggestion listbox element.
   */
  listboxId: string;

  /**
   * Opens suggestions and loads the source list when needed.
   */
  onFocus: () => void;

  /**
   * Commits the value and closes suggestions.
   */
  onBlur: () => void;

  /**
   * Handles keyboard navigation for the suggestion list.
   *
   * @returns True when the key was consumed by autocomplete handling.
   */
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => boolean;

  /**
   * Selects a suggestion and closes the list.
   *
   * @param item - Suggestion value to apply.
   */
  selectItem: (item: string) => void;

  /**
   * Re-evaluates filtered items when the input value changes while open.
   */
  refreshItems: () => void;

  /**
   * Updates the keyboard-highlighted suggestion index.
   */
  setActiveIndex: (index: number) => void;

  /**
   * Closes the suggestion list without committing.
   */
  closeSuggestions: () => void;
}

/**
 * Filters cached suggestions by the current input value.
 *
 * @param items - Full suggestion list.
 * @param value - Current input value.
 */
function filterItems(items: string[], value: string): string[] {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  return items.filter((item) => {
    if (item.toLowerCase() === lower) {
      return false;
    }
    if (!trimmed) {
      return true;
    }
    return item.toLowerCase().includes(lower);
  });
}

/**
 * Headless autocomplete state for combobox inputs.
 *
 * @param options - Source, value, and selection callback.
 */
export function useAutocomplete({
  source,
  value,
  onSelect,
  anchorRef: externalAnchorRef
}: UseAutocompleteOptions): UseAutocompleteResult {
  const internalAnchorRef = useRef<HTMLInputElement>(null);
  const anchorRef = externalAnchorRef ?? internalAnchorRef;
  const cacheRef = useRef<string[]>([]);
  const loadedRef = useRef(false);
  const loadPromiseRef = useRef<Promise<string[]> | null>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  /**
   * Loads suggestions from the source when not already cached.
   */
  const ensureLoaded = useCallback(async (): Promise<string[]> => {
    if (!source) {
      return [];
    }
    if (loadedRef.current) {
      return cacheRef.current;
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    loadPromiseRef.current = source.list().then((list) => {
      cacheRef.current = list;
      loadedRef.current = true;
      loadPromiseRef.current = null;
      return list;
    });

    return loadPromiseRef.current;
  }, [source]);

  /**
   * Updates filtered items from the cached list.
   */
  const refreshItems = useCallback((): void => {
    if (!source) {
      setItems([]);
      return;
    }
    setItems(filterItems(cacheRef.current, value));
  }, [source, value]);

  /**
   * Persists a new value when it is not already known.
   */
  const commit = useCallback(async (): Promise<void> => {
    if (!source) {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const exists = cacheRef.current.some((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return;
    }

    cacheRef.current = [...cacheRef.current, trimmed];
    try {
      await source.add(trimmed);
    } catch {
      cacheRef.current = cacheRef.current.filter((item) => item !== trimmed);
    }
  }, [source, value]);

  /**
   * Opens the suggestion list and loads items when a source is configured.
   */
  const openSuggestions = useCallback(async (): Promise<void> => {
    if (!source) {
      return;
    }

    await ensureLoaded();
    const filtered = filterItems(cacheRef.current, value);
    setItems(filtered);
    setActiveIndex(filtered.length > 0 ? 0 : -1);
    setOpen(true);
  }, [ensureLoaded, source, value]);

  /**
   * Closes the suggestion list and resets highlight state.
   */
  const closeSuggestions = useCallback((): void => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  /**
   * Applies a suggestion and closes the list without calling add().
   *
   * @param item - Selected suggestion value.
   */
  const selectItem = useCallback(
    (item: string): void => {
      onSelect(item);
      closeSuggestions();
    },
    [closeSuggestions, onSelect]
  );

  /**
   * Opens suggestions when the input receives focus.
   */
  const onFocus = useCallback((): void => {
    void openSuggestions();
  }, [openSuggestions]);

  /**
   * Commits new values and closes suggestions on blur.
   */
  const onBlur = useCallback((): void => {
    void commit();
    closeSuggestions();
  }, [closeSuggestions, commit]);

  /**
   * Handles arrow keys, Enter, and Escape for suggestion navigation.
   */
  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): boolean => {
      if (!source || !open) {
        return false;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (items.length === 0) {
          return true;
        }
        setActiveIndex((index) => (index + 1) % items.length);
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (items.length === 0) {
          return true;
        }
        setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
        return true;
      }

      if (event.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          event.preventDefault();
          selectItem(items[activeIndex]);
          return true;
        }
        void commit();
        closeSuggestions();
        return false;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeSuggestions();
        return true;
      }

      return false;
    },
    [activeIndex, closeSuggestions, commit, items, open, selectItem, source]
  );

  useEffect(() => {
    if (open) {
      refreshItems();
    }
  }, [open, refreshItems, value]);

  return {
    open,
    items,
    activeIndex,
    anchorRef,
    listboxId,
    onFocus,
    onBlur,
    onInputKeyDown,
    selectItem,
    refreshItems,
    setActiveIndex,
    closeSuggestions
  };
}
