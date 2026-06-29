import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../forms/Input.js';
import { FormGroup } from './index.js';

const meta = {
  title: 'Components/FormGroup',
  component: FormGroup,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['stacked', 'checkbox', 'inline', 'radio', 'checkboxAdjacent', 'associated']
    },
    labelTone: {
      control: 'select',
      options: ['default', 'muted']
    }
  }
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stacked: Story = {
  args: {
    label: 'API key',
    htmlFor: 'api-key',
    description: 'Used to authenticate requests from this plugin.',
    children: <Input id="api-key" placeholder="sk-…" />
  }
};

export const WithError: Story = {
  args: {
    label: 'Endpoint URL',
    htmlFor: 'endpoint-url',
    error: 'Enter a valid HTTPS URL.',
    children: <Input id="endpoint-url" defaultValue="not-a-url" />
  }
};

export const Checkbox: Story = {
  args: {
    label: 'Enable debug logging',
    layout: 'checkbox',
    children: <Input type="checkbox" />
  },
  parameters: {
    docs: {
      description: {
        story: 'Label association is automatic — no `htmlFor` or `id` required on the control.'
      }
    }
  }
};
