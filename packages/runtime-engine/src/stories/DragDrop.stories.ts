import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';
import { SimpleDragDemo } from '../components/SimpleDragDemo';
import { createIRComponent } from '../ir';
import type { IRComponent } from '../types/ir-schema';

// Helper to access shadow DOM content
function getShadowContent(canvasElement: HTMLElement) {
  const demo = canvasElement.querySelector('simple-drag-demo') as SimpleDragDemo;
  return demo?.shadowRoot;
}

const meta: Meta<{ ir: IRComponent; logChanges?: boolean }> = {
  title: 'Phase 2/Drag Drop',
  render: (args) => {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    `;

    let changeCount = 0;
    const demo = new SimpleDragDemo(args.ir, {
      onIRChange: (newIR) => {
        changeCount++;
        console.log(`🔄 IR Change #${changeCount}:`, JSON.stringify(newIR, null, 2));
        
        if (args.logChanges) {
          // Show change notification
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
          `;
          notification.textContent = `✅ IR Updated! (Change #${changeCount})`;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 2000);
        }
      },
      onDragStart: (componentId) => {
        console.log('🎯 Drag started:', componentId);
      },
      onDragEnd: (success) => {
        console.log(success ? '✅ Drop successful!' : '❌ Drop failed');
      }
    });

    container.appendChild(demo);
    return container;
  },
  argTypes: {
    ir: { control: false },
    logChanges: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<{ ir: IRComponent; logChanges?: boolean }>;

// Story 1: Basic Working Drag Drop
export const BasicWorkingDragDrop: Story = {
  args: {
    ir: {
      id: 'workspace',
      type: 'Stack',
      props: {
        gap: 'lg',
        alignItems: 'start',
      },
      children: [
        // Draggable button
        {
          id: 'draggable-button',
          type: 'Button',
          props: {
            variant: 'primary',
            children: ['🎯 Drag me to the container below!'],
            className: 'mb-4',
          },
          children: [],
          slots: {},
        },
        // Drop target container
        {
          id: 'drop-container',
          type: 'Row',
          props: {
            gap: 'md',
            alignItems: 'center',
            className: 'min-h-[120px] p-6 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg',
          },
          children: [
            createIRComponent('Button', {
              variant: 'outline',
              children: ['Drop here →'],
            }),
          ],
        },
      ],
    },
    logChanges: true,
  },
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const shadowRoot = getShadowContent(canvasElement);
    
    if (shadowRoot) {
      // Verify demo setup
      const workspace = shadowRoot.querySelector('[data-testid="workspace"]');
      const draggableButton = shadowRoot.querySelector('[data-testid="draggable-button"]');
      const dropContainer = shadowRoot.querySelector('[data-testid="drop-container"]');
      
      expect(workspace).toBeTruthy();
      expect(draggableButton).toBeTruthy();
      expect(dropContainer).toBeTruthy();
      
      // Verify draggable attributes
      expect(draggableButton?.getAttribute('draggable')).toBe('true');
      expect(draggableButton?.classList.contains('draggable')).toBe(true);
      
      console.log('✅ Actual drag/drop demo initialized');
      console.log('🎯 Try dragging the blue button into the gray container!');
      console.log('📊 Check console for IR change logs');
    } else {
      console.log('⚠️ Demo not yet ready');
    }
  },
};

// Story 2: Complex Layout with Multiple Drop Zones
export const MultipleDropZones: Story = {
  args: {
    ir: {
      id: 'multi-workspace',
      type: 'Row',
      props: {
        gap: 'lg',
        alignItems: 'start',
      },
      children: [
        // Source palette
        {
          id: 'palette',
          type: 'Stack',
          props: {
            gap: 'sm',
            alignItems: 'stretch',
            className: 'w-48 p-4 bg-blue-50 rounded-lg',
          },
          children: [
            createIRComponent('Button', {
              variant: 'primary',
              children: ['📝 Text Block'],
            }),
            createIRComponent('Button', {
              variant: 'secondary',
              children: ['🖼️ Image'],
            }),
            createIRComponent('Button', {
              variant: 'outline',
              children: ['📊 Chart'],
            }),
          ],
        },
        // Multiple drop zones
        {
          id: 'canvas',
          type: 'Stack',
          props: {
            gap: 'md',
            alignItems: 'stretch',
            className: 'flex-1',
          },
          children: [
            {
              id: 'header-zone',
              type: 'Row',
              props: {
                gap: 'md',
                alignItems: 'center',
                className: 'min-h-[80px] p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg',
              },
              children: [
                createIRComponent('Button', {
                  variant: 'outline',
                  children: ['Header Zone'],
                }),
              ],
            },
            {
              id: 'content-zone',
              type: 'Stack',
              props: {
                gap: 'sm',
                alignItems: 'start',
                className: 'min-h-[150px] p-4 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg',
              },
              children: [
                createIRComponent('Button', {
                  variant: 'outline',
                  children: ['Content Zone'],
                }),
              ],
            },
            {
              id: 'footer-zone',
              type: 'Row',
              props: {
                gap: 'md',
                alignItems: 'center',
                className: 'min-h-[60px] p-4 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg',
              },
              children: [],
            },
          ],
        },
      ],
    },
    logChanges: true,
  },
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const shadowRoot = getShadowContent(canvasElement);
    
    if (shadowRoot) {
      const palette = shadowRoot.querySelector('[data-testid="palette"]');
      const headerZone = shadowRoot.querySelector('[data-testid="header-zone"]');
      const contentZone = shadowRoot.querySelector('[data-testid="content-zone"]');
      const footerZone = shadowRoot.querySelector('[data-testid="footer-zone"]');
      
      expect(palette).toBeTruthy();
      expect(headerZone).toBeTruthy();
      expect(contentZone).toBeTruthy();
      expect(footerZone).toBeTruthy();
      
      // Count draggable items
      const draggableItems = shadowRoot.querySelectorAll('.draggable');
      expect(draggableItems.length).toBeGreaterThan(3);
      
      console.log('✅ Multiple drop zones demo ready');
      console.log('🎯 Drag items from left palette to colored drop zones');
      console.log('📊 Each drop will update the IR structure');
    } else {
      console.log('⚠️ Demo not yet ready');
    }
  },
};

// Story 3: Real-time IR Viewer
export const IRViewer: Story = {
  args: {
    ir: {
      id: 'ir-demo',
      type: 'Row',
      props: {
        gap: 'lg',
        alignItems: 'start',
      },
      children: [
        {
          id: 'demo-area',
          type: 'Stack',
          props: {
            gap: 'md',
            alignItems: 'stretch',
            className: 'flex-1',
          },
          children: [
            createIRComponent('Button', {
              variant: 'primary',
              children: ['Button A'],
            }),
            {
              id: 'container-b',
              type: 'Row',
              props: {
                gap: 'sm',
                alignItems: 'center',
                className: 'min-h-[80px] p-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg',
              },
              children: [
                createIRComponent('Button', {
                  variant: 'outline',
                  children: ['Container B'],
                }),
              ],
            },
          ],
        },
      ],
    },
    logChanges: true,
  },
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add live IR display
    const irDisplay = document.createElement('div');
    irDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      width: 300px;
      max-height: 400px;
      background: #1f2937;
      color: #e5e7eb;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 10000;
      border: 2px solid #374151;
    `;
    irDisplay.innerHTML = '<strong>🔄 Live IR Structure</strong><br><small>Updates when you drag components</small><hr style="margin: 8px 0; border-color: #374151;">';
    
    const demo = canvasElement.querySelector('simple-drag-demo') as SimpleDragDemo;
    if (demo) {
      const updateIRDisplay = () => {
        const currentIR = demo.getCurrentIR();
        const irText = JSON.stringify(currentIR, null, 2);
        irDisplay.innerHTML = `
          <strong>🔄 Live IR Structure</strong><br>
          <small>Updates when you drag components</small>
          <hr style="margin: 8px 0; border-color: #374151;">
          <pre style="white-space: pre-wrap; word-break: break-word;">${irText}</pre>
        `;
      };
      
      updateIRDisplay();
      
      // Monitor for changes
      const originalCallback = demo['options'].onIRChange;
      demo['options'].onIRChange = (newIR) => {
        if (originalCallback) originalCallback(newIR);
        updateIRDisplay();
      };
    }
    
    document.body.appendChild(irDisplay);
    
    // Cleanup on story change
    setTimeout(() => {
      if (document.body.contains(irDisplay)) {
        document.body.removeChild(irDisplay);
      }
    }, 30000);
    
    console.log('✅ Live IR viewer active');
    console.log('📊 Watch the JSON structure update as you drag!');
  },
};