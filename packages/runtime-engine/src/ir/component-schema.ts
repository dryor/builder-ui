/**
 * Component Schema Definitions
 * Defines what slots and properties each component type supports
 */

import type { IRComponentSchema, IRComponentTypeDefinition } from '@/types/ir-schema';

/**
 * Default component type definitions
 */
export const DEFAULT_COMPONENT_TYPES: Record<string, IRComponentTypeDefinition> = {
  Row: {
    type: 'Row',
    layout: 'horizontal',
    allowedSlots: ['main'], // children go to main slot
    maxChildren: null, // unlimited children
    canHaveChildren: true,
    defaultProps: {
      gap: 'md',
      alignItems: 'center',
      justifyContent: 'start',
    },
  },

  Stack: {
    type: 'Stack', 
    layout: 'vertical',
    allowedSlots: ['main'], // children go to main slot
    maxChildren: null, // unlimited children
    canHaveChildren: true,
    defaultProps: {
      gap: 'md',
      alignItems: 'start',
      justifyContent: 'start',
    },
  },

  Button: {
    type: 'Button',
    layout: 'none',
    allowedSlots: ['main', 'icon', 'content'], // children, icon, and content slots
    maxChildren: null, // buttons can contain any components
    canHaveChildren: true,
    defaultProps: {
      variant: 'primary',
      size: 'md',
      disabled: false,
    },
  },
};

/**
 * Create the complete component schema
 */
export const DEFAULT_IR_SCHEMA: IRComponentSchema = {
  componentTypes: DEFAULT_COMPONENT_TYPES,
};

/**
 * Helper functions for component schema operations
 */
export class ComponentSchemaHelper {
  constructor(private schema: IRComponentSchema = DEFAULT_IR_SCHEMA) {}

  /**
   * Gets the type definition for a component
   */
  getComponentType(type: string): IRComponentTypeDefinition | null {
    return this.schema.componentTypes[type] || null;
  }

  /**
   * Checks if a component type exists
   */
  hasComponentType(type: string): boolean {
    return type in this.schema.componentTypes;
  }

  /**
   * Checks if a component can have children
   */
  canHaveChildren(type: string): boolean {
    const componentType = this.getComponentType(type);
    return componentType?.canHaveChildren ?? false;
  }

  /**
   * Gets allowed slots for a component type
   */
  getAllowedSlots(type: string): string[] {
    const componentType = this.getComponentType(type);
    return componentType?.allowedSlots ?? [];
  }

  /**
   * Checks if a slot is allowed for a component type
   */
  isSlotAllowed(type: string, slotName: string): boolean {
    const allowedSlots = this.getAllowedSlots(type);
    return allowedSlots.includes(slotName) || allowedSlots.includes('main');
  }

  /**
   * Gets the maximum number of children for a component type
   */
  getMaxChildren(type: string): number | null {
    const componentType = this.getComponentType(type);
    return componentType?.maxChildren ?? null;
  }

  /**
   * Gets default props for a component type
   */
  getDefaultProps(type: string): Record<string, unknown> {
    const componentType = this.getComponentType(type);
    return componentType?.defaultProps ? { ...componentType.defaultProps } : {};
  }

  /**
   * Gets the layout type for a component
   */
  getLayout(type: string): 'horizontal' | 'vertical' | 'none' | undefined {
    const componentType = this.getComponentType(type);
    return componentType?.layout;
  }

  /**
   * Validates if a component can be placed inside another component
   */
  canContain(parentType: string, childType: string): boolean {
    const parentDef = this.getComponentType(parentType);
    const childDef = this.getComponentType(childType);

    if (!parentDef || !childDef) {
      return false;
    }

    // Check if parent can have children
    if (!parentDef.canHaveChildren) {
      return false;
    }

    // Check max children limit
    if (parentDef.maxChildren !== null && parentDef.maxChildren !== undefined && parentDef.maxChildren <= 0) {
      return false;
    }

    // Additional custom rules can be added here
    // For example: Buttons cannot contain Rows/Stacks
    if (parentType === 'Button' && (childType === 'Row' || childType === 'Stack')) {
      return false;
    }

    return true;
  }

  /**
   * Gets all available component types
   */
  getAllComponentTypes(): string[] {
    return Object.keys(this.schema.componentTypes);
  }

  /**
   * Gets all container component types (can have children)
   */
  getContainerTypes(): string[] {
    return this.getAllComponentTypes().filter(type => this.canHaveChildren(type));
  }

  /**
   * Gets all leaf component types (cannot have children)
   */
  getLeafTypes(): string[] {
    return this.getAllComponentTypes().filter(type => !this.canHaveChildren(type));
  }

  /**
   * Adds a new component type to the schema
   */
  addComponentType(definition: IRComponentTypeDefinition): void {
    this.schema.componentTypes[definition.type] = definition;
  }

  /**
   * Removes a component type from the schema
   */
  removeComponentType(type: string): boolean {
    if (type in this.schema.componentTypes) {
      delete this.schema.componentTypes[type];
      return true;
    }
    return false;
  }

  /**
   * Creates a new schema with updated component types
   */
  withComponentTypes(types: Record<string, IRComponentTypeDefinition>): ComponentSchemaHelper {
    const newSchema: IRComponentSchema = {
      componentTypes: { ...this.schema.componentTypes, ...types },
    };
    return new ComponentSchemaHelper(newSchema);
  }
}