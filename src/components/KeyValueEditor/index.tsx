import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { JSX } from 'react';
import type { KeyValue, Variable } from '../../types.js';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { Input, fieldFrame } from '../forms/index.js';
import { VariableInput } from '../VariableInput/index.js';

export interface Props {
  /**
   * Editable key-value rows.
   */
  rows: KeyValue[];

  /**
   * Called when rows are added, updated, or removed.
   *
   * @param rows - Updated row list.
   */
  onChange: (rows: KeyValue[]) => void;

  /**
   * Placeholder text for the key column.
   */
  placeholderKey?: string;

  /**
   * Placeholder text for the value column.
   */
  placeholderValue?: string;

  /**
   * Collection-scoped variables for value highlighting and tooltips.
   */
  variables: Variable[];

  /**
   * Opens collection settings to edit a hovered variable.
   */
  onEditVariable?: () => void;
}

const thClass =
  'border-r border-b border-separator p-3 text-left text-[14px] font-medium uppercase tracking-wide text-muted last:border-r-0';
const tdClass = 'border-r border-b border-separator p-3 last:border-r-0';

/**
 * Editable table of key-value rows with enable toggles for headers and params.
 */
export function KeyValueEditor({
  rows,
  onChange,
  placeholderKey = 'Key',
  placeholderValue = 'Value',
  variables,
  onEditVariable
}: Props): JSX.Element {
  /**
   * Updates a single row by index.
   *
   * @param index - Row index to update.
   * @param patch - Partial fields to merge into the row.
   */
  const updateRow = (index: number, patch: Partial<KeyValue>): void => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    const isLast = index === rows.length - 1;
    if (isLast && next[index].key.trim() !== '') {
      next.push({ key: '', value: '', enabled: true });
    }
    onChange(next);
  };

  /**
   * Removes a row, keeping at least one empty row.
   *
   * @param index - Row index to remove.
   */
  const removeRow = (index: number): void => {
    if (rows.length === 1) {
      onChange([{ key: '', value: '', enabled: true }]);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-hidden rounded-md border border-separator">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th scope="col" className={`${thClass} w-6 p-0`}>
              <span className="sr-only">Enable</span>
            </th>
            <th scope="col" className={thClass}>
              Key
            </th>
            <th scope="col" className={thClass}>
              Value
            </th>
            <th scope="col" className={`${thClass} w-7 p-0`} />
          </tr>
        </thead>
        <tbody className="[&_tr:last-child_td]:border-b-0">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className={`${tdClass} w-6 p-1 text-center`}>
                <Input
                  type="checkbox"
                  className="app-no-drag"
                  checked={row.enabled}
                  onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                  aria-label={`Enable row ${index + 1}`}
                  title="Enable"
                />
              </td>
              <td className={tdClass}>
                <Input
                  type="text"
                  className="w-full"
                  value={row.key}
                  placeholder={placeholderKey}
                  aria-label={`Key, row ${index + 1}`}
                  onChange={(e) => updateRow(index, { key: e.target.value })}
                />
              </td>
              <td className={tdClass}>
                <VariableInput
                  wrapperClassName={`${fieldFrame} w-full`}
                  className="app-no-drag"
                  value={row.value}
                  onChange={(value) => updateRow(index, { value })}
                  variables={variables}
                  placeholder={placeholderValue}
                  aria-label={`Value, row ${index + 1}`}
                  onEditVariable={onEditVariable}
                />
              </td>
              <td className={`${tdClass} w-7 p-1 text-center`}>
                <Button
                  type="button"
                  variant="iconDanger"
                  onClick={() => removeRow(index)}
                  title="Remove"
                  aria-label={`Remove row ${index + 1}`}
                >
                  <FaIcon icon={faXmark} className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
