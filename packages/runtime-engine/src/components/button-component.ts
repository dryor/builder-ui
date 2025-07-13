import { BaseBuilderComponent } from './base-component';
import type { BuilderComponentConfig } from '@/types';
import type { IRButtonComponent } from '@/types/ir-schema';

interface ButtonComponentConfig extends BuilderComponentConfig {
  variant?: string;
  size?: string;
  disabled?: boolean;
  text?: string;
}

export class ButtonComponent extends BaseBuilderComponent {
  private variant: string;
  private size: string;
  private disabled: boolean;
  private text: string;

  constructor(config?: Partial<ButtonComponentConfig>) {
    super({
      name: 'Button',
      className: 'builder-button',
      ...config,
    });
    
    this.variant = config?.variant || 'primary';
    this.size = config?.size || 'md';
    this.disabled = config?.disabled || false;
    this.text = config?.text || 'Button';
  }

  static fromIR(irComponent: IRButtonComponent): ButtonComponent {
    const text = Array.isArray(irComponent.props?.children) 
      ? irComponent.props.children[0] 
      : 'Button';

    const config: Partial<ButtonComponentConfig> = {
      id: irComponent.id,
      text: text as string,
    };

    if (irComponent.props?.variant) config.variant = irComponent.props.variant;
    if (irComponent.props?.size) config.size = irComponent.props.size;
    if (irComponent.props?.disabled !== undefined) config.disabled = irComponent.props.disabled;
    if (irComponent.props?.className) config.className = irComponent.props.className;

    return new ButtonComponent(config);
  }

  updateText(newText: string): void {
    this.text = newText;
    this.render();
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.render();
  }

  protected render(): void {
    this.innerHTML = '';
    
    const button = document.createElement('button');
    button.className = this.buildButtonClasses();
    button.disabled = this.disabled;
    button.textContent = this.text;
    
    this.appendChild(button);
  }

  private buildButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClass = this.getVariantClass();
    const sizeClass = this.getSizeClass();
    const disabledClass = this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${disabledClass}`.trim();
  }

  private getVariantClass(): string {
    const variantMap: Record<string, string> = {
      'primary': 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      'secondary': 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      'outline': 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      'ghost': 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    };
    return variantMap[this.variant] || variantMap['primary'];
  }

  private getSizeClass(): string {
    const sizeMap: Record<string, string> = {
      'sm': 'px-3 py-1.5 text-sm',
      'md': 'px-4 py-2 text-sm',
      'lg': 'px-6 py-3 text-base',
    };
    return sizeMap[this.size] || sizeMap['md'];
  }
}

customElements.define('builder-button', ButtonComponent);