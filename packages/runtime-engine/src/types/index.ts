/**
 * Core type definitions for the visual builder runtime engine
 */

/**
 * Position coordinates for elements
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions for elements
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Bounding box combining position and dimensions
 */
export interface BoundingBox extends Position, Dimensions {}

/**
 * Selection state for builder elements
 */
export interface SelectionState {
  /** Currently selected element ID */
  selectedId: string | null;
  /** Whether selection overlay is visible */
  isVisible: boolean;
  /** Bounding box of selected element */
  boundingBox: BoundingBox | null;
}

/**
 * Drag operation state
 */
export interface DragState {
  /** Whether drag operation is active */
  isDragging: boolean;
  /** Element being dragged */
  draggedElement: HTMLElement | null;
  /** Initial position when drag started */
  startPosition: Position;
  /** Current drag offset */
  offset: Position;
}

/**
 * Event data for builder interactions
 */
export interface BuilderEvent<T = unknown> {
  /** Event type identifier */
  type: string;
  /** Event payload data */
  data: T;
  /** Source element that triggered the event */
  source: HTMLElement;
  /** Timestamp when event occurred */
  timestamp: number;
}

/**
 * Configuration for builder components
 */
export interface BuilderComponentConfig {
  /** Unique identifier for the component */
  id: string;
  /** Display name for the component */
  name: string;
  /** Whether component can be selected */
  selectable: boolean;
  /** Whether component can be dragged */
  draggable: boolean;
  /** Whether component can be resized */
  resizable: boolean;
  /** Custom CSS classes to apply */
  className?: string;
  /** Custom styles to apply */
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Base interface for all builder web components
 */
export interface IBuilderComponent {
  /** Component configuration */
  readonly config: BuilderComponentConfig;
  /** Whether component is currently selected */
  readonly isSelected: boolean;
  /** Current bounding box of the component */
  readonly boundingBox: BoundingBox;
  
  /** Select this component */
  select(): void;
  /** Deselect this component */
  deselect(): void;
  /** Update component position */
  updatePosition(position: Position): void;
  /** Update component size */
  updateSize(dimensions: Dimensions): void;
  /** Get component data for serialization */
  serialize(): Record<string, unknown>;
}

/**
 * Event type constants
 */
export const BuilderEventTypes = {
  SELECT: 'builder:select',
  DESELECT: 'builder:deselect',
  DRAG_START: 'builder:drag:start',
  DRAG_MOVE: 'builder:drag:move',
  DRAG_END: 'builder:drag:end',
  RESIZE_START: 'builder:resize:start',
  RESIZE_MOVE: 'builder:resize:move',
  RESIZE_END: 'builder:resize:end',
} as const;

export type BuilderEventType = typeof BuilderEventTypes[keyof typeof BuilderEventTypes];