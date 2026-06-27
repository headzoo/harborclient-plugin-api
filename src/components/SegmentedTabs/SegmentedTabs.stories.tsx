import { useState } from '@harborclient/sdk/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  SegmentedTabPanel,
  SegmentedTabs,
  SegmentedTabsGroup,
  type TabItem
} from './index.js';

type RequestTab = 'params' | 'headers' | 'body';

const tabs: TabItem<RequestTab>[] = [
  { value: 'params', label: 'Params', indicator: true },
  { value: 'headers', label: 'Headers' },
  { value: 'body', label: 'Body', disabled: true }
];

const meta = {
  title: 'Components/SegmentedTabs',
  component: SegmentedTabs,
  tags: ['autodocs'],
  argTypes: {
    pattern: {
      control: 'select',
      options: ['tabs', 'radiogroup']
    },
    fullWidth: { control: 'boolean' }
  },
  args: {
    tabs,
    value: 'params',
    onChange: fn(),
    ariaLabel: 'Request sections'
  }
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone: Story = {
  render: (args) => {
    const [value, setValue] = useState<RequestTab>(args.value as RequestTab);
    return <SegmentedTabs {...args} value={value} onChange={(next) => setValue(next as RequestTab)} />;
  }
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    className: 'max-w-md'
  },
  render: (args) => {
    const [value, setValue] = useState<RequestTab>(args.value as RequestTab);
    return <SegmentedTabs {...args} value={value} onChange={(next) => setValue(next as RequestTab)} />;
  }
};

export const RadioGroup: Story = {
  args: {
    pattern: 'radiogroup',
    tabs: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ],
    value: 'left',
    ariaLabel: 'Alignment'
  },
  render: (args) => {
    const [value, setValue] = useState<'left' | 'center' | 'right'>(args.value as 'left');
    return (
      <SegmentedTabs
        {...args}
        value={value}
        onChange={setValue as (next: string) => void}
      />
    );
  }
};

export const WithPanels: Story = {
  render: () => {
    const [value, setValue] = useState<RequestTab>('params');
    return (
      <SegmentedTabsGroup value={value} onChange={setValue} ariaLabel="Request editor">
        <SegmentedTabs tabs={tabs} />
        <SegmentedTabPanel value="params" className="mt-3 text-[14px] text-muted">
          Query parameters go here.
        </SegmentedTabPanel>
        <SegmentedTabPanel value="headers" className="mt-3 text-[14px] text-muted">
          Request headers go here.
        </SegmentedTabPanel>
        <SegmentedTabPanel value="body" className="mt-3 text-[14px] text-muted">
          Body editor goes here.
        </SegmentedTabPanel>
      </SegmentedTabsGroup>
    );
  }
};
