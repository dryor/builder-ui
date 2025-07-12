import type { Meta, StoryObj } from '@storybook/html';
import { SimpleBoxComponent } from './simple-box';
import { SelectionManager } from '../utils';
import { SelectionOverlayManager } from './selection-overlay';

/**
 * Simple box component for testing visual builder functionality
 */
const meta: Meta = {
  title: 'Components/SimpleBox',
  parameters: {
    docs: {
      description: {
        component: 'A simple box component that demonstrates the base functionality of the visual builder runtime engine. Supports selection, drag, and resize operations.',
      },
    },
  },
  argTypes: {
    content: {
      control: { type: 'text' },
      description: 'Text content displayed in the box',
    },
    draggable: {
      control: { type: 'boolean' },
      description: 'Whether the component can be dragged',
    },
    resizable: {
      control: { type: 'boolean' },
      description: 'Whether the component can be resized',
    },
    selectable: {
      control: { type: 'boolean' },
      description: 'Whether the component can be selected',
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Creates a simple box component with the given configuration
 */
function createSimpleBox(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    width: 500px;
    height: 300px;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
    margin: 20px;
  `;

  const component = new SimpleBoxComponent({
    content: args.content,
    draggable: args.draggable,
    resizable: args.resizable,
    selectable: args.selectable,
  });

  component.style.cssText = `
    position: absolute;
    top: 50px;
    left: 50px;
  `;

  container.appendChild(component);

  // Add selection management
  new SelectionManager(container);
  new SelectionOverlayManager(container);

  // Add event listeners for demonstration
  container.addEventListener('builder:select', (event) => {
    console.log('Component selected:', event);
  });

  container.addEventListener('builder:drag:move', (event) => {
    console.log('Component dragged:', event);
  });

  container.addEventListener('builder:resize:move', (event) => {
    console.log('Component resized:', event);
  });

  // Add instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 12px;
    color: #6b7280;
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  `;
  instructions.innerHTML = `
    <strong>Instructions:</strong><br>
    • Click to select the component<br>
    • Drag to move when selected<br>
    • Use handles to resize when selected<br>
    • Check console for events
  `;
  container.appendChild(instructions);

  return container;
}

/**
 * Default simple box with standard configuration
 */
export const Default: Story = {
  args: {
    content: 'Simple Box',
    draggable: true,
    resizable: true,
    selectable: true,
  },
  render: createSimpleBox,
};

/**
 * Custom content example
 */
export const CustomContent: Story = {
  args: {
    content: 'Custom Content Box',
    draggable: true,
    resizable: true,
    selectable: true,
  },
  render: createSimpleBox,
};

/**
 * Non-draggable box
 */
export const NonDraggable: Story = {
  args: {
    content: 'Fixed Position',
    draggable: false,
    resizable: true,
    selectable: true,
  },
  render: createSimpleBox,
};

/**
 * Non-resizable box
 */
export const NonResizable: Story = {
  args: {
    content: 'Fixed Size',
    draggable: true,
    resizable: false,
    selectable: true,
  },
  render: createSimpleBox,
};

/**
 * Non-selectable box
 */
export const NonSelectable: Story = {
  args: {
    content: 'Non-Interactive',
    draggable: false,
    resizable: false,
    selectable: false,
  },
  render: createSimpleBox,
};

/**
 * Multiple components demonstration
 */
export const MultipleComponents: Story = {
  args: {},
  render: () => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: 600px;
      height: 400px;
      border: 2px dashed #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
      margin: 20px;
    `;

    // Create multiple components
    const components = [
      { content: 'Box 1', left: '20px', top: '20px' },
      { content: 'Box 2', left: '200px', top: '20px' },
      { content: 'Box 3', left: '20px', top: '150px' },
      { content: 'Box 4', left: '200px', top: '150px' },
    ];

    components.forEach(({ content, left, top }) => {
      const component = new SimpleBoxComponent({ content });
      component.style.cssText = `
        position: absolute;
        left: ${left};
        top: ${top};
      `;
      container.appendChild(component);
    });

    // Add selection management
    new SelectionManager(container);
    new SelectionOverlayManager(container);

    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      font-size: 12px;
      color: #6b7280;
      background: white;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    `;
    instructions.innerHTML = `
      <strong>Multiple Components:</strong><br>
      • Click any box to select it<br>
      • Only one can be selected at a time<br>
      • Click empty space to deselect
    `;
    container.appendChild(instructions);

    return container;
  },
};