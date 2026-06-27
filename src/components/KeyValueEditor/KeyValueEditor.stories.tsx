import { useState } from '@harborclient/sdk/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { KeyValue, Variable } from '../../types.js';
import { KeyValueEditor } from './index.js';

const sampleVariables: Variable[] = [
  { key: 'token', value: 'abc123', defaultValue: '', share: false }
];

const initialRows: KeyValue[] = [
  { key: 'Authorization', value: 'Bearer {{token}}', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true }
];

const meta = {
  title: 'Components/KeyValueEditor',
  component: KeyValueEditor,
  tags: ['autodocs'],
  args: {
    rows: initialRows,
    onChange: fn(),
    variables: sampleVariables
  }
} satisfies Meta<typeof KeyValueEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Headers: Story = {
  args: {
    onEditVariable: fn()
  },
  render: (args) => {
    const [rows, setRows] = useState<KeyValue[]>(args.rows);
    return <KeyValueEditor {...args} rows={rows} onChange={setRows} />;
  }
};

export const EmptyRow: Story = {
  args: {
    rows: [{ key: '', value: '', enabled: true }],
    placeholderKey: 'Query key',
    placeholderValue: 'Query value'
  },
  render: (args) => {
    const [rows, setRows] = useState<KeyValue[]>(args.rows);
    return <KeyValueEditor {...args} rows={rows} onChange={setRows} />;
  }
};

export const DisabledRow: Story = {
  args: {
    rows: [{ key: 'X-Debug', value: 'true', enabled: false }]
  },
  render: (args) => {
    const [rows, setRows] = useState<KeyValue[]>(args.rows);
    return <KeyValueEditor {...args} rows={rows} onChange={setRows} />;
  }
};
