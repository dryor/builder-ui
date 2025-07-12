import Moveable from 'moveable';
import type { 
  Position, 
  Dimensions, 
  BoundingBox,
  BuilderEventType 
} from '@/types';
import { dispatchBuilderEvent, EventListenerManager } from '@/utils/events';
import { BuilderEventTypes } from '@/types';

/**
 * Configuration options for Moveable instances
 */
export interface MoveableConfig {
  /** Whether the element can be dragged */
  draggable?: boolean;
  /** Whether the element can be resized */
  resizable?: boolean;
  /** Whether to show rotation handles */
  rotatable?: boolean;
  /** Whether to show scale handles */
  scalable?: boolean;
  /** Bounds for movement/resizing */
  bounds?: { left: number; top: number; right: number; bottom: number };
  /** Snap to grid */
  snappable?: boolean;
  /** Snap guidelines */
  guidelines?: HTMLElement[];
}

/**
 * Data passed with drag/resize events
 */
export interface MoveableEventData {
  componentId: string;
  position?: Position;
  dimensions?: Dimensions;
  boundingBox: BoundingBox;
  transform?: string;
}

/**
 * Wrapper class for Moveable.js with TypeScript support
 * Provides high-level interface for drag/resize operations
 */
export class MoveableController {
  private moveable: Moveable | null = null;
  private target: HTMLElement | null = null;
  private eventManager = new EventListenerManager();
  private componentId: string | null = null;

  constructor(private container: HTMLElement) {}

  /**
   * Attaches Moveable to a target element
   */
  attach(element: HTMLElement, config: MoveableConfig = {}): void {
    this.detach();

    this.target = element;
    this.componentId = element.getAttribute('data-builder-component');

    const defaultConfig: MoveableConfig = {
      draggable: true,
      resizable: true,
      rotatable: false,
      scalable: false,
      snappable: true,
      ...config,
    };

    const moveableOptions: any = {
      target: element,
      draggable: defaultConfig.draggable!,
      resizable: defaultConfig.resizable!,
      rotatable: defaultConfig.rotatable!,
      scalable: defaultConfig.scalable!,
      snappable: defaultConfig.snappable!,
      
      // Styling
      className: 'builder-moveable',
      
      // Snap settings
      snapContainer: this.container,
      snapThreshold: 5,
      snapDigit: 0,
      
      // Performance optimizations
      ables: [],
      useResizeObserver: true,
      useAccuratePosition: false,
    };

    // Only add bounds if it exists
    if (defaultConfig.bounds) {
      moveableOptions.bounds = defaultConfig.bounds;
    }

    this.moveable = new Moveable(this.container, moveableOptions);

    this.setupMoveableEvents();
  }

  /**
   * Detaches Moveable from current target
   */
  detach(): void {
    if (this.moveable) {
      this.moveable.destroy();
      this.moveable = null;
    }
    
    this.target = null;
    this.componentId = null;
    this.eventManager.removeAll();
  }

  /**
   * Updates Moveable configuration
   */
  updateConfig(config: Partial<MoveableConfig>): void {
    if (!this.moveable) return;

    Object.keys(config).forEach((key) => {
      const value = config[key as keyof MoveableConfig];
      if (value !== undefined) {
        (this.moveable as any)[key] = value;
      }
    });
  }

  /**
   * Gets current target element
   */
  getTarget(): HTMLElement | null {
    return this.target;
  }

  /**
   * Gets current bounding box of target
   */
  getBoundingBox(): BoundingBox | null {
    if (!this.target) return null;

    const rect = this.target.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Manually trigger a position update
   */
  updatePosition(position: Position): void {
    if (!this.target || !this.moveable) return;

    this.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
    this.moveable.updateRect();
  }

  /**
   * Manually trigger a size update
   */
  updateSize(dimensions: Dimensions): void {
    if (!this.target || !this.moveable) return;

    this.target.style.width = `${dimensions.width}px`;
    this.target.style.height = `${dimensions.height}px`;
    this.moveable.updateRect();
  }

  /**
   * Sets up event listeners for Moveable events
   */
  private setupMoveableEvents(): void {
    if (!this.moveable || !this.target) return;

    // Drag events
    this.moveable.on('dragStart', () => {
      this.dispatchEvent(BuilderEventTypes.DRAG_START);
    });

    this.moveable.on('drag', (e) => {
      e.target.style.transform = e.transform;
      this.dispatchEvent(BuilderEventTypes.DRAG_MOVE, {
        position: { x: e.left, y: e.top },
        transform: e.transform,
      });
    });

    this.moveable.on('dragEnd', () => {
      this.dispatchEvent(BuilderEventTypes.DRAG_END);
    });

    // Resize events
    this.moveable.on('resizeStart', () => {
      this.dispatchEvent(BuilderEventTypes.RESIZE_START);
    });

    this.moveable.on('resize', (e) => {
      e.target.style.width = `${e.width}px`;
      e.target.style.height = `${e.height}px`;
      e.target.style.transform = e.drag.transform;
      
      this.dispatchEvent(BuilderEventTypes.RESIZE_MOVE, {
        dimensions: { width: e.width, height: e.height },
        position: { x: e.drag.left, y: e.drag.top },
        transform: e.drag.transform,
      });
    });

    this.moveable.on('resizeEnd', () => {
      this.dispatchEvent(BuilderEventTypes.RESIZE_END);
    });
  }

  /**
   * Dispatches builder events with moveable data
   */
  private dispatchEvent(
    type: BuilderEventType, 
    additionalData: Partial<MoveableEventData> = {}
  ): void {
    if (!this.target || !this.componentId) return;

    const boundingBox = this.getBoundingBox();
    if (!boundingBox) return;

    const eventData: MoveableEventData = {
      componentId: this.componentId,
      boundingBox,
      ...additionalData,
    };

    dispatchBuilderEvent(this.target, type, eventData);
  }

  /**
   * Destroys the controller and cleans up resources
   */
  destroy(): void {
    this.detach();
  }
}

/**
 * Global moveable controller manager
 * Manages multiple moveable instances across the application
 */
export class MoveableManager {
  private controllers = new Map<string, MoveableController>();
  private activeController: MoveableController | null = null;

  constructor(private container: HTMLElement) {}

  /**
   * Creates and attaches a moveable controller to an element
   */
  attach(element: HTMLElement, config?: MoveableConfig): void {
    const componentId = element.getAttribute('data-builder-component');
    if (!componentId) return;

    // Detach from any existing target
    this.detachAll();

    // Create new controller
    const controller = new MoveableController(this.container);
    controller.attach(element, config);

    this.controllers.set(componentId, controller);
    this.activeController = controller;
  }

  /**
   * Detaches moveable from a specific element
   */
  detach(componentId: string): void {
    const controller = this.controllers.get(componentId);
    if (controller) {
      controller.detach();
      this.controllers.delete(componentId);
      
      if (this.activeController === controller) {
        this.activeController = null;
      }
    }
  }

  /**
   * Detaches moveable from all elements
   */
  detachAll(): void {
    this.controllers.forEach((controller) => {
      controller.detach();
    });
    this.controllers.clear();
    this.activeController = null;
  }

  /**
   * Gets the active controller
   */
  getActiveController(): MoveableController | null {
    return this.activeController;
  }

  /**
   * Gets a controller by component ID
   */
  getController(componentId: string): MoveableController | null {
    return this.controllers.get(componentId) || null;
  }

  /**
   * Updates config for a specific controller
   */
  updateConfig(componentId: string, config: Partial<MoveableConfig>): void {
    const controller = this.controllers.get(componentId);
    if (controller) {
      controller.updateConfig(config);
    }
  }

  /**
   * Destroys the manager and all controllers
   */
  destroy(): void {
    this.detachAll();
  }
}