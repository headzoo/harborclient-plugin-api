import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../Button/index.js';
import { ModalFooter } from '../Modal/index.js';
import { OverlayPage } from './index.js';

const meta = {
  title: 'Components/OverlayPage',
  component: OverlayPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    onClose: fn()
  }
} satisfies Meta<typeof OverlayPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Environment settings',
    children: (
      <p className="m-0 text-[14px] text-muted">
        Configure variables and defaults for this workspace.
      </p>
    )
  }
};

export const WithFooter: Story = {
  args: {
    title: 'Plugin configuration',
    children: (
      <p className="m-0 text-[14px] text-text">
        Adjust plugin-specific options before saving.
      </p>
    ),
    footer: (
      <ModalFooter spaced className="mt-6">
        <Button variant="secondary" onClick={fn()}>
          Cancel
        </Button>
        <Button variant="primary" onClick={fn()}>
          Save
        </Button>
      </ModalFooter>
    )
  }
};
