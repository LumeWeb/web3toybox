import { StoryFn, Meta } from '@storybook/react';
import LumeDashboard from './LumeDashboard';
import LumeProvider from '../LumeProvider';

export default {
  title: 'LumeDashboard',
  component: LumeDashboard,
} as Meta<typeof LumeDashboard>;

const Template: StoryFn<typeof LumeDashboard> = (args) => <LumeProvider>
  <LumeDashboard {...args} />
</LumeProvider>;

export const Primary = Template.bind({});
Primary.args = {
  // Add initial props here
};