# Builder UI

A high-performance visual builder platform with tool chain separation, built with TypeScript, Tailwind CSS, and modern web technologies.

## 🚀 Project Vision

Builder UI is designed to provide a complete visual development experience through a modular architecture that separates concerns between the visual editor, intermediate representation (IR), and code generation. This approach enables multiple output targets while maintaining a single source of truth.

### Core Philosophy
- **Single IR + Multiple Renderers**: JSON-based intermediate representation that can generate React, Vue, HTML, or any target framework
- **Performance-First**: Target 500-800 components at 60fps with optimized drag/drop interactions
- **Tool Chain Separation**: Visual Editor ↔ IR ↔ Code Generation as independent, composable systems
- **TypeScript-Native**: Complete type safety across the entire platform

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Visual Editor  │───▶│      IR      │───▶│ Code Generation │
│   (Drag/Drop)   │    │    (JSON)    │    │ (React/Vue/etc) │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         ▼                       ▼                    ▼
  Canvas + Selection      Component Tree        Framework Code
```

### Technology Stack
- **Frontend**: TypeScript + Tailwind CSS
- **Components**: Vanilla Web Components
- **Drag/Drop**: Moveable.js (15KB)
- **Testing**: Storybook
- **Build**: Vite + pnpm workspaces
- **Monorepo**: pnpm workspace architecture

## 📦 Project Structure

```
builder-ui/
├── apps/                    # Applications (future)
├── experiments/             # Experimental features
├── packages/               
│   └── runtime-engine/      # Phase 1: Runtime Foundation ✅
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md               # This file
```

## 🗺️ Development Roadmap

### ✅ Phase 1: Runtime Foundation (COMPLETED)
**Goal**: High-performance drag/drop foundation with TypeScript + Tailwind + Web Components

**Deliverables**:
- ✅ TypeScript Web Components architecture
- ✅ Moveable.js integration with type safety
- ✅ Overlay selection system (no DOM pollution)
- ✅ Comprehensive Storybook documentation
- ✅ Zero TypeScript compilation errors
- ✅ Performance-optimized base components

**Tech Stack**: TypeScript, Tailwind CSS, Moveable.js, Vanilla Web Components, Storybook

### 🔄 Phase 2: IR Renderer (IN PROGRESS - Major Advances Made)
**Goal**: IR → DOM transformation with hierarchical component support

**✅ Completed This Session**:
- ✅ **Web Components Architecture**: Created Row, Stack, and Button components extending BaseComponent
- ✅ **VisualBuilder Integration**: Updated to use actual Web Components instead of HTML divs
- ✅ **TypeScript Safety**: Full type safety between IR and component implementations  
- ✅ **Story Organization**: Cleaned and focused Storybook stories for Phase 2
- ✅ **Visual Drag Indicators**: Implemented insertion indicators showing where components will be placed
- ✅ **Build System**: All TypeScript compilation and production builds working

**🚧 Current Drag & Drop UX**:
- **Working**: Basic drag/drop between containers with real IR updates
- **Added**: Visual insertion indicators (blue lines) showing drop position
- **Row containers**: Horizontal blue line following mouse X position  
- **Stack containers**: Vertical blue line following mouse Y position
- **Real-time feedback**: Indicators update as you drag

**IR Schema Structure** (Implemented):
```json
{
  "id": "component-id",
  "type": "Row|Stack|Button", 
  "props": { "gap": "md", "alignItems": "center", "className": "..." },
  "children": [...], // Array of child components
  "slots": { ... }   // Named slots (planned for complex components)
}
```

**Web Components Created**:
```typescript
// All extend BaseComponent with drag/drop capabilities
RowComponent.fromIR(irComponent)    // Horizontal flexbox layout
StackComponent.fromIR(irComponent)  // Vertical flexbox layout  
ButtonComponent.fromIR(irComponent) // Interactive button element
```

**📂 Current Storybook Structure**:
```
Phase 2/
├── Drag Drop          # Working drag/drop with visual indicators
├── IR Renderer        # Core IR → DOM transformation
├── Web Components     # New layout components showcase
└── Debug/             # Development testing stories
```

**🎯 Next Session Priorities**:
- Improve insertion indicators with precise positioning between elements
- Add ghost preview showing component size/appearance during drag
- Implement threshold-based drag extraction for nested layouts
- Performance optimization for complex drag operations

### 🔮 Phase 3: Visual Editor (PLANNED)
**Goal**: Canvas + selection with hierarchical drag/drop UX

**Nested Movement Features**:
- **Threshold-based extraction**: Drag within parent bounds = reorder, drag outside = extract to canvas
- **Visual drop zones**: Highlight valid drop targets (Row/Stack slots)
- **Insertion indicators**: Show where component will be placed in layout
- **Container selection**: Click-through selection for nested components
- **Layout constraints**: Respect Row/Stack layout rules during drag

**Planned Features**:
- Interactive canvas with zoom/pan
- Hierarchical component tree navigation
- Advanced selection (multi-select, nested selection)
- Component palette with Row/Stack/Button components
- Property panel for component configuration (gap, alignment)
- Visual feedback for slot-based dropping
- Undo/redo system with nested operations

### 🔮 Phase 4: IR Manager (PLANNED)
**Goal**: State management with TypeScript interfaces

**Planned Features**:
- Centralized IR state management
- Change tracking and history
- Validation and schema enforcement
- Import/export functionality
- Real-time collaboration foundation

### 🔮 Phase 5: Component Catalog (PLANNED)
**Goal**: Rich component library with slot-based architecture

**Core Layout Components**:
- **Row**: Horizontal layout with gap/alignment (`children` slot)
- **Stack**: Vertical layout with gap/alignment (`children` slot)  
- **Container**: Wrapper with padding/margins (`children` slot)

**UI Components with Slots**:
- **Button**: Text content (`children` slot) + optional icon (`icon` slot)
- **Card**: Header (`header` slot) + content (`children` slot) + footer (`footer` slot)
- **Modal**: Header (`header` slot) + body (`children` slot) + actions (`actions` slot)

**Content Components**:
- **Text**: Configurable typography (`children` slot for inline content)
- **Image**: Media display with caption (`caption` slot)
- **Input**: Form field with label (`label` slot) + validation (`error` slot)

**Advanced Slot-based Components**:
- **Tabs**: Multiple content areas (dynamic `tab-{id}` slots)
- **Accordion**: Collapsible sections (dynamic `section-{id}` slots)
- **Form**: Field layout (`fields` slot) + actions (`actions` slot)

### 🔮 Phase 6: Code Generation (PLANNED)
**Goal**: IR → Framework code generation with slot preservation

**Code Generation Targets**:
- **React + TypeScript**: Convert `children`/`slots` to React props and JSX
- **Vue 3 + TypeScript**: Map `slots` to Vue named slots and composition API
- **Web Components**: Native custom elements with slot-based architecture
- **Static HTML + CSS**: Flatten slots to semantic HTML with Tailwind classes

**Slot-to-Code Mapping**:
```typescript
// IR with slots
{ "type": "Card", "slots": { "header": [...], "children": [...] } }

// React output
<Card header={<...headerComponents>}>
  {...childrenComponents}
</Card>

// Vue output  
<Card>
  <template #header>...headerComponents</template>
  <template #default>...childrenComponents</template>
</Card>
```

**Optimization Features**:
- Tailwind CSS purging based on generated components
- Bundle splitting by component hierarchy
- Slot-based code splitting for dynamic content

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.19+ or 22.12+
- pnpm (recommended package manager)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd builder-ui
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development (Runtime Engine)**
   ```bash
   cd packages/runtime-engine
   pnpm dev          # Start Vite dev server
   pnpm storybook    # Start Storybook on port 6006
   ```

4. **Build and test**
   ```bash
   pnpm build        # Build for production
   pnpm type-check   # TypeScript validation
   ```

### Available Commands (Runtime Engine)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Build package for production |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build Storybook for deployment |
| `pnpm type-check` | Run TypeScript type checking |

## 📊 Current Development Status

**✅ Working Features**:
- TypeScript Web Components (Row, Stack, Button)
- IR → DOM transformation with VisualBuilder
- Basic drag/drop with visual insertion indicators
- Storybook stories for development/testing
- Complete build pipeline (TypeScript + Vite)

**🔧 Key Files to Continue Development**:
```
packages/runtime-engine/src/
├── components/
│   ├── VisualBuilder.ts          # Main integration component  
│   ├── SimpleDragDemo.ts         # Working drag/drop implementation
│   ├── row-component.ts          # Row layout Web Component
│   ├── stack-component.ts        # Stack layout Web Component
│   └── button-component.ts       # Button Web Component
├── stories/
│   ├── DragDrop.stories.ts       # Working drag/drop demos
│   ├── WebComponents.stories.ts  # Layout component examples
│   └── DebugDragDrop.stories.ts  # Development testing
└── ir/
    ├── renderer.ts               # Core IR → DOM transformation
    └── utils.ts                  # IR manipulation utilities
```

**🎯 Technical Debt & Improvements Needed**:
- Insertion indicators need precise element-based positioning
- Performance optimization for drag operations
- Ghost preview implementation (showing component appearance)
- Better error handling and validation feedback

## 🎯 Performance Targets

- **Component Capacity**: 500-800 components at 60fps
- **Drag Latency**: <16ms response time
- **Bundle Size**: <100KB gzipped for runtime engine
- **Memory Usage**: <50MB for 500 components
- **Startup Time**: <2s to interactive

## 🧪 Testing Strategy

- **Visual Testing**: Storybook for component development and visual regression
- **Unit Testing**: Jest + Testing Library (planned)
- **Integration Testing**: Playwright for end-to-end scenarios (planned)
- **Performance Testing**: Built-in performance monitoring

## 🤝 Contributing

This project follows a structured development approach with clear phases. Current focus is on Phase 2: IR Renderer.

### Development Principles
- **TypeScript-first**: All code must be fully typed
- **Performance-conscious**: Every feature must meet performance targets
- **Documentation-driven**: Storybook stories for all components
- **Modular architecture**: Each phase builds on previous foundations

### Code Standards
- Strict TypeScript configuration
- Tailwind CSS for all styling
- Web Components for reusable UI elements
- Comprehensive JSDoc comments for public APIs

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: Storybook at `localhost:6006`
- **Development**: Vite dev server at `localhost:5173`
- **Repository**: [GitHub Repository URL]

---

*Built with ❤️ using TypeScript, Tailwind CSS, and modern web technologies*