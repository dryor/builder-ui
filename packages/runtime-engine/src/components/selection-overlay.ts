import type { BoundingBox, SelectionState } from '@/types';
import { addClasses, removeClasses } from '@/utils/dom';

/**
 * Visual overlay component that displays selection indicators
 * Uses Tailwind CSS for styling without DOM pollution
 */
export class SelectionOverlay {
  private overlay: HTMLElement;
  private handles: HTMLElement[] = [];
  private isVisible = false;
  private currentBounds: BoundingBox | null = null;

  constructor(private container: HTMLElement) {
    this.overlay = this.createOverlayElement();
    this.container.appendChild(this.overlay);
    this.hide();
  }

  /**
   * Shows the selection overlay at the specified bounds
   */
  show(bounds: BoundingBox): void {
    this.currentBounds = bounds;
    this.updatePosition(bounds);
    this.updateHandles(bounds);
    
    if (!this.isVisible) {
      removeClasses(this.overlay, 'hidden');
      addClasses(this.overlay, 'block');
      this.isVisible = true;
    }
  }

  /**
   * Hides the selection overlay
   */
  hide(): void {
    if (this.isVisible) {
      addClasses(this.overlay, 'hidden');
      removeClasses(this.overlay, 'block');
      this.isVisible = false;
    }
  }

  /**
   * Updates the overlay position and size
   */
  updatePosition(bounds: BoundingBox): void {
    this.currentBounds = bounds;
    
    Object.assign(this.overlay.style, {
      left: `${bounds.x}px`,
      top: `${bounds.y}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    });

    this.updateHandles(bounds);
  }

  /**
   * Updates selection state
   */
  updateSelection(state: SelectionState): void {
    if (state.isVisible && state.boundingBox) {
      this.show(state.boundingBox);
    } else {
      this.hide();
    }
  }

  /**
   * Gets current bounds
   */
  getCurrentBounds(): BoundingBox | null {
    return this.currentBounds ? { ...this.currentBounds } : null;
  }

  /**
   * Checks if overlay is visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Creates the main overlay element
   */
  private createOverlayElement(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'builder-overlay fixed pointer-events-none select-none z-overlay';
    
    // Add Tailwind classes for styling
    addClasses(overlay, [
      'absolute',
      'border-2',
      'border-builder-primary',
      'bg-builder-primary/10',
      'rounded-sm',
      'transition-all',
      'duration-150',
      'ease-in-out'
    ]);

    return overlay;
  }

  /**
   * Creates resize handles
   */
  private createHandles(): HTMLElement[] {
    const handlePositions = [
      { name: 'nw', classes: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize' },
      { name: 'n', classes: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize' },
      { name: 'ne', classes: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize' },
      { name: 'e', classes: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize' },
      { name: 'se', classes: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize' },
      { name: 's', classes: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize' },
      { name: 'sw', classes: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize' },
      { name: 'w', classes: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize' },
    ];

    return handlePositions.map(({ name, classes }) => {
      const handle = document.createElement('div');
      handle.className = 'builder-selection-handle absolute w-2 h-2 bg-builder-primary border border-white rounded-sm z-selection pointer-events-auto';
      handle.dataset['handle'] = name;
      
      addClasses(handle, classes.split(' '));
      
      this.overlay.appendChild(handle);
      return handle;
    });
  }

  /**
   * Updates handle positions
   */
  private updateHandles(bounds: BoundingBox): void {
    // Create handles if they don't exist
    if (this.handles.length === 0) {
      this.handles = this.createHandles();
    }

    // Show/hide handles based on size
    const showHandles = bounds.width >= 20 && bounds.height >= 20;
    
    this.handles.forEach(handle => {
      if (showHandles) {
        removeClasses(handle, 'hidden');
        addClasses(handle, 'block');
      } else {
        addClasses(handle, 'hidden');
        removeClasses(handle, 'block');
      }
    });
  }

  /**
   * Sets overlay theme
   */
  setTheme(theme: 'primary' | 'secondary' | 'accent' | 'danger'): void {
    // Remove existing theme classes
    removeClasses(this.overlay, [
      'border-builder-primary',
      'bg-builder-primary/10',
      'border-builder-secondary',
      'bg-builder-secondary/10',
      'border-builder-accent',
      'bg-builder-accent/10',
      'border-builder-danger',
      'bg-builder-danger/10'
    ]);

    // Add new theme classes
    addClasses(this.overlay, [
      `border-builder-${theme}`,
      `bg-builder-${theme}/10`
    ]);

    // Update handle colors
    this.handles.forEach(handle => {
      removeClasses(handle, [
        'bg-builder-primary',
        'bg-builder-secondary',
        'bg-builder-accent',
        'bg-builder-danger'
      ]);
      addClasses(handle, `bg-builder-${theme}`);
    });
  }

  /**
   * Destroys the overlay and cleans up
   */
  destroy(): void {
    this.hide();
    
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    this.handles = [];
  }
}

/**
 * Manages multiple selection overlays
 */
export class SelectionOverlayManager {
  private overlays = new Map<string, SelectionOverlay>();
  private primaryOverlay: SelectionOverlay;

  constructor(private container: HTMLElement) {
    this.primaryOverlay = new SelectionOverlay(container);
    this.setupSelectionListener();
  }

  /**
   * Shows primary selection overlay
   */
  showPrimary(bounds: BoundingBox): void {
    this.primaryOverlay.show(bounds);
  }

  /**
   * Hides primary selection overlay
   */
  hidePrimary(): void {
    this.primaryOverlay.hide();
  }

  /**
   * Updates primary overlay with selection state
   */
  updatePrimary(state: SelectionState): void {
    this.primaryOverlay.updateSelection(state);
  }

  /**
   * Creates a secondary overlay for multi-selection
   */
  createSecondary(id: string, bounds: BoundingBox): void {
    if (!this.overlays.has(id)) {
      const overlay = new SelectionOverlay(this.container);
      overlay.setTheme('secondary');
      this.overlays.set(id, overlay);
    }
    
    const overlay = this.overlays.get(id)!;
    overlay.show(bounds);
  }

  /**
   * Removes a secondary overlay
   */
  removeSecondary(id: string): void {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.destroy();
      this.overlays.delete(id);
    }
  }

  /**
   * Clears all secondary overlays
   */
  clearSecondary(): void {
    this.overlays.forEach((overlay, _id) => {
      overlay.destroy();
    });
    this.overlays.clear();
  }

  /**
   * Gets the primary overlay
   */
  getPrimaryOverlay(): SelectionOverlay {
    return this.primaryOverlay;
  }

  /**
   * Sets up listener for selection changes
   */
  private setupSelectionListener(): void {
    this.container.addEventListener('selection:change', (event) => {
      const customEvent = event as CustomEvent<SelectionState>;
      this.updatePrimary(customEvent.detail);
    });
  }

  /**
   * Destroys all overlays
   */
  destroy(): void {
    this.primaryOverlay.destroy();
    this.clearSecondary();
  }
}