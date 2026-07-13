# Navigation & Router Layer (`src/routes`)

## Responsibility
App routing structures, layouts, and route guards that secure application flows.

## Boundary Rules
- **Allowed Imports**: Presentation layout structures, target page views, authentication hooks (`src/hooks/useAuth`), and state selectors.
- **Forbidden Imports**: Direct backend api clients, database modules.
- **Layer Owner**: Presentation Layer.
