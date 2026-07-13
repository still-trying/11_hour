# Domain Business Logic Layer (`src/business/domain`)

## Responsibility
Core domain logical controllers, entities, and validation systems decoupled from specific rendering frameworks.

## Boundary Rules
- **Allowed Imports**: Shared common types (`src/types.ts`), AI output contract schemas (`src/ai/contracts/*`).
- **Forbidden Imports**: UI visual components, presentation page wrappers, styles, or state stores.
- **Layer Owner**: Business Logic Layer.
