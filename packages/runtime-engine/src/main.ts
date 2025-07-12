/**
 * Development entry point for the runtime engine
 */

import { initializeRuntimeEngine, SimpleBoxComponent } from './index';

// Initialize the runtime engine
initializeRuntimeEngine();

// Development playground
function setupPlayground(): void {
  const playground = document.getElementById('playground');
  if (!playground) return;

  // Clear placeholder content
  playground.innerHTML = '';
  playground.className = 'relative border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96 bg-white';

  // Create some example components
  const box1 = new SimpleBoxComponent({
    content: 'Draggable Box 1',
  });
  box1.style.position = 'absolute';
  box1.style.top = '20px';
  box1.style.left = '20px';

  const box2 = new SimpleBoxComponent({
    content: 'Draggable Box 2',
  });
  box2.style.position = 'absolute';
  box2.style.top = '20px';
  box2.style.left = '200px';

  const box3 = new SimpleBoxComponent({
    content: 'Draggable Box 3',
  });
  box3.style.position = 'absolute';
  box3.style.top = '120px';
  box3.style.left = '20px';

  // Add components to playground
  playground.appendChild(box1);
  playground.appendChild(box2);
  playground.appendChild(box3);

  // Add event listeners for demonstration
  playground.addEventListener('builder:select', (event) => {
    const customEvent = event as CustomEvent;
    console.log('Component selected:', customEvent.detail);
  });

  playground.addEventListener('builder:deselect', (event) => {
    const customEvent = event as CustomEvent;
    console.log('Component deselected:', customEvent.detail);
  });

  // Add instructions
  const instructions = document.createElement('div');
  instructions.className = 'absolute bottom-4 left-4 text-sm text-gray-600 bg-gray-100 p-3 rounded-lg';
  instructions.innerHTML = `
    <p class="font-medium mb-1">Development Playground</p>
    <p>• Click boxes to select them</p>
    <p>• Check console for events</p>
    <p>• Use Storybook for detailed component testing</p>
  `;
  playground.appendChild(instructions);
}

// Setup playground when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPlayground);
} else {
  setupPlayground();
}