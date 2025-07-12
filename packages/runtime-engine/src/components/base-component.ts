import type { 
  IBuilderComponent, 
  BuilderComponentConfig, 
  BoundingBox, 
  Position, 
  Dimensions 
} from '@/types';
import { 
  getBoundingBox, 
  setElementPosition, 
  setElementSize, 
  generateComponentId,
  addClasses,
  removeClasses 
} from '@/utils/dom';
import { dispatchBuilderEvent, EventListenerManager } from '@/utils/events';
import { BuilderEventTypes } from '@/types';
import type { MoveableConfig } from '@/utils/moveable';

/**
 * Base class for all builder web components
 * Provides common functionality for selection, positioning, and event handling
 */
export abstract class BaseBuilderComponent extends HTMLElement implements IBuilderComponent {
  protected eventManager = new EventListenerManager();
  protected _isSelected = false;
  
  private _config: BuilderComponentConfig;

  constructor(config?: Partial<BuilderComponentConfig>) {
    super();
    
    // Initialize configuration with defaults
    this._config = {
      id: generateComponentId(),
      name: this.constructor.name,
      selectable: true,
      draggable: true,
      resizable: true,
      ...config,
    };

    // Set data attribute for component identification
    this.setAttribute('data-builder-component', this._config.id);
    this.setAttribute('data-component-type', this._config.name);

    // Apply base classes
    this.classList.add('builder-selectable');
    
    if (this._config.className) {
      addClasses(this, this._config.className);
    }

    // Apply custom styles
    if (this._config.style) {
      Object.assign(this.style, this._config.style);
    }
  }

  /**
   * Component lifecycle: called when element is connected to DOM
   */
  connectedCallback(): void {
    this.setupEventListeners();
    this.render();
  }

  /**
   * Component lifecycle: called when element is disconnected from DOM
   */
  disconnectedCallback(): void {
    this.cleanup();
  }

  /**
   * Component configuration (read-only)
   */
  get config(): BuilderComponentConfig {
    return { ...this._config };
  }

  /**
   * Whether component is currently selected
   */
  get isSelected(): boolean {
    return this._isSelected;
  }

  /**
   * Current bounding box of the component
   */
  get boundingBox(): BoundingBox {
    return getBoundingBox(this);
  }

  /**
   * Selects this component and dispatches selection event
   */
  select(): void {
    if (!this._config.selectable || this._isSelected) {
      return;
    }

    this._isSelected = true;
    addClasses(this, 'builder-selected');
    
    dispatchBuilderEvent(this, BuilderEventTypes.SELECT, {
      componentId: this._config.id,
      boundingBox: this.boundingBox,
    });
  }

  /**
   * Deselects this component and dispatches deselection event
   */
  deselect(): void {
    if (!this._isSelected) {
      return;
    }

    this._isSelected = false;
    removeClasses(this, 'builder-selected');
    
    dispatchBuilderEvent(this, BuilderEventTypes.DESELECT, {
      componentId: this._config.id,
    });
  }

  /**
   * Updates component position
   */
  updatePosition(position: Position): void {
    setElementPosition(this, position);
    
    dispatchBuilderEvent(this, BuilderEventTypes.DRAG_MOVE, {
      componentId: this._config.id,
      position,
      boundingBox: this.boundingBox,
    });
  }

  /**
   * Updates component size
   */
  updateSize(dimensions: Dimensions): void {
    setElementSize(this, dimensions);
    
    dispatchBuilderEvent(this, BuilderEventTypes.RESIZE_MOVE, {
      componentId: this._config.id,
      dimensions,
      boundingBox: this.boundingBox,
    });
  }

  /**
   * Gets moveable configuration for this component
   */
  getMoveableConfig(): MoveableConfig {
    return {
      draggable: this._config.draggable,
      resizable: this._config.resizable,
      rotatable: false,
      scalable: false,
      snappable: true,
    };
  }

  /**
   * Serializes component data for persistence
   */
  serialize(): Record<string, unknown> {
    const boundingBox = this.boundingBox;
    
    return {
      id: this._config.id,
      type: this._config.name,
      config: this._config,
      position: { x: boundingBox.x, y: boundingBox.y },
      dimensions: { width: boundingBox.width, height: boundingBox.height },
      isSelected: this._isSelected,
    };
  }

  /**
   * Sets up event listeners for component interactions
   */
  protected setupEventListeners(): void {
    if (this._config.selectable) {
      this.eventManager.add(this, 'click', this.handleClick.bind(this));
    }
  }

  /**
   * Handles click events for selection
   */
  protected handleClick(event: Event): void {
    event.stopPropagation();
    
    if (!this._isSelected) {
      this.select();
    }
  }

  /**
   * Abstract method for rendering component content
   * Must be implemented by subclasses
   */
  protected abstract render(): void;

  /**
   * Cleanup method called on disconnection
   */
  protected cleanup(): void {
    this.eventManager.removeAll();
    this.deselect();
  }
}