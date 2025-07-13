/**
 * Intermediate Representation (IR) Schema Types
 * Phase 2: Hierarchical component structure with children + slots
 */

/**
 * Base component properties that all components share
 */
export interface IRBaseComponent {
  /** Unique identifier for the component */
  id: string;
  /** Component type (Row, Stack, Button, etc.) */
  type: string;
  /** Component-specific properties */
  props?: Record<string, unknown>;
  /** Default slot - array of child components */
  children?: IRComponent[];
  /** Named slots for complex components */
  slots?: Record<string, IRComponent[]>;
}

/**
 * Union type for all possible IR components
 * Will be extended as we add more component types
 */
export type IRComponent = IRRowComponent | IRStackComponent | IRButtonComponent;

/**
 * Row component - horizontal layout
 */
export interface IRRowComponent extends IRBaseComponent {
  type: 'Row';
  props?: {
    /** Gap between children (e.g., 'sm', 'md', 'lg') */
    gap?: string;
    /** Horizontal alignment of children */
    alignItems?: string;
    /** Vertical alignment of children */
    justifyContent?: string;
    /** Custom CSS classes */
    className?: string;
  };
  /** Children are placed in the main horizontal flow */
  children?: IRComponent[];
}

/**
 * Stack component - vertical layout  
 */
export interface IRStackComponent extends IRBaseComponent {
  type: 'Stack';
  props?: {
    /** Gap between children (e.g., 'sm', 'md', 'lg') */
    gap?: string;
    /** Horizontal alignment of children */
    alignItems?: string;
    /** Vertical alignment of children */
    justifyContent?: string;
    /** Custom CSS classes */
    className?: string;
  };
  /** Children are placed in the main vertical flow */
  children?: IRComponent[];
}

/**
 * Button component - interactive element with content
 */
export interface IRButtonComponent extends IRBaseComponent {
  type: 'Button';
  props?: {
    /** Button variant/style */
    variant?: string;
    /** Button size */
    size?: string;
    /** Whether button is disabled */
    disabled?: boolean;
    /** Click handler reference */
    onClick?: string;
    /** Custom CSS classes */
    className?: string;
    /** Simple text content for buttons (alternative to complex children) */
    children?: string[];
  };
  /** Button content - can contain any components */
  children?: IRComponent[];
  /** Named slots for complex button layouts */
  slots?: {
    /** Icon slot for button icons */
    icon?: IRComponent[];
    /** Content slot (alternative to children) */
    content?: IRComponent[];
  };
}

/**
 * Component type definitions for validation
 */
export interface IRComponentTypeDefinition {
  /** Component type name */
  type: string;
  /** Layout behavior */
  layout?: 'horizontal' | 'vertical' | 'none';
  /** Allowed slots for this component type */
  allowedSlots: string[];
  /** Maximum number of children (null = unlimited) */
  maxChildren?: number | null;
  /** Whether this component can contain other components */
  canHaveChildren: boolean;
  /** Default props for new instances */
  defaultProps?: Record<string, unknown>;
}

/**
 * Schema definition for all component types
 */
export interface IRComponentSchema {
  componentTypes: Record<string, IRComponentTypeDefinition>;
}

/**
 * Complete IR document structure
 */
export interface IRDocument {
  /** Document metadata */
  meta: {
    version: string;
    createdAt: string;
    updatedAt: string;
  };
  /** Component type schema */
  schema: IRComponentSchema;
  /** Root component tree */
  root: IRComponent;
}

/**
 * Validation result for IR operations
 */
export interface IRValidationResult {
  /** Whether the IR is valid */
  isValid: boolean;
  /** Validation errors */
  errors: IRValidationError[];
  /** Validation warnings */
  warnings: IRValidationWarning[];
}

/**
 * Validation error details
 */
export interface IRValidationError {
  /** Component ID where error occurred */
  componentId: string;
  /** Error message */
  message: string;
  /** Error type for categorization */
  type: 'INVALID_TYPE' | 'INVALID_SLOT' | 'INVALID_NESTING' | 'MISSING_REQUIRED_PROP';
  /** Path to the problematic component */
  path: string[];
}

/**
 * Validation warning details
 */
export interface IRValidationWarning {
  /** Component ID where warning occurred */
  componentId: string;
  /** Warning message */
  message: string;
  /** Warning type for categorization */
  type: 'DEPRECATED_PROP' | 'PERFORMANCE_CONCERN' | 'ACCESSIBILITY_ISSUE';
  /** Path to the component */
  path: string[];
}

/**
 * Options for IR operations
 */
export interface IROptions {
  /** Whether to validate on every operation */
  validateOnChange?: boolean;
  /** Whether to generate IDs automatically */
  autoGenerateIds?: boolean;
  /** ID prefix for auto-generated IDs */
  idPrefix?: string;
  /** Whether to preserve component order during operations */
  preserveOrder?: boolean;
}