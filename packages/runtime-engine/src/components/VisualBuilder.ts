/**
 * VisualBuilder Component
 * Main component that integrates drag/drop with IR system
 * Renders IR structure as draggable DOM elements
 */

import type { IRComponent } from '@/types/ir-schema';
import { addChildComponent, findComponentById, removeComponent } from '@/ir/utils';
import { RowComponent } from './row-component';
import { StackComponent } from './stack-component';
import { ButtonComponent } from './button-component';
import type Moveable from 'moveable';

/**
 * Configuration options for VisualBuilder
 */
export interface VisualBuilderOptions {
  /** Whether components are draggable */
  draggable?: boolean;
  /** Whether components are resizable */
  resizable?: boolean;
  /** Threshold for drag extraction (pixels) */
  dropThreshold?: number;
  /** Callback when IR structure changes */
  onIRChange?: (ir: IRComponent) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VisualBuilder - Main visual editor component
 * Combines IR rendering with drag/drop interactions
 */
export class VisualBuilder extends HTMLElement {
  private currentIR: IRComponent;
  private options: VisualBuilderOptions;
  private moveable?: Moveable;
  declare shadowRoot: ShadowRoot;

  constructor(ir: IRComponent, options: VisualBuilderOptions = {}) {
    super();
    
    this.currentIR = { ...ir };
    this.options = {
      draggable: true,
      resizable: true,
      dropThreshold: 20,
      ...options,
    };

    // Create shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });

    // Set up styles
    this.setupStyles();
  }

  /**
   * Web Component lifecycle - connected to DOM
   */
  connectedCallback(): void {
    this.render();
    if (this.options.draggable) {
      this.setupDragAndDrop();
    }
  }

  /**
   * Web Component lifecycle - disconnected from DOM
   */
  disconnectedCallback(): void {
    this.cleanup();
  }

  /**
   * Get current IR structure
   */
  getCurrentIR(): IRComponent {
    return { ...this.currentIR };
  }

  /**
   * Update IR structure and re-render
   */
  updateIR(newIR: IRComponent): void {
    this.currentIR = { ...newIR };
    this.render();
    this.notifyIRChange();
  }

  /**
   * Add component to a parent container
   */
  addComponent(parentId: string, component: IRComponent): boolean {
    // Find the parent component
    const parent = findComponentById(this.currentIR, parentId);
    if (!parent) return false;

    // Add the component
    const success = addChildComponent(parent, component);
    if (success) {
      this.render();
      this.notifyIRChange();
    }
    return success;
  }

  /**
   * Remove component from IR
   */
  removeComponent(componentId: string): boolean {
    const success = removeComponent(this.currentIR, componentId);
    if (success) {
      this.render();
      this.notifyIRChange();
    }
    return success;
  }

  /**
   * Setup component styles in shadow DOM
   */
  private setupStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: auto;
      }

      .vb-container {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 8px;
      }

      .vb-component {
        position: relative;
        margin: 4px;
      }

      .vb-row {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .vb-stack {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .vb-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #f9fafb;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s;
      }

      .vb-button:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .vb-button.primary {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
      }

      .vb-button.secondary {
        background: #6b7280;
        border-color: #6b7280;
        color: white;
      }

      .vb-button.outline {
        background: transparent;
        border-color: #3b82f6;
        color: #3b82f6;
      }

      .vb-gap-sm > * + * { margin-left: 8px; }
      .vb-gap-md > * + * { margin-left: 16px; }
      .vb-gap-lg > * + * { margin-left: 24px; }
      .vb-gap-xl > * + * { margin-left: 32px; }

      .vb-stack.vb-gap-sm > * + * { margin-left: 0; margin-top: 8px; }
      .vb-stack.vb-gap-md > * + * { margin-left: 0; margin-top: 16px; }
      .vb-stack.vb-gap-lg > * + * { margin-left: 0; margin-top: 24px; }
      .vb-stack.vb-gap-xl > * + * { margin-left: 0; margin-top: 32px; }

      .vb-component[data-dragging="true"] {
        opacity: 0.7;
        z-index: 1000;
      }

      .vb-drop-zone {
        border: 2px dashed #d1d5db;
        border-radius: 6px;
        min-height: 40px;
        transition: all 0.2s;
      }

      .vb-drop-zone.active {
        border-color: #3b82f6;
        background: #eff6ff;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  /**
   * Render IR structure to DOM
   */
  private render(): void {
    // Clear existing content (except styles)
    const existingContent = this.shadowRoot.querySelector('.vb-container');
    if (existingContent) {
      existingContent.remove();
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'vb-container';
    container.setAttribute('data-testid', this.currentIR.id);

    // Render IR component
    const element = this.renderComponent(this.currentIR);
    container.appendChild(element);

    this.shadowRoot.appendChild(container);
  }

  /**
   * Render individual IR component to Web Component
   */
  private renderComponent(component: IRComponent): HTMLElement {
    let element: HTMLElement;

    switch (component.type) {
      case 'Row':
        element = RowComponent.fromIR(component as any);
        break;
      case 'Stack':
        element = StackComponent.fromIR(component as any);
        break;
      case 'Button':
        element = ButtonComponent.fromIR(component as any);
        break;
      default:
        element = document.createElement('div');
        element.textContent = `Unknown component: ${(component as any).type}`;
        break;
    }

    element.setAttribute('data-testid', component.id);
    element.setAttribute('data-component-id', component.id);
    element.setAttribute('data-component-type', component.type);

    if (component.props?.className) {
      element.classList.add(...component.props.className.split(' '));
    }

    if (component.children && (component.type === 'Row' || component.type === 'Stack')) {
      const containerComponent = element as RowComponent | StackComponent;
      containerComponent.clearChildComponents();
      
      component.children.forEach(child => {
        const childElement = this.renderComponent(child);
        containerComponent.addChildComponent(childElement);
      });
    }

    return element;
  }


  /**
   * Setup drag and drop interactions
   */
  private setupDragAndDrop(): void {
    // This is a simplified version - full implementation would use Moveable.js
    // For now, just make elements draggable with basic HTML5 drag/drop
    const components = this.shadowRoot.querySelectorAll('[data-component-id]');
    
    components.forEach(component => {
      const element = component as HTMLElement;
      element.draggable = true;
      
      element.addEventListener('dragstart', (e) => {
        element.setAttribute('data-dragging', 'true');
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', element.getAttribute('data-component-id') || '');
        }
      });

      element.addEventListener('dragend', () => {
        element.removeAttribute('data-dragging');
      });
    });

    // Setup drop zones
    const containers = this.shadowRoot.querySelectorAll('.vb-row, .vb-stack');
    containers.forEach(container => {
      const element = container as HTMLElement;
      
      element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('active');
      });

      element.addEventListener('dragleave', () => {
        element.classList.remove('active');
      });

      element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('active');
        
        const draggedId = e.dataTransfer?.getData('text/plain');
        const targetId = element.getAttribute('data-component-id');
        
        if (draggedId && targetId && draggedId !== targetId) {
          this.handleComponentMove(draggedId, targetId);
        }
      });
    });
  }

  /**
   * Handle component movement between containers
   */
  private handleComponentMove(draggedId: string, targetId: string): void {
    // Find the dragged component
    const draggedComponent = findComponentById(this.currentIR, draggedId);
    if (!draggedComponent) return;

    // Find the target parent
    const targetParent = findComponentById(this.currentIR, targetId);
    if (!targetParent) return;

    // Remove from current location
    const removeSuccess = removeComponent(this.currentIR, draggedId);
    if (!removeSuccess) return;

    // Add to new location
    const addSuccess = addChildComponent(targetParent, draggedComponent);
    
    if (addSuccess) {
      this.render();
      this.notifyIRChange();
    }
  }

  /**
   * Notify about IR changes
   */
  private notifyIRChange(): void {
    if (this.options.onIRChange) {
      this.options.onIRChange(this.getCurrentIR());
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.moveable) {
      this.moveable.destroy();
    }
  }
}

// Register as custom element
if (!customElements.get('visual-builder')) {
  customElements.define('visual-builder', VisualBuilder);
}