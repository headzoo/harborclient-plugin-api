import { useMemo, useState } from '@harborclient/sdk/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { AutocompleteSource } from './types.js';
import { AutocompleteInput } from './AutocompleteInput.js';

/**
 * Creates an in-memory async autocomplete source backed by React state.
 *
 * @param initial - Initial suggestion values.
 */
function createMemorySource(initial: string[]): {
  source: AutocompleteSource;
  useSource: () => AutocompleteSource;
} {
  let values = [...initial];

  const source: AutocompleteSource = {
    list: async () => [...values],
    add: async (value) => {
      if (!values.some((item) => item.toLowerCase() === value.toLowerCase())) {
        values = [...values, value];
      }
    }
  };

  return {
    source,
    /**
     * Returns a stable source instance for Storybook renders.
     */
    useSource: () => useMemo(() => source, [])
  };
}

const headerKeys = createMemorySource([
  'Accept',
  'Authorization',
  'Content-Type',
  'User-Agent',
  'X-Request-Id'
]);

const meta = {
  title: 'Components/AutocompleteInput',
  component: AutocompleteInput,
  tags: ['autodocs'],
  args: {
    value: '',
    placeholder: 'Header name',
    'aria-label': 'Header name'
  }
} satisfies Meta<typeof AutocompleteInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: fn()
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <AutocompleteInput {...args} value={value} onChange={setValue} />;
  }
};

export const WithSource: Story = {
  args: {
    onChange: fn()
  },
  render: (args) => {
    const [value, setValue] = useState('Auth');
    const { useSource } = headerKeys;
    const source = useSource();

    return (
      <AutocompleteInput
        {...args}
        value={value}
        onChange={setValue}
        source={source}
        placeholder="Header name"
        aria-label="Header name"
      />
    );
  }
};
