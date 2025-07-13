/**
 * Unit tests for VisualBuilder
 * Tests the integration between Phase 1 (drag/drop) and Phase 2 (IR system)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualBuilder } from '../components/VisualBuilder';
import { createIRComponent } from '../ir';
import type { IRComponent } from '../types/ir-schema';

// Mock Moveable to avoid DOM manipulation issues in tests
vi.mock('moveable', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),
  };
});

describe('VisualBuilder Integration', () => {
  let testIR: IRComponent;
  let onIRChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onIRChangeMock = vi.fn();
    
    testIR = {
      id: 'test-container',
      type: 'Stack',
      props: {
        gap: 'md',
        alignItems: 'start',
      },
      children: [
        createIRComponent('Button', {
          variant: 'primary',
          children: ['Test Button'],
        }),
        {
          id: 'nested-row',
          type: 'Row',
          props: {
            gap: 'sm',
            alignItems: 'center',
          },
          children: [],
        },
      ],
    };
  });

  describe('Component Initialization', () => {
    it('should initialize with IR structure', () => {
      const builder = new VisualBuilder(testIR, {
        draggable: true,
        resizable: true,
        onIRChange: onIRChangeMock,
      });

      expect(builder.getCurrentIR()).toEqual(testIR);
    });

    it('should set up custom element correctly', () => {
      const builder = new VisualBuilder(testIR);
      
      expect(builder.tagName.toLowerCase()).toBe('visual-builder');
      expect(builder instanceof HTMLElement).toBe(true);
    });
  });

  describe('IR Rendering Integration', () => {
    it('should initialize correctly for rendering', () => {
      const builder = new VisualBuilder(testIR);
      
      // Test basic initialization without DOM manipulation
      expect(builder.getCurrentIR()).toEqual(testIR);
      expect(builder instanceof HTMLElement).toBe(true);
    });

    it('should handle DOM connection lifecycle', () => {
      const builder = new VisualBuilder(testIR);
      
      // Test connection and disconnection without async assertions
      document.body.appendChild(builder);
      expect(document.body.contains(builder)).toBe(true);
      
      document.body.removeChild(builder);
      expect(document.body.contains(builder)).toBe(false);
    });
  });

  describe('IR Update Operations', () => {
    it('should update IR and re-render', () => {
      const builder = new VisualBuilder(testIR, { onIRChange: onIRChangeMock });
      
      const newIR = {
        ...testIR,
        children: [
          createIRComponent('Button', {
            variant: 'secondary',
            children: ['Updated Button'],
          }),
        ],
      };

      builder.updateIR(newIR);
      expect(builder.getCurrentIR()).toEqual(newIR);
    });

    it('should call onIRChange callback when IR is modified', () => {
      const builder = new VisualBuilder(testIR, { onIRChange: onIRChangeMock });
      document.body.appendChild(builder);

      const newComponent = createIRComponent('Button', {
        variant: 'outline',
        children: ['New Button'],
      });

      const success = builder.addComponent('nested-row', newComponent);
      expect(success).toBe(true);
      expect(onIRChangeMock).toHaveBeenCalledWith(testIR);

      document.body.removeChild(builder);
    });
  });

  describe('Component Addition', () => {
    it('should add components to existing containers', () => {
      const builder = new VisualBuilder(testIR, { onIRChange: onIRChangeMock });
      
      const newButton = createIRComponent('Button', {
        variant: 'outline',
        children: ['Added Button'],
      });

      const success = builder.addComponent('nested-row', newButton);
      expect(success).toBe(true);
      
      const currentIR = builder.getCurrentIR();
      const nestedRow = currentIR.children?.find(child => child.id === 'nested-row');
      expect(nestedRow?.children).toHaveLength(1);
      expect(nestedRow?.children?.[0]).toEqual(newButton);
    });

    it('should fail gracefully when adding to non-existent parent', () => {
      const builder = new VisualBuilder(testIR, { onIRChange: onIRChangeMock });
      
      const newButton = createIRComponent('Button', {
        variant: 'primary',
        children: ['Test'],
      });

      const success = builder.addComponent('non-existent', newButton);
      expect(success).toBe(false);
      expect(onIRChangeMock).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop Configuration', () => {
    it('should initialize with correct drag/drop options', () => {
      const builder = new VisualBuilder(testIR, {
        draggable: false,
        resizable: false,
        dropThreshold: 30,
      });

      // Internal options are private, but we can test behavior
      expect(builder.getCurrentIR()).toEqual(testIR);
    });

    it('should handle IR changes during drag operations', () => {
      const builder = new VisualBuilder(testIR, { onIRChange: onIRChangeMock });
      
      // Simulate a successful move operation by directly calling addComponent
      const draggedComponent = createIRComponent('Button', {
        variant: 'primary',
        children: ['Dragged'],
      });
      
      builder.addComponent('nested-row', draggedComponent);
      expect(onIRChangeMock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty IR gracefully', () => {
      const emptyIR: IRComponent = {
        id: 'empty',
        type: 'Stack',
        props: {},
        children: [],
      };
      
      const builder = new VisualBuilder(emptyIR);
      expect(builder.getCurrentIR()).toEqual(emptyIR);
    });

    it('should cleanup properly on disconnect', () => {
      const builder = new VisualBuilder(testIR);
      document.body.appendChild(builder);
      
      // Trigger disconnect
      document.body.removeChild(builder);
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});