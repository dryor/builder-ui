/**
 * Unit tests for IR Renderer
 * Tests the two critical scenarios: basic rendering and nested structures
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IRRenderer, createIRComponent } from '../ir';
import type { IRComponent } from '../types/ir-schema';

describe('IR Renderer', () => {
  let renderer: IRRenderer;

  beforeEach(() => {
    renderer = new IRRenderer();
  });

  describe('Critical Test Scenario 1: Basic IR Rendering', () => {
    it('should render a basic button component', () => {
      const buttonComponent = createIRComponent('Button', {
        variant: 'primary',
        children: ['Click me'],
      });

      const element = renderer.render(buttonComponent);
      
      expect(element.tagName).toBe('BUTTON');
      expect(element.textContent).toBe('Click me');
      expect(element.classList.contains('builder-button')).toBe(true);
      expect(element.classList.contains('bg-blue-600')).toBe(true);
      expect(element.classList.contains('text-white')).toBe(true);
      expect(element.getAttribute('data-ir-type')).toBe('Button');
    });

    it('should render a basic row component', () => {
      const rowComponent = createIRComponent('Row', {
        gap: 'md',
        alignItems: 'center',
      });

      const element = renderer.render(rowComponent);
      
      expect(element.tagName).toBe('DIV');
      expect(element.classList.contains('builder-row')).toBe(true);
      expect(element.classList.contains('flex')).toBe(true);
      expect(element.classList.contains('flex-row')).toBe(true);
      expect(element.classList.contains('gap-4')).toBe(true); // md gap
      expect(element.classList.contains('items-center')).toBe(true);
      expect(element.getAttribute('data-ir-type')).toBe('Row');
    });

    it('should render a basic stack component', () => {
      const stackComponent = createIRComponent('Stack', {
        gap: 'lg',
        alignItems: 'start',
      });

      const element = renderer.render(stackComponent);
      
      expect(element.tagName).toBe('DIV');
      expect(element.classList.contains('builder-stack')).toBe(true);
      expect(element.classList.contains('flex')).toBe(true);
      expect(element.classList.contains('flex-col')).toBe(true);
      expect(element.classList.contains('gap-6')).toBe(true); // lg gap
      expect(element.classList.contains('items-start')).toBe(true);
      expect(element.getAttribute('data-ir-type')).toBe('Stack');
    });
  });

  describe('Critical Test Scenario 2: Nested Structure (Row containing Buttons)', () => {
    it('should render a row with multiple buttons', () => {
      const rowWithButtons: IRComponent = {
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
      };

      const element = renderer.render(rowWithButtons);
      
      // Test that row container exists
      expect(element.getAttribute('data-testid')).toBe('test-row-1');
      expect(element.classList.contains('builder-row')).toBe(true);
      expect(element.classList.contains('flex')).toBe(true);
      expect(element.classList.contains('flex-row')).toBe(true);
      
      // Test that all three buttons are rendered as children
      const buttons = element.querySelectorAll('button');
      expect(buttons).toHaveLength(3);
      
      // Test button content
      expect(buttons[0].textContent).toBe('Button 1');
      expect(buttons[1].textContent).toBe('Button 2');
      expect(buttons[2].textContent).toBe('Button 3');
      
      // Test that buttons are direct children of the row
      buttons.forEach(button => {
        expect(button.parentElement).toBe(element);
      });
      
      // Test button variants
      expect(buttons[0].classList.contains('bg-blue-600')).toBe(true); // primary
      expect(buttons[1].classList.contains('bg-gray-600')).toBe(true); // secondary
      expect(buttons[2].classList.contains('border-2')).toBe(true); // outline
      expect(buttons[2].classList.contains('border-blue-600')).toBe(true); // outline
    });

    it('should render a stack with mixed nested components', () => {
      const stackWithNested: IRComponent = {
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
      };

      const element = renderer.render(stackWithNested);
      
      // Test stack container
      expect(element.getAttribute('data-testid')).toBe('test-stack-1');
      expect(element.classList.contains('builder-stack')).toBe(true);
      expect(element.classList.contains('flex')).toBe(true);
      expect(element.classList.contains('flex-col')).toBe(true);
      
      // Test nested row
      const nestedRow = element.querySelector('[data-testid="nested-row-1"]');
      expect(nestedRow).toBeTruthy();
      expect(nestedRow?.classList.contains('builder-row')).toBe(true);
      expect(nestedRow?.classList.contains('flex')).toBe(true);
      expect(nestedRow?.classList.contains('flex-row')).toBe(true);
      
      // Test all buttons are rendered
      const buttons = element.querySelectorAll('button');
      expect(buttons).toHaveLength(4);
      
      // Test button hierarchy - top and bottom buttons should be direct children of stack
      const topButton = Array.from(buttons).find(btn => btn.textContent === 'Top Button');
      const bottomButton = Array.from(buttons).find(btn => btn.textContent === 'Bottom Button');
      expect(topButton?.parentElement).toBe(element);
      expect(bottomButton?.parentElement).toBe(element);
      
      // Test nested buttons should be children of the nested row
      const leftButton = Array.from(buttons).find(btn => btn.textContent === 'Left');
      const rightButton = Array.from(buttons).find(btn => btn.textContent === 'Right');
      expect(leftButton?.parentElement).toBe(nestedRow);
      expect(rightButton?.parentElement).toBe(nestedRow);
    });
  });

  describe('IR Validation', () => {
    it('should validate IR structure before rendering', () => {
      const invalidComponent = {
        id: 'invalid-1',
        type: 'UnknownType',
        props: {},
        children: [],
      } as unknown as IRComponent;

      const element = renderer.render(invalidComponent);
      
      // Should render an error element
      expect(element.classList.contains('builder-unknown')).toBe(true);
      expect(element.classList.contains('bg-red-100')).toBe(true);
      expect(element.textContent).toContain('Unknown component: UnknownType');
    });
  });

  describe('Data Attributes and Identification', () => {
    it('should set correct data attributes for component identification', () => {
      const component = createIRComponent('Button', {
        variant: 'primary',
        children: ['Test Button'],
      });

      const element = renderer.render(component);
      
      expect(element.getAttribute('data-ir-component')).toBe(component.id);
      expect(element.getAttribute('data-ir-type')).toBe('Button');
      expect(element.getAttribute('data-testid')).toBe(component.id);
      expect(element.classList.contains('builder-selectable')).toBe(true);
    });
  });
});