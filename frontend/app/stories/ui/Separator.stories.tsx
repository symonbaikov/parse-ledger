import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../../components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-48">
      <p>Content above</p>
      <Separator />
      <p>Content below</p>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="w-48">
      <p>Content above</p>
      <Separator className="bg-blue-500 h-0.5" />
      <p>Content below</p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="rounded-lg border p-4 w-64">
      <h3 className="font-semibold mb-2">Card Title</h3>
      <p className="text-sm text-gray-600 mb-3">Some description text</p>
      <Separator />
      <div className="mt-3">
        <p className="text-sm">More content below the separator</p>
      </div>
    </div>
  ),
};
