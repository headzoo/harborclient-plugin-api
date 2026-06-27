import type { Meta, StoryObj } from '@storybook/react-vite';
import { BusyIndicator } from './index.js';

const meta = {
  title: 'Components/BusyIndicator',
  component: BusyIndicator,
  tags: ['autodocs'],
  argTypes: {
    isBusy: { control: 'boolean' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Global busy overlay with a delayed show and minimum visible duration. Requires host styles for `body.app-busy` and `.busy-progress-bar`.'
      }
    }
  }
} satisfies Meta<typeof BusyIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    isBusy: false
  }
};

export const Busy: Story = {
  args: {
    isBusy: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Overlay appears after ~150ms when `isBusy` stays true.'
      }
    }
  }
};
