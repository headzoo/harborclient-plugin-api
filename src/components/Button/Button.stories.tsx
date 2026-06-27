import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './index.js';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'primaryDanger',
        'secondaryDanger',
        'toolbar',
        'icon',
        'iconDanger'
      ]
    },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Save',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary'
  }
};

export const PrimaryDanger: Story = {
  args: {
    children: 'Delete',
    variant: 'primaryDanger'
  }
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true
  }
};
