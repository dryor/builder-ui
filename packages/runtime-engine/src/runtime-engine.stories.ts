import type { Meta, StoryObj } from '@storybook/html';
import { 
  initializeRuntimeEngine,
  SimpleBoxComponent,
  SelectionManager,
} from './index';
import { SelectionOverlayManager } from './components/selection-overlay';

/**
 * Complete runtime engine demonstration
 */
const meta: Meta = {
  title: 'Runtime Engine/Complete Demo',
  parameters: {
    docs: {
      description: {
        component: 'Complete demonstration of the visual builder runtime engine with all features: selection, drag/drop, resizing, and overlay indicators.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Creates a complete runtime engine demonstration
 */
function createRuntimeDemo(): HTMLElement {
  // Initialize runtime engine
  initializeRuntimeEngine();

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-width: 900px;
  `;

  // Create canvas container
  const canvas = document.createElement('div');
  canvas.id = 'builder-canvas';
  canvas.style.cssText = `
    position: relative;
    width: 100%;
    height: 500px;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    background: linear-gradient(45deg, #f9fafb 25%, transparent 25%),
                linear-gradient(-45deg, #f9fafb 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f9fafb 75%),
                linear-gradient(-45deg, transparent 75%, #f9fafb 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    overflow: hidden;
  `;

  // Setup managers
  const selectionManager = new SelectionManager(canvas);
  new SelectionOverlayManager(canvas);

  // Create sample components
  const components = [
    { 
      content: 'Header Component', 
      x: 50, 
      y: 30, 
      className: 'bg-blue-100 border-blue-300 text-blue-800' 
    },
    { 
      content: 'Navigation Menu', 
      x: 250, 
      y: 30,
      className: 'bg-green-100 border-green-300 text-green-800'
    },
    { 
      content: 'Main Content', 
      x: 50, 
      y: 120,
      className: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    { 
      content: 'Sidebar Widget', 
      x: 350, 
      y: 120,
      className: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    { 
      content: 'Footer Section', 
      x: 50, 
      y: 220,
      className: 'bg-red-100 border-red-300 text-red-800'
    },
  ];

  components.forEach(({ content, x, y, className }) => {
    const component = new SimpleBoxComponent({ content });
    component.style.cssText = `
      position: absolute;
      top: ${y}px;
      left: ${x}px;
    `;
    
    // Override default styling
    component.addEventListener('DOMContentLoaded', () => {
      const inner = component.querySelector('div');
      if (inner) {
        inner.className = `w-32 h-24 ${className} border-2 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`;
      }
    });

    canvas.appendChild(component);
  });

  // Create control panel
  const controlPanel = document.createElement('div');
  controlPanel.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  `;

  // Add component button
  const addButton = document.createElement('button');
  addButton.textContent = '+ Add Component';
  addButton.style.cssText = `
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  addButton.addEventListener('click', () => {
    const component = new SimpleBoxComponent({ 
      content: `Box ${Date.now().toString().slice(-3)}` 
    });
    component.style.cssText = `
      position: absolute;
      top: ${Math.random() * 300 + 50}px;
      left: ${Math.random() * 400 + 50}px;
    `;
    canvas.appendChild(component);
  });

  // Clear selection button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Selection';
  clearButton.style.cssText = `
    padding: 8px 16px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  clearButton.addEventListener('click', () => {
    selectionManager.deselectAll();
  });

  // Delete selected button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete Selected';
  deleteButton.style.cssText = `
    padding: 8px 16px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  deleteButton.addEventListener('click', () => {
    const selected = selectionManager.getSelectedElement();
    if (selected) {
      selected.remove();
      selectionManager.deselectAll();
    }
  });

  controlPanel.appendChild(addButton);
  controlPanel.appendChild(clearButton);
  controlPanel.appendChild(deleteButton);

  // Create info panel
  const infoPanel = document.createElement('div');
  infoPanel.id = 'info-panel';
  infoPanel.style.cssText = `
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
  `;
  infoPanel.innerHTML = `
    <strong>Runtime Engine Status:</strong><br>
    Selected: None<br>
    Components: ${components.length}<br>
    <br>
    <strong>Instructions:</strong><br>
    • Click components to select them<br>
    • Drag selected components to move<br>
    • Use resize handles when available<br>
    • Check browser console for detailed events
  `;

  // Update info panel based on selection
  canvas.addEventListener('selection:change', (event) => {
    const customEvent = event as CustomEvent;
    const state = customEvent.detail;
    const componentCount = canvas.querySelectorAll('[data-builder-component]').length;
    
    infoPanel.innerHTML = `
      <strong>Runtime Engine Status:</strong><br>
      Selected: ${state.selectedId || 'None'}<br>
      Components: ${componentCount}<br>
      Bounds: ${state.boundingBox ? 
        `(${Math.round(state.boundingBox.x)}, ${Math.round(state.boundingBox.y)}) ${Math.round(state.boundingBox.width)}×${Math.round(state.boundingBox.height)}` 
        : 'None'}<br>
      <br>
      <strong>Instructions:</strong><br>
      • Click components to select them<br>
      • Drag selected components to move<br>
      • Use resize handles when available<br>
      • Check browser console for detailed events
    `;
  });

  // Log events to console
  ['builder:select', 'builder:deselect', 'builder:drag:start', 'builder:drag:move', 'builder:drag:end', 'builder:resize:start', 'builder:resize:move', 'builder:resize:end'].forEach(eventType => {
    canvas.addEventListener(eventType, (event) => {
      console.log(`[Runtime Engine] ${eventType}:`, event);
    });
  });

  // Assemble the demo
  wrapper.appendChild(canvas);
  wrapper.appendChild(controlPanel);
  wrapper.appendChild(infoPanel);

  return wrapper;
}

/**
 * Complete runtime engine demonstration
 */
export const CompleteDemo: Story = {
  render: createRuntimeDemo,
};

/**
 * Performance test with many components
 */
export const PerformanceTest: Story = {
  render: () => {
    initializeRuntimeEngine();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      max-width: 900px;
    `;

    const canvas = document.createElement('div');
    canvas.style.cssText = `
      position: relative;
      width: 100%;
      height: 600px;
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      overflow: hidden;
    `;

    new SelectionManager(canvas);
    new SelectionOverlayManager(canvas);

    // Create many components for performance testing
    const componentCount = 50;
    const startTime = performance.now();

    for (let i = 0; i < componentCount; i++) {
      const component = new SimpleBoxComponent({ 
        content: `#${i + 1}`,
      });
      
      component.style.cssText = `
        position: absolute;
        top: ${(i % 10) * 60 + 20}px;
        left: ${Math.floor(i / 10) * 140 + 20}px;
      `;
      
      canvas.appendChild(component);
    }

    const endTime = performance.now();

    const perfInfo = document.createElement('div');
    perfInfo.style.cssText = `
      padding: 16px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      font-size: 14px;
    `;
    perfInfo.innerHTML = `
      <strong>Performance Test Results:</strong><br>
      Components created: ${componentCount}<br>
      Creation time: ${(endTime - startTime).toFixed(2)}ms<br>
      Average per component: ${((endTime - startTime) / componentCount).toFixed(2)}ms<br>
      <br>
      <em>Test selection and drag performance by interacting with components</em>
    `;

    wrapper.appendChild(canvas);
    wrapper.appendChild(perfInfo);

    return wrapper;
  },
};