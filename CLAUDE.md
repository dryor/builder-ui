# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo project** called `builder-ui` using **pnpm workspaces**. The project is currently in its initial setup phase with a foundational structure but minimal implementation.

## Architecture

### Monorepo Structure
- `apps/` - Applications (currently empty)
- `experiments/` - Experimental code (currently empty) 
- `packages/` - Shared packages/libraries (currently empty)

### Package Management
- **Package Manager**: pnpm (required)
- **Workspace Configuration**: Defined in `pnpm-workspace.yaml`
- **Lock File**: pnpm-lock.yaml (version 9.0)

## Development Commands

### Runtime Engine Package Commands
Navigate to `packages/runtime-engine/` to use:
- `pnpm install` - Install dependencies
- `pnpm dev` - Start Vite development server
- `pnpm build` - Build package for production
- `pnpm storybook` - Start Storybook on port 6006
- `pnpm build-storybook` - Build Storybook for deployment

### Root Commands (Not Yet Implemented)
Future monorepo commands:
- `pnpm -r build` - Build all packages
- `pnpm -r test` - Run tests across all packages
- `pnpm -r lint` - Run linting across all packages
