import type { Meta, StoryObj } from '@storybook/react';
import { AuthLanguageSwitcher } from '../../components/AuthLanguageSwitcher';

const meta: Meta<typeof AuthLanguageSwitcher> = {
  title: 'Components/AuthLanguageSwitcher',
  component: AuthLanguageSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AuthLanguageSwitcher />,
};
