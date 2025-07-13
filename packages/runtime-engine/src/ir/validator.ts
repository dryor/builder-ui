/**
 * IR Validation System
 * Validates IR structure against component schema
 */

import type { 
  IRComponent, 
  IRValidationResult, 
  IRValidationError, 
  IRValidationWarning 
} from '@/types/ir-schema';
import { ComponentSchemaHelper } from './component-schema';

/**
 * Validates IR components against schema rules
 */
export class IRValidator {
  private errors: IRValidationError[] = [];
  private warnings: IRValidationWarning[] = [];
  private schemaHelper: ComponentSchemaHelper;

  constructor(schemaHelper?: ComponentSchemaHelper) {
    this.schemaHelper = schemaHelper || new ComponentSchemaHelper();
  }

  /**
   * Validates a complete IR component tree
   */
  validate(component: IRComponent, path: string[] = []): IRValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateComponent(component, path);

    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }

  /**
   * Validates a single component and its children recursively
   */
  private validateComponent(component: IRComponent, path: string[]): void {
    const currentPath = [...path, component.id];

    // Validate component type exists
    if (!this.schemaHelper.hasComponentType(component.type)) {
      this.addError(component.id, `Unknown component type: ${component.type}`, 'INVALID_TYPE', currentPath);
      return; // Can't validate further without type definition
    }

    // Validate component structure
    this.validateComponentStructure(component, currentPath);

    // Validate children
    this.validateChildren(component, currentPath);

    // Validate slots
    this.validateSlots(component, currentPath);

    // Validate props
    this.validateProps(component, currentPath);
  }

  /**
   * Validates basic component structure
   */
  private validateComponentStructure(component: IRComponent, path: string[]): void {
    // Validate required fields
    if (!component.id || typeof component.id !== 'string') {
      this.addError('unknown', 'Component must have a valid string ID', 'MISSING_REQUIRED_PROP', path);
    }

    if (!component.type || typeof component.type !== 'string') {
      this.addError((component as any).id || 'unknown', 'Component must have a valid string type', 'MISSING_REQUIRED_PROP', path);
    }

    // Check for duplicate IDs in the same tree level
    // Note: This would need to be enhanced for full tree validation
  }

  /**
   * Validates component children
   */
  private validateChildren(component: IRComponent, path: string[]): void {
    if (!component.children) return;

    // Check if component can have children
    if (!this.schemaHelper.canHaveChildren(component.type)) {
      this.addError(
        component.id, 
        `Component type '${component.type}' cannot have children`, 
        'INVALID_NESTING', 
        path
      );
      return;
    }

    // Check max children limit
    const maxChildren = this.schemaHelper.getMaxChildren(component.type);
    if (maxChildren !== null && component.children.length > maxChildren) {
      this.addError(
        component.id,
        `Component '${component.type}' can have maximum ${maxChildren} children, but has ${component.children.length}`,
        'INVALID_NESTING',
        path
      );
    }

    // Validate each child
    component.children.forEach((child, index) => {
      // Check if this child can be contained in this parent
      if (child.id && !this.schemaHelper.canContain(component.type, child.type)) {
        this.addError(
          child.id,
          `Component '${child.type}' cannot be contained in '${component.type}'`,
          'INVALID_NESTING',
          [...path, `children[${index}]`]
        );
      }

      // Recursively validate child
      this.validateComponent(child, [...path, `children[${index}]`]);
    });
  }

  /**
   * Validates component slots
   */
  private validateSlots(component: IRComponent, path: string[]): void {
    if (!component.slots) return;

    const allowedSlots = this.schemaHelper.getAllowedSlots(component.type);

    // Check each slot
    Object.entries(component.slots).forEach(([slotName, slotComponents]) => {
      const slotPath = [...path, `slots.${slotName}`];

      // Check if slot is allowed
      if (!this.schemaHelper.isSlotAllowed(component.type, slotName)) {
        this.addError(
          component.id,
          `Slot '${slotName}' is not allowed for component type '${component.type}'. Allowed slots: ${allowedSlots.join(', ')}`,
          'INVALID_SLOT',
          slotPath
        );
        return;
      }

      // Validate slot components
      const typedSlotComponents = slotComponents as IRComponent[];
      typedSlotComponents.forEach((slotComponent, index) => {
        // Check if this component can be in this slot
        if (slotComponent.id && !this.schemaHelper.canContain(component.type, slotComponent.type)) {
          this.addError(
            slotComponent.id,
            `Component '${slotComponent.type}' cannot be placed in slot '${slotName}' of '${component.type}'`,
            'INVALID_NESTING',
            [...slotPath, `[${index}]`]
          );
        }

        // Recursively validate slot component
        this.validateComponent(slotComponent, [...slotPath, `[${index}]`]);
      });
    });
  }

  /**
   * Validates component properties
   */
  private validateProps(component: IRComponent, path: string[]): void {
    if (!component.props) return;

    // Get component type definition for prop validation
    const componentType = this.schemaHelper.getComponentType(component.type);
    if (!componentType) return;

    // Add custom prop validation here based on component type
    this.validateTypeSpecificProps(component, path);
  }

  /**
   * Validates type-specific properties
   */
  private validateTypeSpecificProps(component: IRComponent, path: string[]): void {
    switch (component.type) {
      case 'Row':
      case 'Stack':
        this.validateLayoutProps(component, path);
        break;
      case 'Button':
        this.validateButtonProps(component, path);
        break;
    }
  }

  /**
   * Validates Row/Stack layout properties
   */
  private validateLayoutProps(component: IRComponent, path: string[]): void {
    if (component.type !== 'Row' && component.type !== 'Stack') return;
    
    const props = component.props as { gap?: string; alignItems?: string; justifyContent?: string; className?: string; } | undefined;
    if (!props) return;

    // Validate alignItems
    if (props.alignItems && !['start', 'center', 'end', 'stretch'].includes(props.alignItems)) {
      this.addWarning(
        component.id,
        `Invalid alignItems value: ${props.alignItems}. Should be one of: start, center, end, stretch`,
        'DEPRECATED_PROP',
        path
      );
    }

    // Validate justifyContent  
    if (props.justifyContent && !['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(props.justifyContent)) {
      this.addWarning(
        component.id,
        `Invalid justifyContent value: ${props.justifyContent}`,
        'DEPRECATED_PROP',
        path
      );
    }

    // Validate gap - now we accept sm/md/lg tokens
    if (props.gap && typeof props.gap === 'string') {
      if (!['sm', 'md', 'lg'].includes(props.gap)) {
        this.addWarning(
          component.id,
          `Gap value '${props.gap}' should be one of: sm, md, lg`,
          'DEPRECATED_PROP',
          path
        );
      }
    }
  }

  /**
   * Validates Button properties
   */
  private validateButtonProps(component: IRComponent, path: string[]): void {
    if (component.type !== 'Button') return;
    
    const props = component.props as { variant?: string; size?: string; disabled?: boolean; onClick?: string; className?: string; } | undefined;
    if (!props) return;

    // Validate variant - simplified to just check if it's a string
    if (props.variant && typeof props.variant !== 'string') {
      this.addWarning(
        component.id,
        `Invalid button variant: ${props.variant}`,
        'DEPRECATED_PROP',
        path
      );
    }

    // Validate size - simplified to just check if it's a string
    if (props.size && typeof props.size !== 'string') {
      this.addWarning(
        component.id,
        `Invalid button size: ${props.size}`,
        'DEPRECATED_PROP',
        path
      );
    }
  }

  /**
   * Adds a validation error
   */
  private addError(
    componentId: string, 
    message: string, 
    type: IRValidationError['type'], 
    path: string[]
  ): void {
    this.errors.push({
      componentId,
      message,
      type,
      path,
    });
  }

  /**
   * Adds a validation warning
   */
  private addWarning(
    componentId: string, 
    message: string, 
    type: IRValidationWarning['type'], 
    path: string[]
  ): void {
    this.warnings.push({
      componentId,
      message,
      type,
      path,
    });
  }

  /**
   * Quick validation check - returns boolean only
   */
  isValid(component: IRComponent): boolean {
    return this.validate(component).isValid;
  }
}