import type { Meta, StoryObj } from '@storybook/react';
import GlobalBreadcrumbs from '../../components/GlobalBreadcrumbs';

const meta: Meta<typeof GlobalBreadcrumbs> = {
  title: 'Components/GlobalBreadcrumbs',
  component: GlobalBreadcrumbs,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <GlobalBreadcrumbs />,
  parameters: {
    nextRouter: {
      pathname: '/transactions',
    },
  },
};

export const NestedPath: Story = {
  render: () => <GlobalBreadcrumbs />,
  parameters: {
    nextRouter: {
      pathname: '/transactions/details/123',
    },
  },
};

export const SettingsPath: Story = {
  render: () => <GlobalBreadcrumbs />,
  parameters: {
    nextRouter: {
      pathname: '/settings/profile',
    },
  },
};
