import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumbs from '../../components/Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLevel: Story = {
  args: {
    items: [{ label: 'Home', href: '/' }, { label: 'Transactions' }],
  },
};

export const MultiLevel: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Transactions', href: '/transactions' },
      { label: 'Details' },
    ],
  },
};

export const AllLinks: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Transactions', href: '/transactions' },
      { label: 'Reports', href: '/transactions/reports' },
    ],
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Very Long Transaction Name Category', href: '/transactions' },
      { label: 'Even Longer Detailed Transaction Report Name' },
    ],
  },
};
