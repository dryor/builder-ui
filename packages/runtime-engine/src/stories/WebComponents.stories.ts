import type { Meta, StoryObj } from '@storybook/html';
import { RowComponent, StackComponent, ButtonComponent } from '../components';
import { createIRComponent } from '../ir';

const meta: Meta = {
  title: 'Phase 2/Web Components',
  parameters: {
    docs: {
      description: {
        component: 'New Web Components for Phase 2: Row, Stack, and Button components that render from IR.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const NestedLayout: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.padding = '20px';

    const outerStack = new StackComponent({
      gap: 'lg',
      alignItems: 'stretch',
    });

    const headerRow = new RowComponent({
      gap: 'md',
      justifyContent: 'between',
    });

    const headerButton1 = ButtonComponent.fromIR(createIRComponent('Button', {
      variant: 'primary',
      children: ['Header Left'],
    }) as any);

    const headerButton2 = ButtonComponent.fromIR(createIRComponent('Button', {
      variant: 'outline',
      children: ['Header Right'],
    }) as any);

    headerRow.addChildComponent(headerButton1);
    headerRow.addChildComponent(headerButton2);

    const contentRow = new RowComponent({
      gap: 'md',
      alignItems: 'start',
    });

    const sidebarStack = new StackComponent({
      gap: 'sm',
      alignItems: 'stretch',
    });

    sidebarStack.addChildComponent(ButtonComponent.fromIR(createIRComponent('Button', {
      variant: 'ghost',
      children: ['Nav 1'],
    }) as any));

    sidebarStack.addChildComponent(ButtonComponent.fromIR(createIRComponent('Button', {
      variant: 'ghost',
      children: ['Nav 2'],
    }) as any));

    const mainButton = ButtonComponent.fromIR(createIRComponent('Button', {
      variant: 'secondary',
      children: ['Main Content'],
    }) as any);

    contentRow.addChildComponent(sidebarStack);
    contentRow.addChildComponent(mainButton);

    outerStack.addChildComponent(headerRow);
    outerStack.addChildComponent(contentRow);

    container.appendChild(outerStack);
    return container;
  },
};