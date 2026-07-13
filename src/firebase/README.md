# 11_HOUR — Firebase Infrastructure Layer

Welcome to the **Firebase Platform Infrastructure Layer** for the **11_HOUR** platform (The Last-Minute Life Saver). This layer implements **Micro Slice 0.6 (Firebase Platform Foundation)**, providing a production-ready, highly resilient, and offline-first persistence substrate.

---

## 🏗️ Architectural Core

The infrastructure is designed under a **Zero-Trust** security philosophy, ensuring strict segregation of concerns:
- **No Direct Imports in UI**: Presentation components (`src/features/*`, `src/components/*`) are strictly forbidden from importing from the Firebase Web SDK.
- **Repository Interface Decoupling**: Database interactions must flow through standard interfaces, separating business and data layer schemas.
- **Unified Error-Tracing Protocol**: All database operations log and wrap standard errors into highly detailed, sanitized JSON strings matching the telemetry specifications.

---

## 📂 Folder Layout

```bash
src/firebase/
├── firebase-applet-config.json     # Standard configurations (compiled safely with fallback)
├── types.ts                        # Platform-wide types, Zod configuration schema, and enum definitions
├── constants.ts                    # Emulator configs, limits, storage formats, and log tags
├── configBuilder.ts                # Configuration builder validating parameters via Zod
├── config.ts                       # App singleton, Firestore persistent caching, emulator suite bindings
├── errors.ts                       # Standardized mapping layer converting exceptions to JSON telemetry
├── auth.ts                         # Custom Authentication SDK ingress / gateway
├── firestore.ts                    # Custom Firestore SDK ingress / database gateways
└── gateways/                       # Gateway implementations
    ├── AuthGateway.ts              # Auth Gateway Skeleton
    ├── FirestoreGateway.ts         # Firestore Gateway Skeleton
    └── StorageGateway.ts           # Storage Gateway Skeleton
```

---

## ⚙️ Configuration Flow & Validation

```
[firebase-applet-config.json] ──┐
                                 ├──> [src/firebase/configBuilder.ts] ──> [Zod Validation] ──> [Firebase App Singleton]
[Environment Variables (VITE_)] ─┘
```

1. **Prioritization**: Environment variables (`VITE_FIREBASE_API_KEY`, etc.) override file credentials to support multi-stage CI/CD environments seamlessly.
2. **Safety Net**: Fallback mechanism parses default configurations containing `"mock-api-key"` signatures, booting local developers into a safe sandbox without raising uncaught load-time compile errors.

---

## 📡 Connection & Offline Resilience

- **Multi-Tab Persistence Caching**: Configured using Firestore `persistentLocalCache()` and `persistentMultipleTabManager()`. This ensures 100% database usability during complete offline periods (such as flights or underground transits).
- **Asynchronous Health Probes**: Validates remote connectivity to Cloud Firestore nodes upon bootstrap, outputting rich warnings/hints without crashing the viewport execution thread.

---

## 🔍 Validation Checklist

- [x] Singleton Instance (Avoids duplicate Firebase initializations)
- [x] Zod-Verified Parameters (Ensures configuration parameters comply with strict formats)
- [x] Multi-Tab Local Storage (Supports offline-first crunches)
- [x] Isolated Gateway Skeleton layers (No business logic or UI bindings)
- [x] Complies 100% with Micro Slice 0.6 requirements
