import type { Meta, StoryObj } from '@storybook/html';
import { expect, within } from '@storybook/test';
import { IRRenderer, createIRComponent } from '../ir';
import type { IRComponent } from '../types/ir-schema';

// Create a story wrapper that renders IR components
function renderIRComponent(component: IRComponent): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 border border-gray-200 rounded-lg';
  
  const renderer = new IRRenderer();
  const renderedElement = renderer.render(component);
  
  container.appendChild(renderedElement);
  return container;
}

const meta: Meta<{ component: IRComponent }> = {
  title: 'Phase 2/IR Renderer',
  render: (args) => {
    return renderIRComponent(args['component']);
  },
  argTypes: {
    component: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<{ component: IRComponent }>;

// Test Scenario 1: Basic IR Rendering
export const BasicButton: Story = {
  args: {
    component: {
      id: 'basic-button-story',
      type: 'Button',
      props: {
        variant: 'primary',
        children: ['Click me'], // For simple text buttons, use props.children
      },
      children: [],
      slots: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that button renders with correct classes
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Click me');
    await expect(button).toHaveClass('builder-button');
  },
};

// Nested Structure (Row containing Buttons)
export const RowWithButtons: Story = {
  args: {
    component: {
      id: 'test-row-1',
      type: 'Row',
      props: {
        gap: 'md',
        alignItems: 'center',
      },
      children: [
        createIRComponent('Button', {
          variant: 'primary',
          children: ['Button 1'],
        }),
        createIRComponent('Button', {
          variant: 'secondary', 
          children: ['Button 2'],
        }),
        createIRComponent('Button', {
          variant: 'outline',
          children: ['Button 3'],
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that row container exists
    const row = canvas.getByTestId('test-row-1');
    await expect(row).toBeInTheDocument();
    await expect(row).toHaveClass('builder-row', 'flex', 'flex-row');
    
    // Test that all three buttons are rendered as children
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(3);
    
    // Test button content
    await expect(buttons[0]).toHaveTextContent('Button 1');
    await expect(buttons[1]).toHaveTextContent('Button 2');
    await expect(buttons[2]).toHaveTextContent('Button 3');
    
    // Test that buttons are direct children of the row
    buttons.forEach(button => {
      expect(button.parentElement).toBe(row);
    });
  },
};

export const StackWithMixedComponents: Story = {
  args: {
    component: {
      id: 'test-stack-1',
      type: 'Stack',
      props: {
        gap: 'lg',
        alignItems: 'start',
      },
      children: [
        createIRComponent('Button', {
          variant: 'primary',
          children: ['Top Button'],
        }),
        {
          id: 'nested-row-1',
          type: 'Row',
          props: {
            gap: 'sm',
            justifyContent: 'center',
          },
          children: [
            createIRComponent('Button', {
              variant: 'outline',
              children: ['Left'],
            }),
            createIRComponent('Button', {
              variant: 'outline', 
              children: ['Right'],
            }),
          ],
        },
        createIRComponent('Button', {
          variant: 'secondary',
          children: ['Bottom Button'],
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test stack container
    const stack = canvas.getByTestId('test-stack-1');
    await expect(stack).toBeInTheDocument();
    await expect(stack).toHaveClass('builder-stack', 'flex', 'flex-col');
    
    // Test nested row
    const nestedRow = canvas.getByTestId('nested-row-1');
    await expect(nestedRow).toBeInTheDocument();
    await expect(nestedRow).toHaveClass('builder-row', 'flex', 'flex-row');
    
    // Test all buttons are rendered
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(4);
    
    // Test button hierarchy - top and bottom buttons should be direct children of stack
    const topButton = canvas.getByText('Top Button');
    const bottomButton = canvas.getByText('Bottom Button');
    await expect(topButton.parentElement).toBe(stack);
    await expect(bottomButton.parentElement).toBe(stack);
    
    // Test nested buttons should be children of the nested row
    const leftButton = canvas.getByText('Left');
    const rightButton = canvas.getByText('Right');
    await expect(leftButton.parentElement).toBe(nestedRow);
    await expect(rightButton.parentElement).toBe(nestedRow);
  },
};