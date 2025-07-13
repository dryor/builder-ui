/**
 * Simple Drag Demo
 * A straightforward implementation that actually works for demonstrating drag/drop
 * 
 * This bypasses complex shadow DOM + Moveable.js integration issues
 * and focuses on showing the core IR manipulation capabilities.
 */

import { IRRenderer } from '../ir/renderer';
import { moveComponent } from '../ir/utils';
import type { IRComponent } from '../types/ir-schema';

export interface SimpleDragDemoOptions {
  onIRChange?: (newIR: IRComponent) => void;
  onDragStart?: (componentId: string) => void;
  onDragEnd?: (success: boolean) => void;
}

export class SimpleDragDemo extends HTMLElement {
  private irRenderer: IRRenderer;
  private currentIR: IRComponent;
  private options: SimpleDragDemoOptions;
  private draggedElement: HTMLElement | null = null;
  private draggedComponentId: string | null = null;
  private insertionIndicator: HTMLElement | null = null;

  constructor(ir: IRComponent, options: SimpleDragDemoOptions = {}) {
    super();
    
    this.irRenderer = new IRRenderer();
    this.currentIR = ir;
    this.options = options;
    
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupSimpleDragDrop();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = '';
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      @import 'https://cdn.tailwindcss.com/3.4.0/tailwind.min.css';
      
      .drag-container {
        padding: 20px;
        min-height: 400px;
        background: #fafafa;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
      }
      
      .draggable {
        cursor: grab;
        transition: all 0.2s ease;
        user-select: none;
      }
      
      .draggable:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .dragging {
        cursor: grabbing;
        transform: rotate(5deg);
        opacity: 0.8;
        z-index: 1000;
        position: relative;
      }
      
      .drop-zone {
        transition: all 0.2s ease;
        min-height: 60px;
      }
      
      .drop-zone.drag-over {
        background: rgba(59, 130, 246, 0.1) !important;
        border: 2px dashed #3b82f6 !important;
        transform: scale(1.02);
      }
      
      .demo-info {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        color: #1e40af;
      }

      /* Ghost Preview Styles */
      .ghost-preview {
        position: absolute;
        pointer-events: none;
        opacity: 0.6;
        transform: scale(0.95);
        border: 2px dashed #3b82f6;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 6px;
        z-index: 1000;
        transition: all 0.15s ease;
      }

      .ghost-preview.valid-drop {
        opacity: 0.8;
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }

      .ghost-preview.invalid-drop {
        opacity: 0.4;
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      /* Insertion Indicator */
      .insertion-indicator {
        position: absolute;
        background: #3b82f6;
        pointer-events: none;
        z-index: 999;
        border-radius: 2px;
        transition: all 0.15s ease;
      }

      .insertion-indicator.horizontal {
        height: 3px;
        min-width: 60px;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
      }

      .insertion-indicator.vertical {
        width: 3px;
        min-height: 60px;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
      }

      .insertion-indicator::before {
        content: '';
        position: absolute;
        background: #3b82f6;
        border-radius: 50%;
      }

      .insertion-indicator.horizontal::before {
        width: 8px;
        height: 8px;
        top: -2.5px;
        left: -4px;
      }

      .insertion-indicator.vertical::before {
        width: 8px;
        height: 8px;
        left: -2.5px;
        top: -4px;
      }

      .insertion-indicator::after {
        content: '';
        position: absolute;
        background: #3b82f6;
        border-radius: 50%;
      }

      .insertion-indicator.horizontal::after {
        width: 8px;
        height: 8px;
        top: -2.5px;
        right: -4px;
      }

      .insertion-indicator.vertical::after {
        width: 8px;
        height: 8px;
        left: -2.5px;
        bottom: -4px;
      }
    `;
    this.shadowRoot.appendChild(style);
    
    // Add demo info
    const info = document.createElement('div');
    info.className = 'demo-info';
    info.innerHTML = `
      <strong>🎯 Live Drag & Drop Demo</strong><br>
      Drag the blue button into the gray container below. Watch the IR structure update in real-time!
    `;
    this.shadowRoot.appendChild(info);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'drag-container';
    
    // Render IR components
    const renderedElement = this.irRenderer.render(this.currentIR);
    container.appendChild(renderedElement);
    
    this.shadowRoot.appendChild(container);
  }

  private setupSimpleDragDrop() {
    if (!this.shadowRoot) return;

    // Make all buttons draggable
    const buttons = this.shadowRoot.querySelectorAll('button');
    buttons.forEach(button => {
      button.classList.add('draggable');
      button.draggable = true;
      
      button.addEventListener('dragstart', (e) => {
        this.handleDragStart(e, button as HTMLElement);
      });
      
      button.addEventListener('dragend', () => {
        this.handleDragEnd();
      });
    });

    // Make containers drop zones
    const containers = this.shadowRoot.querySelectorAll('[data-ir-type="Row"], [data-ir-type="Stack"]');
    containers.forEach(container => {
      container.classList.add('drop-zone');
      
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
        
        // Simple approach - just show basic insertion indicator
        this.showSimpleInsertionIndicator(e as DragEvent, container as HTMLElement);
      });
      
      container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
        this.clearVisualIndicators();
      });
      
      container.addEventListener('drop', (e) => {
        e.preventDefault();
        this.handleDrop(e as DragEvent, container as HTMLElement);
        container.classList.remove('drag-over');
      });
    });
  }

  private handleDragStart(e: DragEvent, element: HTMLElement) {
    this.draggedElement = element;
    this.draggedComponentId = element.getAttribute('data-ir-component');
    
    element.classList.add('dragging');
    
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.draggedComponentId || '');
    }
    
    console.log('🎯 Drag started:', this.draggedComponentId);
    
    if (this.options.onDragStart) {
      this.options.onDragStart(this.draggedComponentId || '');
    }
  }

  private handleDragEnd() {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    
    // Clear drag over states
    const dropZones = this.shadowRoot?.querySelectorAll('.drop-zone');
    dropZones?.forEach(zone => zone.classList.remove('drag-over'));
    
    // Clear visual indicators
    this.clearVisualIndicators();
  }

  private handleDrop(e: DragEvent, dropTarget: HTMLElement) {
    e.preventDefault();
    
    if (!this.draggedComponentId) return;
    
    const newParentId = dropTarget.getAttribute('data-ir-component');
    if (!newParentId || this.draggedComponentId === newParentId) return;
    
    console.log('🎯 Attempting drop:', this.draggedComponentId, '→', newParentId);
    
    // Perform the IR move operation
    const success = moveComponent(this.currentIR, this.draggedComponentId, newParentId, {
      type: 'children'
    });
    
    if (success) {
      console.log('✅ IR move successful!', this.currentIR);
      
      // Trigger callback
      if (this.options.onIRChange) {
        this.options.onIRChange(this.currentIR);
      }
      
      // Re-render with updated IR
      this.render();
      this.setupSimpleDragDrop();
      
      if (this.options.onDragEnd) {
        this.options.onDragEnd(true);
      }
    } else {
      console.log('❌ IR move failed');
      
      if (this.options.onDragEnd) {
        this.options.onDragEnd(false);
      }
    }
    
    this.draggedComponentId = null;
    this.draggedElement = null;
    this.clearVisualIndicators();
  }

  private showSimpleInsertionIndicator(e: DragEvent, container: HTMLElement) {
    this.clearVisualIndicators();
    
    if (!this.shadowRoot) return;

    // Create simple insertion line
    const indicator = document.createElement('div');
    indicator.className = 'insertion-indicator';
    
    const isRow = container.getAttribute('data-ir-type') === 'Row';
    
    if (isRow) {
      // Horizontal line for Row
      indicator.style.cssText = `
        position: absolute;
        height: 3px;
        width: 60px;
        background: #3b82f6;
        border-radius: 2px;
        pointer-events: none;
        z-index: 999;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
      `;
      
      // Simple positioning - just show at mouse X position
      const rect = container.getBoundingClientRect();
      const shadowRect = this.shadowRoot.host.getBoundingClientRect();
      
      indicator.style.left = (e.clientX - shadowRect.left - 30) + 'px';
      indicator.style.top = (rect.top - shadowRect.top + rect.height / 2) + 'px';
    } else {
      // Vertical line for Stack  
      indicator.style.cssText = `
        position: absolute;
        width: 3px;
        height: 60px;
        background: #3b82f6;
        border-radius: 2px;
        pointer-events: none;
        z-index: 999;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
      `;
      
      const rect = container.getBoundingClientRect();
      const shadowRect = this.shadowRoot.host.getBoundingClientRect();
      
      indicator.style.left = (rect.left - shadowRect.left + rect.width / 2) + 'px';
      indicator.style.top = (e.clientY - shadowRect.top - 30) + 'px';
    }
    
    this.insertionIndicator = indicator;
    this.shadowRoot.appendChild(indicator);
  }

  private clearVisualIndicators() {
    if (this.insertionIndicator) {
      this.insertionIndicator.remove();
      this.insertionIndicator = null;
    }
  }

  public getCurrentIR(): IRComponent {
    return this.currentIR;
  }

  public updateIR(newIR: IRComponent) {
    this.currentIR = newIR;
    this.render();
    this.setupSimpleDragDrop();
  }
}

// Register the custom element
if (!customElements.get('simple-drag-demo')) {
  customElements.define('simple-drag-demo', SimpleDragDemo);
}