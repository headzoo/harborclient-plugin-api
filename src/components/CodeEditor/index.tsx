import { autocompletion, type CompletionSource } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  hoverTooltip,
  type DecorationSet,
  type ViewUpdate
} from '@codemirror/view';
import CodeMirrorImport from '@uiw/react-codemirror';
import { tags } from '@lezer/highlight';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  createElement
} from '@harborclient/sdk/react';
import type { JSX } from 'react';
import type { CodeEditorSetup, CodeEditorTheme, Variable } from '../../types.js';
import { getVariableTooltipContent, VARIABLE_NAME_CHARS } from '../../variables/index.js';
import { useCodeEditorConfig } from './config.js';
import { getCodeEditorThemeExtension } from './themes.js';

export { CODE_EDITOR_THEME_OPTIONS } from './themes.js';

export type CodeEditorLanguage = 'json' | 'text' | 'javascript' | 'shell';

export interface Props {
  /**
   * Editor content.
   */
  value: string;

  /**
   * Called when the user edits the content; omitted for read-only views.
   *
   * @param value - Updated editor content.
   */
  onChange?: (value: string) => void;

  /**
   * Syntax mode for highlighting.
   */
  language?: CodeEditorLanguage;

  /**
   * When true, the editor cannot be edited.
   */
  readOnly?: boolean;

  /**
   * Placeholder shown when the editor is empty.
   */
  placeholder?: string;

  /**
   * Minimum editor height in CSS units.
   */
  minHeight?: string;

  /**
   * Additional wrapper classes.
   */
  className?: string;

  /**
   * Collection-scoped variables for {{token}} highlighting and tooltips.
   */
  variables?: Variable[];

  /**
   * Opens collection settings to edit a hovered variable.
   */
  onEditVariable?: () => void;

  /**
   * When set on a JavaScript editor, enables custom autocomplete (e.g. hc API completions).
   */
  completionSource?: CompletionSource;

  /**
   * When set, overrides the persisted CodeMirror theme (used by the settings preview).
   */
  themeOverride?: CodeEditorTheme;

  /**
   * When set, overrides persisted basicSetup options (used by the settings preview).
   */
  setupOverride?: CodeEditorSetup;

  /**
   * DOM id applied to the editable region for label association.
   */
  id?: string;

  /**
   * Accessible name when no visible label is associated via `htmlFor`.
   */
  'aria-label'?: string;

  /**
   * Id of the element that labels this editor when using `aria-labelledby`.
   */
  'aria-labelledby'?: string;

  /**
   * When true, marks the editor as failing validation for assistive technologies.
   */
  'aria-invalid'?: boolean | 'true' | 'false';

  /**
   * Ids of elements describing the editor, merged with variable tooltip ids when active.
   */
  'aria-describedby'?: string;
}

const lightHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: '#881391' },
  { tag: tags.string, color: '#c41a16' },
  { tag: tags.number, color: '#1c00cf' },
  { tag: tags.bool, color: '#1c00cf' },
  { tag: tags.null, color: '#1c00cf' },
  { tag: tags.keyword, color: '#881391' },
  { tag: tags.bracket, color: 'var(--mac-text)' },
  { tag: tags.punctuation, color: 'var(--mac-muted)' },
  { tag: tags.comment, color: 'var(--mac-muted)', fontStyle: 'italic' }
]);

const darkHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: '#ff7ab2' },
  { tag: tags.string, color: '#ff8170' },
  { tag: tags.number, color: '#78dce8' },
  { tag: tags.bool, color: '#78dce8' },
  { tag: tags.null, color: '#78dce8' },
  { tag: tags.keyword, color: '#ff7ab2' },
  { tag: tags.bracket, color: 'var(--mac-text)' },
  { tag: tags.punctuation, color: 'var(--mac-muted)' },
  { tag: tags.comment, color: 'var(--mac-muted)', fontStyle: 'italic' }
]);

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--mac-text)'
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-mono)'
  },
  '.cm-content': {
    padding: '8px 0',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    caretColor: 'var(--mac-accent)'
  },
  '.cm-line': {
    padding: '0 8px'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--mac-accent)'
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--mac-selection) !important'
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--mac-muted)',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--mac-selection)'
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--mac-selection) 45%, transparent)'
  },
  '.cm-variable-token': {
    color: '#32D2E2'
  },
  '.cm-tooltip.cm-tooltip-hover': {
    border: '1px solid var(--mac-separator)',
    backgroundColor: 'var(--mac-surface)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  '.cm-variable-tooltip': {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'var(--mac-text)'
  },
  '.cm-variable-tooltip-muted': {
    color: 'var(--mac-muted)'
  },
  '.cm-variable-tooltip-edit': {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--mac-accent)'
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    border: '1px solid var(--mac-separator)',
    backgroundColor: 'var(--mac-surface)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '14px'
  },
  '.cm-completionLabel': {
    fontFamily: 'var(--font-mono)'
  },
  '.cm-completionDetail': {
    color: 'var(--mac-muted)',
    fontStyle: 'normal',
    marginLeft: '8px'
  }
});

const variableMatcher = new MatchDecorator({
  regexp: new RegExp(`\\{\\{\\s*([${VARIABLE_NAME_CHARS}]+)\\s*\\}\\}`, 'g'),
  decoration: Decoration.mark({ class: 'cm-variable-token' })
});

const variableHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    /**
     * Builds the initial {{variable}} decoration set for the editor view.
     *
     * @param view - CodeMirror editor view instance.
     */
    constructor(view: EditorView) {
      this.decorations = variableMatcher.createDeco(view);
    }

    /**
     * Recomputes decorations when document content or viewport changes.
     *
     * @param update - View update describing what changed.
     */
    update(update: ViewUpdate): void {
      this.decorations = variableMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (v) => v.decorations }
);

interface SelectionTooltipState {
  key: string;
  top: number;
  left: number;
}

/**
 * Finds the {{variable}} token at a document position, if any.
 *
 * @param doc - CodeMirror document.
 * @param pos - Character position in the document.
 * @returns Variable key and token range, or null when not inside a token.
 */
function findVariableAtPos(
  doc: { lineAt: (pos: number) => { from: number; text: string } },
  pos: number
): { key: string; start: number; end: number } | null {
  const line = doc.lineAt(pos);
  const pattern = new RegExp(`\\{\\{\\s*([${VARIABLE_NAME_CHARS}]+)\\s*\\}\\}`, 'g');

  for (const match of line.text.matchAll(pattern)) {
    const start = line.from + (match.index ?? 0);
    const end = start + match[0].length;
    if (pos < start || pos > end) continue;
    return { key: match[1], start, end };
  }

  return null;
}

/**
 * Builds DOM content for a variable tooltip.
 *
 * @param key - Variable name from the token.
 * @param variables - Collection-scoped variables for resolution.
 * @param onEditVariable - Optional callback to open collection settings.
 */
function buildVariableTooltipDom(
  key: string,
  variables: Variable[],
  onEditVariable?: () => void
): HTMLDivElement {
  const content = getVariableTooltipContent(key, variables);
  const dom = document.createElement('div');
  dom.className = 'cm-variable-tooltip';

  const valueEl = document.createElement('div');
  valueEl.textContent = content.text;
  if (content.muted) {
    valueEl.className = 'cm-variable-tooltip-muted';
  }
  dom.appendChild(valueEl);

  if (onEditVariable) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Edit value';
    btn.className = 'cm-variable-tooltip-edit';
    btn.setAttribute('aria-label', `Edit value for ${key}`);
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onEditVariable();
    });
    dom.appendChild(btn);
  }

  return dom;
}

/**
 * Joins non-empty element ids into a space-separated `aria-describedby` value.
 *
 * @param ids - Candidate element ids.
 * @returns Merged id string, or undefined when no ids are provided.
 */
function mergeDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const merged = ids.filter((id): id is string => id != null && id !== '');
  return merged.length > 0 ? merged.join(' ') : undefined;
}

/**
 * Sets or clears `aria-describedby` on the CodeMirror content element.
 *
 * @param content - Editable `.cm-content` element.
 * @param getValidationDescribedBy - Returns validation/helper ids from props.
 * @param tooltipId - Optional variable tooltip id to include while visible.
 */
function setContentDescribedBy(
  content: Element | null | undefined,
  getValidationDescribedBy: () => string | undefined,
  tooltipId?: string
): void {
  if (!content) return;
  const describedBy = mergeDescribedBy(getValidationDescribedBy(), tooltipId);
  if (describedBy) {
    content.setAttribute('aria-describedby', describedBy);
  } else {
    content.removeAttribute('aria-describedby');
  }
}

/**
 * Shows a keyboard-driven tooltip when the caret moves inside a {{variable}} token.
 *
 * @param tooltipId - Stable id referenced by `aria-describedby`.
 * @param onTooltipChange - Callback invoked when tooltip visibility or position changes.
 * @param getValidationDescribedBy - Returns validation/helper ids from editor props.
 */
function variableSelectionTooltip(
  tooltipId: string,
  onTooltipChange: (state: SelectionTooltipState | null) => void,
  getValidationDescribedBy: () => string | undefined
): ReturnType<typeof EditorView.updateListener.of> {
  return EditorView.updateListener.of((update) => {
    if (!update.selectionSet && !update.docChanged) return;

    const content = update.view.dom.querySelector('.cm-content');
    const pos = update.state.selection.main.head;
    const match = findVariableAtPos(update.state.doc, pos);

    if (!match) {
      onTooltipChange(null);
      setContentDescribedBy(content, getValidationDescribedBy);
      return;
    }

    const coords = update.view.coordsAtPos(match.start);
    if (!coords) {
      onTooltipChange(null);
      setContentDescribedBy(content, getValidationDescribedBy);
      return;
    }

    onTooltipChange({
      key: match.key,
      top: coords.top,
      left: coords.left + (coords.right - coords.left) / 2
    });
    setContentDescribedBy(content, getValidationDescribedBy, tooltipId);
  });
}

/**
 * Dismisses the keyboard tooltip when Escape is pressed.
 *
 * @param isOpen - Returns whether the keyboard tooltip is currently visible.
 * @param onDismiss - Called to hide the keyboard tooltip.
 * @param getValidationDescribedBy - Returns validation/helper ids from editor props.
 */
function variableTooltipEscapeHandler(
  isOpen: () => boolean,
  onDismiss: (view: EditorView) => void,
  getValidationDescribedBy: () => string | undefined
): ReturnType<typeof EditorView.domEventHandlers> {
  return EditorView.domEventHandlers({
    keydown(event, view) {
      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault();
        onDismiss(view);
        setContentDescribedBy(view.dom.querySelector('.cm-content'), getValidationDescribedBy);
        return true;
      }
      return false;
    }
  });
}

/**
 * Builds a hover tooltip extension for {{variable}} tokens.
 *
 * @param variables - Collection-scoped variables for resolution.
 * @param onEditVariable - Optional callback to open collection settings.
 */
function variableTooltip(
  variables: Variable[],
  onEditVariable?: () => void
): ReturnType<typeof hoverTooltip> {
  return hoverTooltip((view, pos) => {
    const match = findVariableAtPos(view.state.doc, pos);
    if (!match) return null;

    return {
      pos: match.start,
      end: match.end,
      above: true,
      create() {
        return { dom: buildVariableTooltipDom(match.key, variables, onEditVariable) };
      }
    };
  });
}

/**
 * CodeMirror wrapper for editable request bodies and read-only response views.
 *
 * Styling relies on host CSS variables (`--mac-*`, `--font-mono`) and the `.app-no-drag`
 * class defined in HarborClient `styles.css`.
 */
export function CodeEditor({
  value,
  onChange,
  language = 'text',
  readOnly = false,
  placeholder,
  minHeight = '144px',
  className = '',
  variables,
  onEditVariable,
  completionSource,
  themeOverride,
  setupOverride,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy
}: Props): JSX.Element {
  const config = useCodeEditorConfig();
  const resolvedTheme = themeOverride ?? config.theme;
  const resolvedSetup = setupOverride ?? (readOnly ? null : config.setup);
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [selectionTooltip, setSelectionTooltip] = useState<SelectionTooltipState | null>(null);
  const selectionTooltipRef = useRef(selectionTooltip);
  selectionTooltipRef.current = selectionTooltip;
  const setSelectionTooltipRef = useRef(setSelectionTooltip);
  setSelectionTooltipRef.current = setSelectionTooltip;
  const ariaDescribedByRef = useRef(ariaDescribedBy);
  ariaDescribedByRef.current = ariaDescribedBy;
  const tooltipId = useId();
  const getValidationDescribedBy = (): string | undefined => ariaDescribedByRef.current;

  /**
   * Tracks system dark mode so syntax highlighting matches the active theme.
   */
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => setIsDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  /**
   * Assembles CodeMirror extensions for language mode, theme, and optional variable tooling.
   */
  const extensions = useMemo(() => {
    const next = [EditorView.lineWrapping, editorTheme];
    const themeExtension = getCodeEditorThemeExtension(resolvedTheme);
    if (themeExtension) {
      next.push(themeExtension);
    } else {
      next.push(syntaxHighlighting(isDark ? darkHighlight : lightHighlight));
    }
    if (language === 'json') {
      next.push(json());
    }
    if (language === 'javascript') {
      next.push(javascript());
      if (completionSource) {
        next.push(
          autocompletion({
            activateOnTyping: true,
            override: [completionSource]
          })
        );
      }
    }
    if (language === 'shell') {
      next.push(StreamLanguage.define(shell));
    }
    if (variables) {
      next.push(
        variableHighlighter,
        variableTooltip(variables, onEditVariable),
        variableSelectionTooltip(
          tooltipId,
          (state) => {
            setSelectionTooltipRef.current(state);
          },
          getValidationDescribedBy
        ),
        variableTooltipEscapeHandler(
          () => selectionTooltipRef.current != null,
          () => {
            setSelectionTooltipRef.current(null);
          },
          getValidationDescribedBy
        )
      );
    }
    const contentAttrs: Record<string, string> = {};
    if (id) contentAttrs.id = id;
    if (ariaLabel) contentAttrs['aria-label'] = ariaLabel;
    if (ariaLabelledBy) contentAttrs['aria-labelledby'] = ariaLabelledBy;
    if (ariaInvalid != null) contentAttrs['aria-invalid'] = String(ariaInvalid);
    if (ariaDescribedBy) contentAttrs['aria-describedby'] = ariaDescribedBy;
    if (Object.keys(contentAttrs).length > 0) {
      next.push(EditorView.contentAttributes.of(contentAttrs));
    }
    return next;
  }, [
    resolvedTheme,
    isDark,
    language,
    variables,
    onEditVariable,
    completionSource,
    id,
    ariaLabel,
    ariaLabelledBy,
    ariaInvalid,
    ariaDescribedBy,
    tooltipId
  ]);

  /**
   * Resolves CodeMirror basicSetup from persisted settings or read-only defaults.
   */
  const basicSetup = useMemo(() => {
    if (!resolvedSetup) {
      return {
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        highlightSelectionMatches: false,
        autocompletion: false,
        closeBrackets: false,
        indentOnInput: false
      };
    }

    if (readOnly) {
      return {
        lineNumbers: resolvedSetup.lineNumbers,
        foldGutter: resolvedSetup.foldGutter,
        highlightActiveLine: resolvedSetup.highlightActiveLine,
        highlightActiveLineGutter: resolvedSetup.highlightActiveLineGutter,
        highlightSelectionMatches: false,
        autocompletion: false,
        closeBrackets: false,
        indentOnInput: false
      };
    }

    return {
      lineNumbers: resolvedSetup.lineNumbers,
      foldGutter: resolvedSetup.foldGutter,
      highlightActiveLine: resolvedSetup.highlightActiveLine,
      highlightActiveLineGutter: resolvedSetup.highlightActiveLineGutter
    };
  }, [resolvedSetup, readOnly]);

  const wrapperClassName = readOnly
    ? `overflow-hidden rounded-md bg-control shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.06)] app-no-drag ${className}`
    : `min-h-36 resize-y overflow-hidden rounded-md border border-separator bg-control shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.06)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--mac-accent)_35%,transparent),inset_0_0.5px_1px_rgba(0,0,0,0.06)] app-no-drag ${className}`;

  const selectionTooltipContent = selectionTooltip
    ? getVariableTooltipContent(selectionTooltip.key, variables ?? [])
    : null;

  return (
    <div className={wrapperClassName}>
      {createElement(CodeMirrorImport, {
        value,
        onChange: readOnly ? undefined : onChange,
        extensions,
        theme: 'none',
        editable: !readOnly,
        readOnly,
        placeholder,
        minHeight,
        basicSetup
      })}
      {selectionTooltip && selectionTooltipContent && variables ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-auto fixed z-50 flex max-w-sm -translate-x-1/2 -translate-y-full flex-col gap-1.5 rounded-md border border-separator bg-surface px-3 py-2 text-[14px] text-text shadow-md app-no-drag"
          style={{ top: selectionTooltip.top - 4, left: selectionTooltip.left }}
        >
          <span className={selectionTooltipContent.muted ? 'text-muted' : undefined}>
            {selectionTooltipContent.text}
          </span>
          {onEditVariable ? (
            <button
              type="button"
              className="self-start text-[14px] text-accent hover:underline"
              aria-label={`Edit value for ${selectionTooltip.key}`}
              onMouseDown={(event) => {
                event.preventDefault();
                onEditVariable();
                setSelectionTooltip(null);
              }}
            >
              Edit value
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
