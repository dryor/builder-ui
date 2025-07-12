/**
 * Runtime Engine - Visual Builder Foundation
 * 
 * High-performance drag/drop visual builder runtime with TypeScript + Tailwind + Vanilla Web Components
 * 
 * @author Builder UI Team
 * @version 0.1.0
 */

// Import styles
import './styles/globals.css';

// Core types
export * from './types';

// Utility functions  
export * from './utils';

// Base components
export * from './components';

/**
 * Initialize the runtime engine
 * Sets up global event handlers and registers components
 */
export function initializeRuntimeEngine(): void {
  // Add global styles and event handlers here if needed
  console.log('Runtime Engine initialized');
}

/**
 * Version information
 */
export const VERSION = '0.1.0';

/**
 * Runtime engine metadata
 */
export const RUNTIME_ENGINE = {
  name: 'Builder UI Runtime Engine',
  version: VERSION,
  description: 'Visual builder runtime foundation with TypeScript and Web Components',
} as const;