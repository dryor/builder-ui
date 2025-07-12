import type { SelectionState, BoundingBox } from '@/types';
import { MoveableManager } from '@/utils/moveable';
import { addBuilderEventListener, EventListenerManager } from '@/utils/events';
import { BuilderEventTypes } from '@/types';
import { BaseBuilderComponent } from '@/components/base-component';

/**
 * Manages selection state and integrates with Moveable for drag/resize operations
 */
export class SelectionManager {
  private eventManager = new EventListenerManager();
  private moveableManager: MoveableManager;
  private selectionState: SelectionState = {
    selectedId: null,
    isVisible: false,
    boundingBox: null,
  };

  constructor(private container: HTMLElement) {
    this.moveableManager = new MoveableManager(container);
    this.setupGlobalEventListeners();
  }

  /**
   * Gets current selection state
   */
  getSelectionState(): SelectionState {
    return { ...this.selectionState };
  }

  /**
   * Selects a component by its element
   */
  selectComponent(element: HTMLElement): void {
    const componentId = element.getAttribute('data-builder-component');
    if (!componentId) return;

    // Deselect current selection
    this.deselectAll();

    // Update selection state
    this.selectionState = {
      selectedId: componentId,
      isVisible: true,
      boundingBox: this.getBoundingBox(element),
    };

    // Trigger component selection
    if (element instanceof BaseBuilderComponent) {
      element.select();
    }

    // Attach moveable to selected element
    const moveableConfig = element instanceof BaseBuilderComponent 
      ? element.getMoveableConfig() 
      : { draggable: true, resizable: true };
      
    this.moveableManager.attach(element, moveableConfig);

    // Dispatch selection event
    this.dispatchSelectionChange();
  }

  /**
   * Selects a component by its ID
   */
  selectComponentById(componentId: string): void {
    const element = this.findComponentById(componentId);
    if (element) {
      this.selectComponent(element);
    }
  }

  /**
   * Deselects all components
   */
  deselectAll(): void {
    if (this.selectionState.selectedId) {
      const element = this.findComponentById(this.selectionState.selectedId);
      if (element instanceof BaseBuilderComponent) {
        element.deselect();
      }
    }

    this.moveableManager.detachAll();
    
    this.selectionState = {
      selectedId: null,
      isVisible: false,
      boundingBox: null,
    };

    this.dispatchSelectionChange();
  }

  /**
   * Gets the currently selected element
   */
  getSelectedElement(): HTMLElement | null {
    if (!this.selectionState.selectedId) return null;
    return this.findComponentById(this.selectionState.selectedId);
  }

  /**
   * Gets the currently selected component ID
   */
  getSelectedId(): string | null {
    return this.selectionState.selectedId;
  }

  /**
   * Checks if a component is selected
   */
  isSelected(componentId: string): boolean {
    return this.selectionState.selectedId === componentId;
  }

  /**
   * Updates the selection bounding box
   */
  updateSelectionBounds(): void {
    if (!this.selectionState.selectedId) return;

    const element = this.findComponentById(this.selectionState.selectedId);
    if (element) {
      this.selectionState.boundingBox = this.getBoundingBox(element);
      this.dispatchSelectionChange();
    }
  }

  /**
   * Gets moveable manager instance
   */
  getMoveableManager(): MoveableManager {
    return this.moveableManager;
  }

  /**
   * Sets up global event listeners for selection
   */
  private setupGlobalEventListeners(): void {
    // Listen for component selection events
    addBuilderEventListener(
      this.container,
      BuilderEventTypes.SELECT,
      this.handleComponentSelect.bind(this)
    );

    addBuilderEventListener(
      this.container,
      BuilderEventTypes.DESELECT,
      this.handleComponentDeselect.bind(this)
    );

    // Listen for click events to handle deselection
    this.eventManager.add(
      this.container,
      'click',
      this.handleContainerClick.bind(this)
    );

    // Listen for drag/resize events to update selection bounds
    addBuilderEventListener(
      this.container,
      BuilderEventTypes.DRAG_MOVE,
      this.handleDragMove.bind(this)
    );

    addBuilderEventListener(
      this.container,
      BuilderEventTypes.RESIZE_MOVE,
      this.handleResizeMove.bind(this)
    );
  }

  /**
   * Handles component selection events
   */
  private handleComponentSelect(event: CustomEvent): void {
    const { componentId } = event.detail.data;
    const element = this.findComponentById(componentId);
    
    if (element && this.selectionState.selectedId !== componentId) {
      this.selectComponent(element);
    }
  }

  /**
   * Handles component deselection events
   */
  private handleComponentDeselect(event: CustomEvent): void {
    const { componentId } = event.detail.data;
    
    if (this.selectionState.selectedId === componentId) {
      this.deselectAll();
    }
  }

  /**
   * Handles container clicks for deselection
   */
  private handleContainerClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // If click is not on a builder component, deselect all
    if (!target.closest('[data-builder-component]')) {
      this.deselectAll();
    }
  }

  /**
   * Handles drag move events
   */
  private handleDragMove(_event: CustomEvent): void {
    this.updateSelectionBounds();
  }

  /**
   * Handles resize move events
   */
  private handleResizeMove(_event: CustomEvent): void {
    this.updateSelectionBounds();
  }

  /**
   * Finds a component element by its ID
   */
  private findComponentById(componentId: string): HTMLElement | null {
    return this.container.querySelector(`[data-builder-component="${componentId}"]`);
  }

  /**
   * Gets bounding box relative to container
   */
  private getBoundingBox(element: HTMLElement): BoundingBox {
    const elementRect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    return {
      x: elementRect.left - containerRect.left,
      y: elementRect.top - containerRect.top,
      width: elementRect.width,
      height: elementRect.height,
    };
  }

  /**
   * Dispatches selection change events
   */
  private dispatchSelectionChange(): void {
    const event = new CustomEvent('selection:change', {
      detail: this.selectionState,
      bubbles: true,
    });

    this.container.dispatchEvent(event);
  }

  /**
   * Destroys the selection manager and cleans up resources
   */
  destroy(): void {
    this.deselectAll();
    this.moveableManager.destroy();
    this.eventManager.removeAll();
  }
}