import { StoryFn, Meta } from '@storybook/react';
import LumeIdentity from './LumeIdentity';

export default {
  title: 'LumeIdentity',
  component: LumeIdentity,
} as Meta<typeof LumeIdentity>;

const Template: StoryFn<typeof LumeIdentity> = (args) => <LumeIdentity {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  // Add initial props here
};