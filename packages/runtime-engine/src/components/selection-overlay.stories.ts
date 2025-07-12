import type { Meta, StoryObj } from '@storybook/html';
import { SelectionOverlay, SelectionOverlayManager } from './selection-overlay';
import type { BoundingBox } from '../types';

/**
 * Selection overlay component for visual feedback
 */
const meta: Meta = {
  title: 'Components/SelectionOverlay',
  parameters: {
    docs: {
      description: {
        component: 'Visual overlay component that provides selection feedback with resize handles. Uses Tailwind CSS for styling and supports multiple themes.',
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent', 'danger'],
      description: 'Visual theme for the overlay',
    },
    showHandles: {
      control: { type: 'boolean' },
      description: 'Whether to show resize handles',
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Creates a demo container with overlay
 */
function createOverlayDemo(args: any): HTMLElement {
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

  // Create target element
  const target = document.createElement('div');
  target.style.cssText = `
    position: absolute;
    top: 50px;
    left: 50px;
    width: 120px;
    height: 80px;
    background: #dbeafe;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #1e40af;
  `;
  target.textContent = 'Target Element';
  container.appendChild(target);

  // Create overlay
  const overlay = new SelectionOverlay(container);
  overlay.setTheme(args.theme || 'primary');

  const bounds: BoundingBox = {
    x: 50,
    y: 50,
    width: args.showHandles ? 120 : 80,
    height: args.showHandles ? 80 : 40,
  };

  overlay.show(bounds);

  // Add controls
  const controls = document.createElement('div');
  controls.style.cssText = `
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

  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Toggle Overlay';
  toggleButton.style.cssText = `
    padding: 4px 8px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    margin-right: 8px;
  `;
  
  let isVisible = true;
  toggleButton.addEventListener('click', () => {
    if (isVisible) {
      overlay.hide();
    } else {
      overlay.show(bounds);
    }
    isVisible = !isVisible;
  });

  const themeButton = document.createElement('button');
  themeButton.textContent = 'Change Theme';
  themeButton.style.cssText = `
    padding: 4px 8px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  `;

  const themes = ['primary', 'secondary', 'accent', 'danger'];
  let currentTheme = 0;
  themeButton.addEventListener('click', () => {
    currentTheme = (currentTheme + 1) % themes.length;
    overlay.setTheme(themes[currentTheme] as any);
  });

  controls.appendChild(toggleButton);
  controls.appendChild(themeButton);
  container.appendChild(controls);

  return container;
}

/**
 * Basic overlay demonstration
 */
export const Default: Story = {
  args: {
    theme: 'primary',
    showHandles: true,
  },
  render: createOverlayDemo,
};

/**
 * Secondary theme overlay
 */
export const SecondaryTheme: Story = {
  args: {
    theme: 'secondary',
    showHandles: true,
  },
  render: createOverlayDemo,
};

/**
 * Accent theme overlay
 */
export const AccentTheme: Story = {
  args: {
    theme: 'accent',
    showHandles: true,
  },
  render: createOverlayDemo,
};

/**
 * Danger theme overlay
 */
export const DangerTheme: Story = {
  args: {
    theme: 'danger',
    showHandles: true,
  },
  render: createOverlayDemo,
};

/**
 * Overlay without handles (small element)
 */
export const WithoutHandles: Story = {
  args: {
    theme: 'primary',
    showHandles: false,
  },
  render: createOverlayDemo,
};

/**
 * Multiple overlays demonstration
 */
export const MultipleOverlays: Story = {
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

    // Create overlay manager
    const overlayManager = new SelectionOverlayManager(container);

    // Create target elements and overlays
    const elements = [
      { x: 50, y: 50, width: 100, height: 60, label: 'Primary' },
      { x: 200, y: 50, width: 120, height: 80, label: 'Secondary' },
      { x: 50, y: 180, width: 80, height: 50, label: 'Accent' },
      { x: 200, y: 180, width: 140, height: 90, label: 'Danger' },
    ];

    elements.forEach(({ x, y, width, height, label }, index) => {
      // Create target element
      const target = document.createElement('div');
      target.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${x}px;
        width: ${width}px;
        height: ${height}px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
      `;
      target.textContent = label;
      container.appendChild(target);

      // Create overlay
      if (index === 0) {
        overlayManager.showPrimary({ x, y, width, height });
      } else {
        overlayManager.createSecondary(`overlay-${index}`, { x, y, width, height });
      }
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
      <strong>Multiple Overlays:</strong><br>
      • Primary overlay (blue) for main selection<br>
      • Secondary overlays for multi-selection<br>
      • Different themes for visual distinction
    `;
    container.appendChild(instructions);

    return container;
  },
};