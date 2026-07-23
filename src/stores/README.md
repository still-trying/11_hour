# State Management Stores (`src/stores`)

## Responsibility

Zustand global client-side single source of truth models.

## Boundary Rules

- **Allowed Imports**: Domain logic adapters, types, local storage controllers, database helpers.
- **Forbidden Imports**: Presentation components, UI controllers, or design tokens.
- **Layer Owner**: State Management Layer.
