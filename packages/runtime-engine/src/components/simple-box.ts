import { BaseBuilderComponent } from './base-component';
import type { BuilderComponentConfig } from '@/types';

/**
 * Simple box component for testing and demonstration
 * Provides a basic rectangular element with customizable content
 */
export class SimpleBoxComponent extends BaseBuilderComponent {
  private content: string;

  constructor(config?: Partial<BuilderComponentConfig & { content?: string }>) {
    super({
      name: 'SimpleBox',
      className: 'builder-simple-box',
      ...config,
    });
    
    this.content = config?.content || 'Simple Box';
  }

  /**
   * Renders the simple box content
   */
  protected render(): void {
    this.innerHTML = `
      <div class="w-32 h-24 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors">
        <span class="text-sm font-medium text-blue-800 select-none">
          ${this.content}
        </span>
      </div>
    `;
  }

  /**
   * Updates the content of the box
   */
  setContent(content: string): void {
    this.content = content;
    this.render();
  }

  /**
   * Gets the current content
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Override serialize to include content
   */
  override serialize(): Record<string, unknown> {
    return {
      ...super.serialize(),
      content: this.content,
    };
  }
}

/**
 * Register the component globally
 */
if (!customElements.get('simple-box')) {
  customElements.define('simple-box', SimpleBoxComponent);
}