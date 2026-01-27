import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../../components/ui/select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </>
    ),
  },
};

export const WithSelectedValue: Story = {
  args: {
    value: 'option2',
    children: (
      <>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </>
    ),
  },
};

export const LongOptions: Story = {
  args: {
    children: (
      <>
        <option value="">Choose a category</option>
        <option value="cat1">Business Expenses</option>
        <option value="cat2">Personal Entertainment</option>
        <option value="cat3">Transportation Costs</option>
        <option value="cat4">Food and Dining</option>
        <option value="cat5">Healthcare Services</option>
      </>
    ),
  },
};
