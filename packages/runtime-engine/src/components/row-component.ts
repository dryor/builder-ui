import { BaseBuilderComponent } from './base-component';
import type { BuilderComponentConfig } from '@/types';
import type { IRRowComponent } from '@/types/ir-schema';

interface RowComponentConfig extends BuilderComponentConfig {
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
  children?: HTMLElement[];
}

export class RowComponent extends BaseBuilderComponent {
  private gap: string;
  private alignItems: string;
  private justifyContent: string;
  private childComponents: HTMLElement[] = [];

  constructor(config?: Partial<RowComponentConfig>) {
    super({
      name: 'Row',
      className: 'builder-row',
      ...config,
    });
    
    this.gap = config?.gap || 'md';
    this.alignItems = config?.alignItems || 'start';
    this.justifyContent = config?.justifyContent || 'start';
    this.childComponents = config?.children || [];
  }

  static fromIR(irComponent: IRRowComponent): RowComponent {
    const config: Partial<RowComponentConfig> = {
      id: irComponent.id,
    };
    
    if (irComponent.props?.gap) config.gap = irComponent.props.gap;
    if (irComponent.props?.alignItems) config.alignItems = irComponent.props.alignItems;
    if (irComponent.props?.justifyContent) config.justifyContent = irComponent.props.justifyContent;
    if (irComponent.props?.className) config.className = irComponent.props.className;
    
    return new RowComponent(config);
  }

  addChildComponent(element: HTMLElement): void {
    this.childComponents.push(element);
    this.render();
  }

  removeChildComponent(element: HTMLElement): void {
    const index = this.childComponents.indexOf(element);
    if (index > -1) {
      this.childComponents.splice(index, 1);
      this.render();
    }
  }

  clearChildComponents(): void {
    this.childComponents = [];
    this.render();
  }

  protected render(): void {
    this.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = this.buildContainerClasses();
    
    this.childComponents.forEach(child => {
      container.appendChild(child);
    });

    if (this.childComponents.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'min-h-[40px] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm';
      placeholder.textContent = 'Drop components here';
      container.appendChild(placeholder);
    }

    this.appendChild(container);
  }

  private buildContainerClasses(): string {
    const baseClasses = 'flex flex-row items-start';
    const gapClass = this.getGapClass();
    const alignClass = this.getAlignItemsClass();
    const justifyClass = this.getJustifyContentClass();
    
    return `${baseClasses} ${gapClass} ${alignClass} ${justifyClass}`.trim();
  }

  private getGapClass(): string {
    const gapMap: Record<string, string> = {
      'sm': 'gap-2',
      'md': 'gap-4', 
      'lg': 'gap-6',
      'xl': 'gap-8',
    };
    return gapMap[this.gap] || 'gap-4';
  }

  private getAlignItemsClass(): string {
    const alignMap: Record<string, string> = {
      'start': 'items-start',
      'center': 'items-center',
      'end': 'items-end',
      'stretch': 'items-stretch',
    };
    return alignMap[this.alignItems] || 'items-start';
  }

  private getJustifyContentClass(): string {
    const justifyMap: Record<string, string> = {
      'start': 'justify-start',
      'center': 'justify-center', 
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly',
    };
    return justifyMap[this.justifyContent] || 'justify-start';
  }
}

customElements.define('builder-row', RowComponent);