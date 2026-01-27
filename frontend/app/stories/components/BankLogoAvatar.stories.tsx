import type { Meta, StoryObj } from '@storybook/react';
import { BankLogoAvatar } from '../../components/BankLogoAvatar';

const meta: Meta<typeof BankLogoAvatar> = {
  title: 'Components/BankLogoAvatar',
  component: BankLogoAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    bankName: {
      control: 'text',
    },
    size: {
      control: 'number',
    },
    rounded: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bankName: 'Kaspi Bank',
    size: 32,
  },
};

export const Large: Story = {
  args: {
    bankName: 'Kaspi Bank',
    size: 64,
  },
};

export const Small: Story = {
  args: {
    bankName: 'Kaspi Bank',
    size: 24,
  },
};

export const Square: Story = {
  args: {
    bankName: 'Kaspi Bank',
    size: 48,
    rounded: false,
  },
};

export const UnknownBank: Story = {
  args: {
    bankName: 'Unknown Bank Name',
    size: 40,
  },
};

export const NoBankName: Story = {
  args: {
    size: 40,
  },
};

export const CustomStyling: Story = {
  args: {
    bankName: 'Kaspi Bank',
    size: 48,
    className: 'border-2 border-blue-500',
  },
};
