# Google Gemini Orchestrator Layer (`src/ai`)

## Responsibility

Encapsulates Google Gen AI SDK initializations, template prompt hydrations, schema validators, JSON healing, and fail-safe fallback algorithms.

## Folder Contents

- `/orchestrator/`: Implements prompting, validators, Engines (context, coaching, decomposition), JSON repair, and telemetry.
- `/contracts/`: Holds standard, typed JSON structures required by model prompt templates.
