/**
 * IR (Intermediate Representation) Module
 * Phase 2: Hierarchical component system with children + slots
 */

// Core types
export * from '../types/ir-schema';

// Component schema and validation
export * from './component-schema';
export * from './validator';

// Rendering engine
export * from './renderer';

// Utility functions (excluding generateComponentId to avoid conflicts)
export {
  createIRComponent,
  createIRDocument,
  cloneIRComponent,
  findComponentById,
  findParentComponent,
  getComponentPath,
  addChildComponent,
  addSlotComponent,
  removeComponent,
  moveComponent,
  getAllComponentIds,
  validateUniqueIds,
  updateComponentProps,
  getComponentDepth
} from './utils';

// Re-export with alias to avoid conflicts
export { generateComponentId as generateIRComponentId } from './utils';