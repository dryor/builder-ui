/**
 * IR to DOM Transformation Engine
 * Converts IR components to actual DOM elements/Web Components
 */

import type { IRComponent } from '@/types/ir-schema';
import { ComponentSchemaHelper } from './component-schema';
import { IRValidator } from './validator';

/**
 * Renderer options for IR to DOM transformation
 */
export interface IRRendererOptions {
  /** Whether to validate IR before rendering */
  validate?: boolean;
  /** Container element for rendered components */
  container?: HTMLElement;
  /** Whether to auto-register custom elements */
  autoRegister?: boolean;
  /** CSS class prefix for generated elements */
  classPrefix?: string;
}

/**
 * Result of rendering operation
 */
export interface IRRenderResult {
  /** The rendered DOM element */
  element: HTMLElement;
  /** Component instances created during rendering */
  components: Map<string, HTMLElement>;
  /** Any errors that occurred during rendering */
  errors: string[];
}

/**
 * IR to DOM renderer
 */
export class IRRenderer {
  private schemaHelper: ComponentSchemaHelper;
  private validator: IRValidator;
  private componentInstances = new Map<string, HTMLElement>();
  private errors: string[] = [];

  constructor(
    schemaHelper?: ComponentSchemaHelper,
    private options: IRRendererOptions = {}
  ) {
    this.schemaHelper = schemaHelper || new ComponentSchemaHelper();
    this.validator = new IRValidator(this.schemaHelper);
    
    // Set default options
    this.options = {
      validate: true,
      autoRegister: true,
      classPrefix: 'builder-',
      ...this.options,
    };
  }

  /**
   * Renders an IR component tree to DOM
   */
  render(component: IRComponent): HTMLElement {
    this.componentInstances.clear();
    this.errors = [];

    // Validate IR if requested
    if (this.options.validate) {
      const validationResult = this.validator.validate(component);
      if (!validationResult.isValid) {
        this.errors.push(...validationResult.errors.map(e => e.message));
        // Continue rendering even with validation errors for better debugging
      }
    }

    try {
      return this.renderComponent(component);
    } catch (error) {
      this.errors.push(`Rendering failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return error element
      return this.createErrorElement(component.id, this.errors);
    }
  }

  /**
   * Renders an IR component tree to DOM with full result details
   */
  renderWithResult(component: IRComponent): IRRenderResult {
    const element = this.render(component);
    
    return {
      element,
      components: new Map(this.componentInstances),
      errors: [...this.errors],
    };
  }

  /**
   * Renders a single IR component to a DOM element
   */
  private renderComponent(component: IRComponent): HTMLElement {
    let element: HTMLElement;

    // Create the appropriate element based on component type
    switch (component.type) {
      case 'Row':
        element = this.renderRowComponent(component);
        break;
      case 'Stack':
        element = this.renderStackComponent(component);
        break;
      case 'Button':
        element = this.renderButtonComponent(component);
        break;
      default:
        // Unknown component type - create a generic container
        element = this.renderUnknownComponent(component);
    }

    // Set common attributes
    this.setCommonAttributes(element, component);

    // Render children into the element
    this.renderChildren(element, component);

    // Render slots into the element
    this.renderSlots(element, component);

    // Track component instance
    this.componentInstances.set(component.id, element);

    return element;
  }

  /**
   * Renders a Row component (horizontal layout)
   */
  private renderRowComponent(component: IRComponent): HTMLElement {
    const element = document.createElement('div');
    const props = component.props || {};
    
    // Add base classes
    element.className = `${this.options.classPrefix}row flex flex-row`;
    
    // Type assertion for Row component props
    const rowProps = props as { gap?: string; alignItems?: string; justifyContent?: string; className?: string; };
    
    // Apply gap using Tailwind classes
    const gap = rowProps.gap || 'md';
    const gapClassMap: Record<string, string> = {
      sm: 'gap-2',   // 8px
      md: 'gap-4',   // 16px  
      lg: 'gap-6',   // 24px
    };
    element.classList.add(gapClassMap[gap] || 'gap-4');
    
    // Apply alignment using Tailwind classes
    const alignItems = rowProps.alignItems || 'center';
    const justifyContent = rowProps.justifyContent || 'start';
    
    // Map IR alignment values to CSS classes
    const alignItemsMap: Record<string, string> = {
      start: 'items-start',
      center: 'items-center', 
      end: 'items-end',
      stretch: 'items-stretch',
    };
    
    const justifyContentMap: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly',
    };
    
    element.classList.add(
      alignItemsMap[alignItems] || 'items-center',
      justifyContentMap[justifyContent] || 'justify-start'
    );
    
    // Add custom classes
    if (rowProps.className) {
      element.classList.add(...rowProps.className.split(' '));
    }

    return element;
  }

  /**
   * Renders a Stack component (vertical layout)
   */
  private renderStackComponent(component: IRComponent): HTMLElement {
    const element = document.createElement('div');
    const props = component.props || {};
    
    // Add base classes
    element.className = `${this.options.classPrefix}stack flex flex-col`;
    
    // Type assertion for Stack component props
    const stackProps = props as { gap?: string; alignItems?: string; justifyContent?: string; className?: string; };
    
    // Apply gap using Tailwind classes
    const gap = stackProps.gap || 'md';
    const gapClassMap: Record<string, string> = {
      sm: 'gap-2',   // 8px
      md: 'gap-4',   // 16px  
      lg: 'gap-6',   // 24px
    };
    element.classList.add(gapClassMap[gap] || 'gap-4');
    
    // Apply alignment using Tailwind classes
    const alignItems = stackProps.alignItems || 'start';
    const justifyContent = stackProps.justifyContent || 'start';
    
    // Map IR alignment values to CSS classes (note: different mapping for flex-col)
    const alignItemsMap: Record<string, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end', 
      stretch: 'items-stretch',
    };
    
    const justifyContentMap: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly',
    };
    
    element.classList.add(
      alignItemsMap[alignItems] || 'items-start',
      justifyContentMap[justifyContent] || 'justify-start'
    );
    
    // Add custom classes
    if (stackProps.className) {
      element.classList.add(...stackProps.className.split(' '));
    }

    return element;
  }

  /**
   * Renders a Button component
   */
  private renderButtonComponent(component: IRComponent): HTMLElement {
    const element = document.createElement('button');
    const props = component.props || {};
    
    // Add base classes
    element.className = `${this.options.classPrefix}button`;
    
    // Type assertion for Button component props
    const buttonProps = props as { variant?: string; size?: string; disabled?: boolean; onClick?: string; className?: string; children?: string[]; };
    
    // Apply variant styling - use simple defaults, component handles the mapping
    const variant = buttonProps.variant || 'primary';
    const variantClasses: Record<string, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    };
    
    element.classList.add(...(variantClasses[variant] || variantClasses['primary']).split(' '));
    
    // Apply size styling - simple sm/md defaults
    const size = buttonProps.size || 'md';
    const sizeClasses: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
    };
    
    element.classList.add(...(sizeClasses[size] || sizeClasses['md']).split(' '));
    
    // Add common button classes
    element.classList.add('rounded', 'font-medium', 'transition-colors', 'duration-200');
    
    // Apply disabled state
    if (buttonProps.disabled) {
      element.disabled = true;
      element.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // Add custom classes
    if (buttonProps.className) {
      element.classList.add(...buttonProps.className.split(' '));
    }

    // Handle button text content from props.children or component.children
    if (buttonProps.children && Array.isArray(buttonProps.children)) {
      element.textContent = buttonProps.children.join(' ');
    } else if (component.children && component.children.length > 0) {
      // Handle text from component children (for simple text content)
      const textContent = component.children.filter(child => typeof child === 'string').join(' ');
      if (textContent) {
        element.textContent = textContent;
      }
    }

    return element;
  }

  /**
   * Renders an unknown component type as a generic container
   */
  private renderUnknownComponent(component: IRComponent): HTMLElement {
    const element = document.createElement('div');
    element.className = `${this.options.classPrefix}unknown bg-red-100 border border-red-300 p-2 rounded`;
    
    // Add error indicator
    const errorText = document.createElement('span');
    errorText.textContent = `Unknown component: ${component.type}`;
    errorText.className = 'text-red-600 text-sm font-medium';
    element.appendChild(errorText);
    
    this.errors.push(`Unknown component type: ${component.type}`);
    
    return element;
  }

  /**
   * Sets common attributes on a rendered element
   */
  private setCommonAttributes(element: HTMLElement, component: IRComponent): void {
    // Set data attributes for identification
    element.setAttribute('data-ir-component', component.id);
    element.setAttribute('data-ir-type', component.type);
    element.setAttribute('data-testid', component.id);
    
    // Add builder-selectable class for interaction
    element.classList.add('builder-selectable');
  }

  /**
   * Renders children into the parent element
   */
  private renderChildren(parent: HTMLElement, component: IRComponent): void {
    if (!component.children || component.children.length === 0) return;

    // For components that use explicit slot rendering, skip children here
    if (component.slots && Object.keys(component.slots).length > 0) {
      return;
    }

    component.children.forEach(child => {
      const childElement = this.renderComponent(child);
      parent.appendChild(childElement);
    });
  }

  /**
   * Renders slots into the parent element
   */
  private renderSlots(parent: HTMLElement, component: IRComponent): void {
    if (!component.slots) return;

    Object.entries(component.slots).forEach(([slotName, slotComponents]) => {
      // Create slot container if needed
      let slotContainer: HTMLElement;
      
      if (slotName === 'main' || slotName === 'content') {
        // Main/content slots render directly into parent
        slotContainer = parent;
      } else {
        // Named slots get their own container
        slotContainer = document.createElement('div');
        slotContainer.className = `${this.options.classPrefix}slot ${this.options.classPrefix}slot-${slotName}`;
        slotContainer.setAttribute('data-slot', slotName);
        parent.appendChild(slotContainer);
      }

      // Render slot components
      slotComponents.forEach(slotComponent => {
        const slotElement = this.renderComponent(slotComponent);
        slotContainer.appendChild(slotElement);
      });
    });
  }

  /**
   * Creates an error element for rendering failures
   */
  private createErrorElement(componentId: string, errors: string[]): HTMLElement {
    const element = document.createElement('div');
    element.className = `${this.options.classPrefix}error bg-red-50 border border-red-200 p-4 rounded-lg`;
    element.setAttribute('data-ir-component', componentId);
    
    const title = document.createElement('h3');
    title.textContent = 'Rendering Error';
    title.className = 'text-red-800 font-medium mb-2';
    element.appendChild(title);
    
    const errorList = document.createElement('ul');
    errorList.className = 'text-red-600 text-sm space-y-1';
    
    errors.forEach(error => {
      const errorItem = document.createElement('li');
      errorItem.textContent = error;
      errorItem.className = 'list-disc list-inside';
      errorList.appendChild(errorItem);
    });
    
    element.appendChild(errorList);
    
    return element;
  }

  /**
   * Updates an existing rendered element with new IR data
   */
  updateComponent(element: HTMLElement, component: IRComponent): void {
    // For now, re-render the entire component
    // TODO: Implement more efficient updates
    const newElement = this.renderComponent(component);
    
    if (element.parentNode) {
      element.parentNode.replaceChild(newElement, element);
    }
  }

  /**
   * Gets the component instance by ID
   */
  getComponentById(id: string): HTMLElement | undefined {
    return this.componentInstances.get(id);
  }

  /**
   * Gets all component instances
   */
  getAllComponents(): Map<string, HTMLElement> {
    return new Map(this.componentInstances);
  }
}