import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldError } from './index.js';

const meta = {
  title: 'Components/FieldError',
  component: FieldError,
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['field', 'section', 'modal']
    },
    roleAlert: { control: 'boolean' }
  }
} satisfies Meta<typeof FieldError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FieldSpacing: Story = {
  args: {
    children: 'Enter a valid email address.',
    spacing: 'field'
  }
};

export const SectionSpacing: Story = {
  args: {
    children: 'Could not load settings. Try again later.',
    spacing: 'section'
  }
};

export const AsAlert: Story = {
  args: {
    children: 'Save failed. Check your connection and retry.',
    spacing: 'modal',
    roleAlert: true
  }
};
