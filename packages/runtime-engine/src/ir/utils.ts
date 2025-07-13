/**
 * IR Utility Functions
 * Helper functions for working with IR structures
 */

import type { IRComponent, IRDocument, IROptions } from '@/types/ir-schema';
import { DEFAULT_IR_SCHEMA } from './component-schema';

/**
 * Generates a unique component ID
 */
export function generateComponentId(type: string, prefix?: string): string {
  const actualPrefix = prefix || 'component';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${actualPrefix}-${type.toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Creates a new IR component with default values
 */
export function createIRComponent(
  type: string, 
  props?: Record<string, unknown>,
  options?: IROptions
): IRComponent {
  const id = options?.autoGenerateIds !== false 
    ? generateComponentId(type, options?.idPrefix)
    : `${type.toLowerCase()}-${Date.now()}`;

  const baseComponent = {
    id,
    type,
    props: props || {},
  };

  // Add default children/slots based on component type
  switch (type) {
    case 'Row':
    case 'Stack':
      return {
        ...baseComponent,
        children: [],
      } as IRComponent;
      
    case 'Button':
      return {
        ...baseComponent,
        children: [],
        slots: {},
      } as IRComponent;
      
    default:
      return baseComponent as IRComponent;
  }
}

/**
 * Creates a new IR document with default structure
 */
export function createIRDocument(rootComponent?: IRComponent): IRDocument {
  const now = new Date().toISOString();
  
  return {
    meta: {
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
    },
    schema: DEFAULT_IR_SCHEMA,
    root: rootComponent || createIRComponent('Stack'),
  };
}

/**
 * Deep clones an IR component
 */
export function cloneIRComponent(component: IRComponent): IRComponent {
  return JSON.parse(JSON.stringify(component));
}

/**
 * Finds a component by ID in an IR tree
 */
export function findComponentById(root: IRComponent, id: string): IRComponent | null {
  if (root.id === id) {
    return root;
  }

  // Search in children
  if (root.children) {
    for (const child of root.children) {
      const found = findComponentById(child, id);
      if (found) return found;
    }
  }

  // Search in slots
  if (root.slots) {
    for (const slotComponents of Object.values(root.slots)) {
      for (const slotComponent of slotComponents) {
        const found = findComponentById(slotComponent, id);
        if (found) return found;
      }
    }
  }

  return null;
}

/**
 * Finds the parent component of a given component ID
 */
export function findParentComponent(root: IRComponent, targetId: string): IRComponent | null {
  // Check children
  if (root.children) {
    for (const child of root.children) {
      if (child.id === targetId) {
        return root;
      }
      const found = findParentComponent(child, targetId);
      if (found) return found;
    }
  }

  // Check slots
  if (root.slots) {
    for (const slotComponents of Object.values(root.slots)) {
      for (const slotComponent of slotComponents) {
        if (slotComponent.id === targetId) {
          return root;
        }
        const found = findParentComponent(slotComponent, targetId);
        if (found) return found;
      }
    }
  }

  return null;
}

/**
 * Gets the path to a component in the IR tree
 */
export function getComponentPath(root: IRComponent, targetId: string): string[] {
  function searchPath(component: IRComponent, path: string[]): string[] | null {
    if (component.id === targetId) {
      return path;
    }

    // Search children
    if (component.children) {
      for (let i = 0; i < component.children.length; i++) {
        const found = searchPath(component.children[i], [...path, 'children', i.toString()]);
        if (found) return found;
      }
    }

    // Search slots
    if (component.slots) {
      for (const [slotName, slotComponents] of Object.entries(component.slots)) {
        for (let i = 0; i < slotComponents.length; i++) {
          const found = searchPath(slotComponents[i], [...path, 'slots', slotName, i.toString()]);
          if (found) return found;
        }
      }
    }

    return null;
  }

  return searchPath(root, []) || [];
}

/**
 * Adds a component to another component's children
 */
export function addChildComponent(
  parent: IRComponent, 
  child: IRComponent, 
  index?: number
): boolean {
  if (!parent.children) {
    parent.children = [];
  }

  if (index !== undefined && index >= 0 && index <= parent.children.length) {
    parent.children.splice(index, 0, child);
  } else {
    parent.children.push(child);
  }

  return true;
}

/**
 * Adds a component to a slot
 */
export function addSlotComponent(
  parent: IRComponent,
  slotName: string,
  child: IRComponent,
  index?: number
): boolean {
  if (!parent.slots) {
    parent.slots = {} as any;
  }

  if (parent.slots && !parent.slots[slotName as keyof typeof parent.slots]) {
    (parent.slots as any)[slotName] = [];
  }

  const slotArray = (parent.slots as any)[slotName] as IRComponent[];
  if (slotArray && index !== undefined && index >= 0 && index <= slotArray.length) {
    slotArray.splice(index, 0, child);
  } else if (slotArray) {
    slotArray.push(child);
  }

  return true;
}

/**
 * Removes a component from its parent
 */
export function removeComponent(root: IRComponent, targetId: string): boolean {
  // Check children
  if (root.children) {
    const index = root.children.findIndex(child => child.id === targetId);
    if (index !== -1) {
      root.children.splice(index, 1);
      return true;
    }

    // Recursively check children
    for (const child of root.children) {
      if (removeComponent(child, targetId)) {
        return true;
      }
    }
  }

  // Check slots
  if (root.slots) {
    for (const [slotName, slotComponents] of Object.entries(root.slots)) {
      const typedSlotComponents = slotComponents as IRComponent[];
      const index = typedSlotComponents.findIndex(component => component.id === targetId);
      if (index !== -1) {
        typedSlotComponents.splice(index, 1);
        // Clean up empty slots
        if (typedSlotComponents.length === 0 && root.slots) {
          delete (root.slots as any)[slotName];
        }
        return true;
      }

      // Recursively check slot components
      for (const slotComponent of slotComponents) {
        if (removeComponent(slotComponent, targetId)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Moves a component to a different position in the tree
 */
export function moveComponent(
  root: IRComponent,
  componentId: string,
  newParentId: string,
  position?: { type: 'children' | 'slot'; slotName?: string; index?: number }
): boolean {
  // Find and remove the component
  const component = findComponentById(root, componentId);
  if (!component) return false;

  const clonedComponent = cloneIRComponent(component);
  
  if (!removeComponent(root, componentId)) return false;

  // Find new parent
  const newParent = findComponentById(root, newParentId);
  if (!newParent) return false;

  // Add to new position
  if (position?.type === 'slot' && position.slotName) {
    return addSlotComponent(newParent, position.slotName, clonedComponent, position.index);
  } else {
    return addChildComponent(newParent, clonedComponent, position?.index);
  }
}

/**
 * Gets all component IDs in an IR tree
 */
export function getAllComponentIds(root: IRComponent): string[] {
  const ids: string[] = [root.id];

  // Collect from children
  if (root.children) {
    for (const child of root.children) {
      ids.push(...getAllComponentIds(child));
    }
  }

  // Collect from slots
  if (root.slots) {
    for (const slotComponents of Object.values(root.slots)) {
      for (const slotComponent of slotComponents) {
        ids.push(...getAllComponentIds(slotComponent));
      }
    }
  }

  return ids;
}

/**
 * Validates that all component IDs are unique
 */
export function validateUniqueIds(root: IRComponent): { isValid: boolean; duplicates: string[] } {
  const ids = getAllComponentIds(root);
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }

  return {
    isValid: duplicates.size === 0,
    duplicates: Array.from(duplicates),
  };
}

/**
 * Updates component properties
 */
export function updateComponentProps(
  root: IRComponent,
  componentId: string,
  newProps: Record<string, unknown>
): boolean {
  const component = findComponentById(root, componentId);
  if (!component) return false;

  component.props = { ...component.props, ...newProps };
  return true;
}

/**
 * Gets the depth of a component in the tree
 */
export function getComponentDepth(root: IRComponent, targetId: string): number {
  function searchDepth(component: IRComponent, depth: number): number {
    if (component.id === targetId) {
      return depth;
    }

    // Search children
    if (component.children) {
      for (const child of component.children) {
        const found = searchDepth(child, depth + 1);
        if (found !== -1) return found;
      }
    }

    // Search slots
    if (component.slots) {
      for (const slotComponents of Object.values(component.slots)) {
        for (const slotComponent of slotComponents) {
          const found = searchDepth(slotComponent, depth + 1);
          if (found !== -1) return found;
        }
      }
    }

    return -1;
  }

  return searchDepth(root, 0);
}