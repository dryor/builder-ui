/**
 * Test to verify Storybook stories can be rendered correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IRRenderer } from '../ir';
import type { IRComponent } from '../types/ir-schema';

// Import the story component definitions
const basicButtonComponent: IRComponent = {
  id: 'basic-button-story',
  type: 'Button',
  props: {
    variant: 'primary',
    children: ['Click me'],
  },
  children: [],
  slots: {},
};

const basicRowComponent: IRComponent = {
  id: 'basic-row-story',
  type: 'Row',
  props: {
    gap: 'md',
    alignItems: 'center',
  },
  children: [],
};

const basicStackComponent: IRComponent = {
  id: 'basic-stack-story',
  type: 'Stack',
  props: {
    gap: 'lg',
    alignItems: 'start',
  },
  children: [],
};

describe('Storybook Stories Rendering', () => {
  let renderer: IRRenderer;

  beforeEach(() => {
    renderer = new IRRenderer();
  });

  it('should render BasicButton story correctly', () => {
    const element = renderer.render(basicButtonComponent);
    
    expect(element.tagName).toBe('BUTTON');
    expect(element.textContent).toBe('Click me');
    expect(element.classList.contains('builder-button')).toBe(true);
    expect(element.getAttribute('data-testid')).toBe('basic-button-story');
  });

  it('should render BasicRow story correctly', () => {
    const element = renderer.render(basicRowComponent);
    
    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('builder-row')).toBe(true);
    expect(element.classList.contains('flex')).toBe(true);
    expect(element.classList.contains('flex-row')).toBe(true);
    expect(element.getAttribute('data-testid')).toBe('basic-row-story');
  });

  it('should render BasicStack story correctly', () => {
    const element = renderer.render(basicStackComponent);
    
    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('builder-stack')).toBe(true);
    expect(element.classList.contains('flex')).toBe(true);
    expect(element.classList.contains('flex-col')).toBe(true);
    expect(element.getAttribute('data-testid')).toBe('basic-stack-story');
  });

  it('should apply correct CSS classes to all basic components', () => {
    // Test button classes
    const button = renderer.render(basicButtonComponent);
    expect(button.classList.contains('bg-blue-600')).toBe(true);
    expect(button.classList.contains('text-white')).toBe(true);
    
    // Test row classes
    const row = renderer.render(basicRowComponent);
    expect(row.classList.contains('gap-4')).toBe(true); // md gap
    expect(row.classList.contains('items-center')).toBe(true);
    
    // Test stack classes
    const stack = renderer.render(basicStackComponent);
    expect(stack.classList.contains('gap-6')).toBe(true); // lg gap
    expect(stack.classList.contains('items-start')).toBe(true);
  });
});