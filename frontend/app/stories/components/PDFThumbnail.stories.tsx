import type { Meta, StoryObj } from '@storybook/react';
import { PDFThumbnail } from '../../components/PDFThumbnail';

const meta: Meta<typeof PDFThumbnail> = {
  title: 'Components/PDFThumbnail',
  component: PDFThumbnail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fileId: {
      control: 'text',
    },
    fileName: {
      control: 'text',
    },
    size: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fileId: 'file-123',
    fileName: 'document.pdf',
    size: 40,
  },
};

export const Large: Story = {
  args: {
    fileId: 'file-456',
    fileName: 'large-document.pdf',
    size: 80,
  },
};

export const Small: Story = {
  args: {
    fileId: 'file-789',
    fileName: 'small-doc.pdf',
    size: 24,
  },
};

export const CustomStyling: Story = {
  args: {
    fileId: 'file-custom',
    fileName: 'styled-doc.pdf',
    size: 60,
    className: 'rounded-lg border-2 border-gray-300',
  },
};
