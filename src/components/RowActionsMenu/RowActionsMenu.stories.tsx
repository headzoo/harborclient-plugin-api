import { useState } from '@harborclient/sdk/react';
import type { ComponentProps, ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RowActionsMenu } from './index.js';

const meta = {
  title: 'Components/RowActionsMenu',
  component: RowActionsMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex justify-end rounded-md border border-separator px-3 py-2">
        <Story />
      </div>
    )
  ],
  args: {
    menuId: 'row-1',
    openMenuId: null,
    onOpenChange: fn(),
    groups: [[{ label: 'Refresh', onSelect: fn() }]]
  }
} satisfies Meta<typeof RowActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function RowActionsMenuDemo(
  props: Omit<ComponentProps<typeof RowActionsMenu>, 'openMenuId' | 'onOpenChange'>
): ReactElement {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return <RowActionsMenu {...props} openMenuId={openMenuId} onOpenChange={setOpenMenuId} />;
}

export const Default: Story = {
  args: {
    groups: [
      [
        { label: 'Rename', onSelect: fn() },
        { label: 'Duplicate', onSelect: fn() }
      ],
      [{ label: 'Delete', onSelect: fn(), variant: 'danger' }]
    ]
  },
  render: (args) => <RowActionsMenuDemo {...args} />
};

export const SingleGroup: Story = {
  args: {
    menuId: 'row-2',
    groups: [[{ label: 'Refresh', onSelect: fn() }]]
  },
  render: (args) => <RowActionsMenuDemo {...args} />
};
