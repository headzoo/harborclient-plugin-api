import type { JSX } from 'react';
import type { HttpMethod } from '../../types.js';
import { methodColorClass } from '../../ui/tokens.js';
import { Select } from '../forms/index.js';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface Props {
  /**
   * Currently selected HTTP method.
   */
  value: HttpMethod;

  /**
   * Called when the user picks a different method.
   *
   * @param method - Newly selected HTTP method.
   */
  onChange: (method: HttpMethod) => void;
}

/**
 * Dropdown for selecting an HTTP request method.
 */
export function MethodSelect({ value, onChange }: Props): JSX.Element {
  return (
    <Select
      variant="plain"
      className={`hc-method-select w-[100px] shrink-0 cursor-pointer appearance-none border-none bg-transparent px-2 py-1.5 text-[14px] leading-none font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent app-no-drag ${methodColorClass(value)}`}
      value={value}
      aria-label="HTTP method"
      onChange={(e) => onChange(e.target.value as HttpMethod)}
    >
      {METHODS.map((method) => (
        <option key={method} value={method} className={methodColorClass(method)}>
          {method}
        </option>
      ))}
    </Select>
  );
}
