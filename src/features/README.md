# Feature Modules Layer (`src/features`)

## Overview

To prevent the codebase from degenerating into spaghetti under construction pressure, all core domains are encapsulated in feature-first modules under `src/features/`.

## Feature List

1. **Dashboard** (`src/features/dashboard`)
   - Renders the primary landing hub, showing historical metrics and active/completed rescue tasks.
2. **Rescue** (`src/features/rescue`)
   - Orchestrates high-focus countdowns, live timeline step edits, and contextual coaching advice.
3. **Reflection** (`src/features/reflection`)
   - Celebrates completion, displays analytical success charts, and handles exporter layouts.

## Boundary Rules

- **Allowed Imports**: Shared UI components (`src/components/*`), global hooks, and global state stores.
- **Forbidden Imports**: Features must never import from other feature folders. Feature boundary lines are completely absolute.
- **Layer Owner**: Business Module Layer.
