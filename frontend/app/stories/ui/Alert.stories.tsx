import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../components/ui/alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default alert message',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};

export const AlertError: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred. Please try again.',
  },
};

export const WithCustomContent: Story = {
  args: {
    variant: 'success',
    children: (
      <div className="flex items-center gap-2">
        <span className="text-lg">✓</span>
        <span>Your changes have been saved successfully</span>
      </div>
    ),
  },
};

export const LongMessage: Story = {
  args: {
    variant: 'error',
    children:
      'This is a longer error message that demonstrates how the alert component handles multiple lines of text content and maintains proper spacing and readability.',
  },
};
