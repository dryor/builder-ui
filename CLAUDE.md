# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo project** called `builder-ui` - a high-performance visual builder platform with tool chain separation. Built with TypeScript, Tailwind CSS, and modern web technologies.

### Core Architecture Philosophy
- **Single IR + Multiple Renderers**: JSON-based intermediate representation that can generate React, Vue, HTML, or any target framework
- **Performance-First**: Target 500-800 components at 60fps with optimized drag/drop interactions  
- **Tool Chain Separation**: Visual Editor ↔ IR ↔ Code Generation as independent, composable systems
- **TypeScript-Native**: Complete type safety across the entire platform

## Architecture

### Current Implementation Status
- **Phase 1 (COMPLETED)**: Runtime Foundation - TypeScript Web Components with Moveable.js drag/drop
- **Phase 2 (IN PROGRESS)**: IR Renderer - JSON schema to DOM transformation with hierarchical components
- **Phase 3-6 (PLANNED)**: Visual Editor, IR Manager, Component Catalog, Code Generation

### Monorepo Structure
- `packages/runtime-engine/` - Core runtime foundation with drag/drop, IR system, and Web Components
- `apps/` - Applications (empty, planned for future)
- `experiments/` - Experimental features (empty)

### Key Technologies
- **Frontend**: TypeScript + Tailwind CSS + Vanilla Web Components
- **Drag/Drop**: Moveable.js (15KB lightweight solution)
- **Build**: Vite + pnpm workspaces
- **Testing**: Vitest + Storybook for visual testing
- **Package Manager**: pnpm (required for workspace support)

### IR (Intermediate Representation) System
The project implements a sophisticated IR system for component representation:

```typescript
// Core IR structure with children + slots support
interface IRComponent {
  id: string;
  type: 'Row' | 'Stack' | 'Button';
  props?: Record<string, unknown>;
  children?: IRComponent[];     // Default slot
  slots?: Record<string, IRComponent[]>; // Named slots
}
```

**Component Types**:
- **Row**: Horizontal layout container (`children` slot)
- **Stack**: Vertical layout container (`children` slot)  
- **Button**: Interactive element (`children` + optional `icon`/`content` slots)

**Key Features**:
- Schema-driven component validation
- Hierarchical nesting with slot-based architecture
- Threshold-based drag extraction algorithm
- TypeScript-first design with complete type safety

## Development Commands

### Runtime Engine Package (Primary Development)
Navigate to `packages/runtime-engine/` and use:

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start Vite development server (localhost:5173) |
| `pnpm build` | Build package for production |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:ui` | Run Vitest with UI |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build Storybook for deployment |

### Root Level Commands
The root package.json currently has minimal scripts. Most development happens in the runtime-engine package.

### Testing Strategy
- **Visual Testing**: Storybook for component development and visual regression
- **Unit Testing**: Vitest with jsdom for DOM testing
- **Type Safety**: Strict TypeScript configuration with `tsc --noEmit`

## Code Architecture Guidelines

### File Organization
```
packages/runtime-engine/src/
├── components/          # Web Components (base-component, selection-overlay, etc.)
├── ir/                 # IR system (schema, renderer, validator, utils)
├── types/              # TypeScript type definitions
├── utils/              # Shared utilities (DOM, events, selection)
├── stories/            # Storybook stories for testing
└── tests/              # Unit tests
```

### Component Development Patterns
- All components extend `BaseComponent` with lifecycle management
- Use Web Components standard with TypeScript decorators
- Implement Tailwind CSS for styling (configured in `tailwind.config.js`)
- Follow strict TypeScript patterns with comprehensive JSDoc comments

### IR Development Patterns
- All IR operations go through validation layer
- Use typed interfaces for all component definitions
- Implement schema-driven slot validation
- Maintain immutability where possible for better performance

### Performance Requirements
- **Component Capacity**: 500-800 components at 60fps
- **Drag Latency**: <16ms response time  
- **Bundle Size**: <100KB gzipped for runtime engine
- **Memory Usage**: <50MB for 500 components

## Software Design Principles

**Always follow "A Philosophy of Software Design" principles:**

### Deep Modules
- **Simple interfaces hiding complex implementation**
- Example: `RowComponent.fromIR(irComponent)` - simple interface, complex layout logic hidden
- Avoid shallow modules that expose complexity

### Comments and Documentation
- **Comments explain WHY, not WHAT**
- Focus on non-obvious design decisions and architectural choices
- Example: `// Use threshold-based extraction to prevent accidental moves between containers`
- Avoid comments that repeat the code

### Naming and Clarity
- **Choose names that eliminate need for comments**
- `addChildComponent()` instead of `add()` 
- `calculateInsertionIndex()` instead of `getIndex()`
- `showSimpleInsertionIndicator()` instead of `showIndicator()`

### Design Approach
- **Design interfaces before implementation**
- **Eliminate complexity at source, don't hide it**
- **Make errors immediately obvious**
- **Consistency in design and naming across the codebase**

### Code Organization
- **Deep modules**: Simple interfaces, complex implementation hidden
- **Consistent patterns**: All components follow same IR → Web Component pattern
- **Clear separation**: IR system, rendering, and interaction as separate concerns

## Development Workflow

1. **Start Development**: Run `cd packages/runtime-engine && pnpm dev` for Vite dev server
2. **Visual Development**: Use `pnpm storybook` for component development and testing
3. **Type Checking**: Always run `pnpm type-check` before commits
4. **Testing**: Use `pnpm test` for unit tests, especially when working with IR system
5. **Build Validation**: Run `pnpm build` to ensure production builds work

**Code Quality Standards:**
- Follow "Philosophy of Software Design" principles above
- Prefer deep modules with simple interfaces
- Write WHY comments, not WHAT comments
- Choose self-documenting names
- Design for consistency and clarity
