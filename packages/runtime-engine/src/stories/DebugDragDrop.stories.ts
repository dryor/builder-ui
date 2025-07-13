import type { Meta, StoryObj } from '@storybook/html';
import { SimpleDragDemo } from '../components/SimpleDragDemo';

const meta: Meta = {
  title: 'Debug/Drag Drop Test',
};

export default meta;
type Story = StoryObj;

export const SimpleTest: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.padding = '20px';

    const ir = {
      id: 'test-workspace',
      type: 'Stack',
      props: { gap: 'md' },
      children: [
        {
          id: 'button1',
          type: 'Button',
          props: { children: ['Drag me'], variant: 'primary' },
          children: [],
          slots: {}
        },
        {
          id: 'target-row',
          type: 'Row',
          props: { 
            gap: 'md',
            className: 'min-h-[100px] bg-gray-100 border-2 border-dashed border-gray-300 p-4'
          },
          children: [
            {
              id: 'existing-button',
              type: 'Button', 
              props: { children: ['Existing'], variant: 'outline' },
              children: [],
              slots: {}
            }
          ]
        }
      ]
    };

    const demo = new SimpleDragDemo(ir as any, {
      onIRChange: (newIR) => {
        console.log('IR changed:', newIR);
      }
    });

    container.appendChild(demo);
    return container;
  }
};

export const InspectDOM: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.padding = '20px';

    const ir = {
      id: 'inspect-workspace', 
      type: 'Row',
      props: { gap: 'lg' },
      children: [
        {
          id: 'inspect-button',
          type: 'Button',
          props: { children: ['Click to inspect'], variant: 'primary' },
          children: [],
          slots: {}
        }
      ]
    };

    const demo = new SimpleDragDemo(ir as any);
    
    // Add debug button
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug DOM';
    debugBtn.style.cssText = 'margin: 10px; padding: 8px 12px; background: #f59e0b; color: white; border: none; border-radius: 4px;';
    debugBtn.onclick = () => {
      console.log('=== DOM INSPECTION ===');
      const shadowRoot = demo.shadowRoot;
      if (shadowRoot) {
        console.log('Shadow root found');
        const containers = shadowRoot.querySelectorAll('[data-ir-type]');
        console.log('Containers found:', containers.length);
        containers.forEach((container, i) => {
          console.log(`Container ${i}:`, {
            type: container.getAttribute('data-ir-type'),
            id: container.getAttribute('data-ir-component'),
            classes: container.className
          });
        });
        
        const buttons = shadowRoot.querySelectorAll('button');
        console.log('Buttons found:', buttons.length);
        buttons.forEach((btn, i) => {
          console.log(`Button ${i}:`, {
            text: btn.textContent,
            draggable: btn.draggable,
            classes: btn.className
          });
        });
      } else {
        console.log('No shadow root found');
      }
    };

    container.appendChild(debugBtn);
    container.appendChild(demo);
    return container;
  }
};