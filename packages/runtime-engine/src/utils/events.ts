import type { BuilderEvent, BuilderEventType } from '@/types';

/**
 * Event utility functions for the visual builder
 */

/**
 * Creates a builder event with standard structure
 */
export function createBuilderEvent<T = unknown>(
  type: BuilderEventType,
  data: T,
  source: HTMLElement
): BuilderEvent<T> {
  return {
    type,
    data,
    source,
    timestamp: Date.now(),
  };
}

/**
 * Dispatches a custom builder event
 */
export function dispatchBuilderEvent<T = unknown>(
  element: HTMLElement,
  type: BuilderEventType,
  data: T,
  options: EventInit = {}
): boolean {
  const builderEvent = createBuilderEvent(type, data, element);
  
  const customEvent = new CustomEvent(type, {
    detail: builderEvent,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  
  return element.dispatchEvent(customEvent);
}

/**
 * Adds an event listener for builder events
 */
export function addBuilderEventListener<T = unknown>(
  element: HTMLElement,
  type: BuilderEventType,
  listener: (event: CustomEvent<BuilderEvent<T>>) => void,
  options?: AddEventListenerOptions
): void {
  element.addEventListener(type, listener as EventListener, options);
}

/**
 * Removes an event listener for builder events
 */
export function removeBuilderEventListener<T = unknown>(
  element: HTMLElement,
  type: BuilderEventType,
  listener: (event: CustomEvent<BuilderEvent<T>>) => void,
  options?: EventListenerOptions
): void {
  element.removeEventListener(type, listener as EventListener, options);
}

/**
 * Prevents default behavior and stops propagation for DOM events
 */
export function preventAndStop(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Gets mouse/touch position from event
 */
export function getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  
  if ('clientX' in event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  
  return { x: 0, y: 0 };
}

/**
 * Event listener cleanup helper
 */
export class EventListenerManager {
  private listeners: Array<{
    element: HTMLElement;
    type: string;
    listener: EventListener;
    options?: EventListenerOptions;
  }> = [];

  /**
   * Adds an event listener and tracks it for cleanup
   */
  add(
    element: HTMLElement,
    type: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): void {
    element.addEventListener(type, listener, options);
    if (options) {
      this.listeners.push({ element, type, listener, options });
    } else {
      this.listeners.push({ element, type, listener });
    }
  }

  /**
   * Removes a specific event listener
   */
  remove(
    element: HTMLElement,
    type: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): void {
    element.removeEventListener(type, listener, options);
    this.listeners = this.listeners.filter(
      (l) => l.element !== element || l.type !== type || l.listener !== listener
    );
  }

  /**
   * Removes all tracked event listeners
   */
  removeAll(): void {
    this.listeners.forEach(({ element, type, listener, options }) => {
      element.removeEventListener(type, listener, options);
    });
    this.listeners = [];
  }

  /**
   * Gets the count of tracked listeners
   */
  get count(): number {
    return this.listeners.length;
  }
}