import type { Variable } from '../types.js';
import { getDynamicVariableDescription, resolveDynamicVariable } from './dynamic.js';

/**
 * A segment of text, optionally marking a {{variable}} token.
 */
export interface VariableToken {
  text: string;
  key?: string;
}

/**
 * Allowed characters inside a `{{variable}}` token name (excluding braces).
 * Includes `$` so Postman-style dynamic names such as `$randomUUID` are recognized.
 */
export const VARIABLE_NAME_CHARS = '\\w$.-';

/**
 * Global regex matching `{{variableName}}` placeholders in request text.
 */
export const VARIABLE_TOKEN_PATTERN = new RegExp(
  `\\{\\{\\s*([${VARIABLE_NAME_CHARS}]+)\\s*\\}\\}`,
  'g'
);

/**
 * Builds a lookup map from collection variables.
 *
 * @param variables - Collection-scoped variables.
 * @returns Map of trimmed keys to resolved values.
 */
function variableLookup(variables: Variable[]): Map<string, string> {
  return new Map(
    variables
      .filter((v) => v.key.trim())
      .map((v) => [v.key.trim(), v.value !== '' ? v.value : v.defaultValue])
  );
}

/**
 * Splits text into plain and {{variable}} segments.
 *
 * @param text - Text containing variable placeholders.
 * @returns Ordered tokens for rendering or further processing.
 */
export function tokenizeVariables(text: string): VariableToken[] {
  const tokens: VariableToken[] = [];
  const pattern = new RegExp(VARIABLE_TOKEN_PATTERN.source, 'g');
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, index) });
    }
    tokens.push({ text: match[0], key: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex) });
  }

  return tokens;
}

/**
 * A {{variable}} token located at a character offset in source text.
 */
export interface VariableTokenMatch {
  key: string;
  start: number;
  end: number;
}

/**
 * Returns the variable token containing the given character offset, if any.
 *
 * @param text - Text containing variable placeholders.
 * @param offset - Zero-based character offset from the start of `text`.
 * @returns Matching token range and key, or null when offset is outside a token.
 */
export function getVariableTokenAtOffset(text: string, offset: number): VariableTokenMatch | null {
  let position = 0;

  for (const token of tokenizeVariables(text)) {
    const start = position;
    const end = position + token.text.length;
    if (token.key && offset >= start && offset <= end) {
      return { key: token.key, start, end };
    }
    position = end;
  }

  return null;
}

/**
 * Resolved tooltip text for a variable key.
 */
export interface VariableTooltipContent {
  text: string;
  muted: boolean;
}

/**
 * Resolves display text for a variable tooltip.
 *
 * @param key - Variable name from a {{key}} placeholder.
 * @param variables - Collection-scoped variables.
 * @returns Tooltip body text and whether it should use muted styling.
 */
export function getVariableTooltipContent(
  key: string,
  variables: Variable[]
): VariableTooltipContent {
  const value = resolveVariable(key, variables);
  if (value !== undefined) {
    return { text: value, muted: false };
  }

  const dynamicDescription = getDynamicVariableDescription(key);
  if (dynamicDescription) {
    return { text: `Dynamic: ${dynamicDescription}`, muted: true };
  }

  return { text: 'Not defined', muted: true };
}

/**
 * Resolves a single variable key against collection variables.
 *
 * @param key - Variable name from a {{key}} placeholder.
 * @param variables - Collection-scoped variables.
 * @returns Resolved value, or undefined when the key is not defined.
 */
export function resolveVariable(key: string, variables: Variable[]): string | undefined {
  return variableLookup(variables).get(key);
}

/**
 * Replaces {{key}} placeholders in text with collection variable values.
 *
 * Static collection/environment variables take precedence over dynamic variables.
 * Unknown tokens are left unchanged.
 *
 * @param text - Text containing variable placeholders.
 * @param variables - Collection-scoped variables.
 * @returns Text with known variables substituted; unknown tokens are left unchanged.
 */
export function substituteVariables(text: string, variables: Variable[]): string {
  const lookup = variableLookup(variables);
  const pattern = new RegExp(VARIABLE_TOKEN_PATTERN.source, 'g');

  return text.replace(pattern, (match, key: string) => {
    const value = lookup.get(key);
    if (value !== undefined) {
      return value;
    }
    const dynamic = resolveDynamicVariable(key);
    return dynamic !== undefined ? dynamic : match;
  });
}
