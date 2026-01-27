import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../components/ui/label';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

export const WithHtmlFor: Story = {
  args: {
    htmlFor: 'input-id',
    children: 'Email Address',
  },
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom Styled Label',
    className: 'text-lg font-bold text-blue-600',
  },
};
