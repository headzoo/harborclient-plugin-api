import type { AuthConfig } from '../types.js';
import { resolveDynamicVariable } from '../variables/dynamic.js';
import { VARIABLE_TOKEN_PATTERN } from '../variables/tokens.js';

type KeyValue = {
  key: string;
  value: string;
  enabled: boolean;
};

/**
 * Replaces {{key}} placeholders using a runtime variable map.
 *
 * @param text - Text containing variable placeholders.
 * @param runtimeVars - Current runtime variable values.
 */
export function substituteVariables(text: string, runtimeVars: Record<string, string>): string {
  const pattern = new RegExp(VARIABLE_TOKEN_PATTERN.source, 'g');
  return text.replace(pattern, (match, key: string) => {
    const value = runtimeVars[key];
    if (value !== undefined) {
      return value;
    }
    const dynamic = resolveDynamicVariable(key);
    return dynamic !== undefined ? dynamic : match;
  });
}

/**
 * Resolves {{variable}} placeholders in auth credential fields.
 *
 * @param auth - Auth config with raw editor values.
 * @param substitute - Function that resolves placeholders in a string.
 */
export function resolveAuthVariables(
  auth: AuthConfig,
  substitute: (text: string) => string
): AuthConfig {
  return {
    ...auth,
    basic: {
      username: substitute(auth.basic.username),
      password: substitute(auth.basic.password)
    },
    bearer: {
      token: substitute(auth.bearer.token)
    }
  };
}

/**
 * Substitutes variables in key-value row values.
 *
 * @param rows - Header or param rows from the draft.
 * @param runtimeVars - Merged global, collection, and environment variable map.
 */
export function substituteKeyValueRows(
  rows: KeyValue[],
  runtimeVars: Record<string, string>
): KeyValue[] {
  return rows.map((row) => ({
    ...row,
    value: substituteVariables(row.value, runtimeVars)
  }));
}
