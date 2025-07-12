import type { BoundingBox, Position, Dimensions } from '@/types';

/**
 * DOM utility functions for the visual builder
 */

/**
 * Gets the bounding box of an element relative to the viewport
 */
export function getBoundingBox(element: HTMLElement): BoundingBox {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Gets the bounding box of an element relative to its offset parent
 */
export function getRelativeBoundingBox(element: HTMLElement, parent?: HTMLElement): BoundingBox {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
  
  return {
    x: elementRect.left - parentRect.left,
    y: elementRect.top - parentRect.top,
    width: elementRect.width,
    height: elementRect.height,
  };
}

/**
 * Sets the position of an element
 */
export function setElementPosition(element: HTMLElement, position: Position): void {
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
}

/**
 * Sets the size of an element
 */
export function setElementSize(element: HTMLElement, dimensions: Dimensions): void {
  element.style.width = `${dimensions.width}px`;
  element.style.height = `${dimensions.height}px`;
}

/**
 * Finds the closest builder component ancestor
 */
export function findBuilderComponent(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    if (current.hasAttribute('data-builder-component')) {
      return current;
    }
    current = current.parentElement;
  }
  
  return null;
}

/**
 * Generates a unique ID for builder components
 */
export function generateComponentId(prefix = 'component'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Adds CSS classes to an element
 */
export function addClasses(element: HTMLElement, classes: string | string[]): void {
  const classArray = Array.isArray(classes) ? classes : classes.split(' ').filter(Boolean);
  element.classList.add(...classArray);
}

/**
 * Removes CSS classes from an element
 */
export function removeClasses(element: HTMLElement, classes: string | string[]): void {
  const classArray = Array.isArray(classes) ? classes : classes.split(' ').filter(Boolean);
  element.classList.remove(...classArray);
}

/**
 * Checks if a point is inside a bounding box
 */
export function isPointInBox(point: Position, box: BoundingBox): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * Calculates the distance between two points
 */
export function distance(point1: Position, point2: Position): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Constrains a value between min and max bounds
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: never[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}