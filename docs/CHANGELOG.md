# Changelog

All notable changes to the ORBIS codebase during the PRD execution plan will be documented in this file.

## [Unreleased] - PRD Execution

### Step 9: Final Wiring & UI Integration (Module 8)
- **Frontend:** Updated `src/App.tsx` and `src/components/Header.tsx` to properly route and link to all the newly scaffolded feature pages (`catalog`, `pathways`, `content-studio`, `assistant`, `dashboard-learner`, `virtual-lab`, `edge`).
- **Frontend:** Updated `src/pages/SelectProfile.tsx` to redirect the user to `/dashboard-learner` (the Analytics page) after login, replacing the legacy `educarnival` dashboard route.
- **Cleanup:** Confirmed that all models and logic are cleanly integrated and that 25/25 tests across the monolith pass successfully.

### Step 8: Edge Deployment & Sync (Module 7)
- **Added (Backend):** `DeviceSyncState` and `SyncLog` models in `edge/models.py`.
- **Added (Backend):** API endpoint `/edge/devices/sync_push/` to accept offline differential payloads and simulate conflict resolution.
- **Added (Frontend):** `src/features/edge/pages/Index.tsx` featuring an offline/online network detector, a mock local payload queue, and a fleet management table.
- **Tested:** Sync payloads and state updates tested in `edge/tests.py`. Frontend builds cleanly.

### Step 7: Virtual AI Lab / Scenario Mode (Module 6)
- **Added (Backend):** `Scenario` and `ScenarioAttempt` models to track user interactive role-play attempts.
- **Added (Backend):** `SimulatorService` utilizing `LLMService.chat` for conversational turns and `LLMService.generate_json` for final structured evaluation.
- **Added (Backend):** API endpoints (`/virtual_lab/attempts/`) to manage turns, track score, and automatically log proficiency changes to `AssessmentRecord`.
- **Added (Frontend):** `src/features/virtual-lab/pages/Index.tsx` providing a multi-turn chat UI with interactive grading.
- **Tested:** Mocked LLM interactions in `virtual_lab/tests.py`. Resolved constraint issues with read-only nested serializers. Frontend builds cleanly.

### Step 6: Diagnostic Engine / Analytics (Module 5)
- **Added (Backend):** `CompetencyScore` and `AssessmentRecord` models to track user mastery over time.
- **Added (Backend):** `DiagnosticService` calculating role-based target levels vs current proficiency to feed a Radar chart.
- **Added (Backend):** API endpoints (`/analytics/me/radar/`, `/analytics/me/activity_heatmap/`, etc.) for dashboard telemetry.
- **Added (Frontend):** `src/features/analytics/pages/Dashboard.tsx` featuring a role readiness score, assessment activity heatmap, and a competency gap analysis UI.
- **Tested:** Backend models and logic via `analytics/tests.py`. Frontend builds cleanly.

### Step 5: ORBIS AI Assistant & RAG (Module 4)
- **Added (Backend):** `Thread` and `Message` models in `assistant` to persist conversational memory.
- **Added (Backend):** `RAGService` that dynamically constructs an in-memory `sqlite-vec` virtual table from `ExtractedChunk` blobs to perform sub-second kNN similarity searches.
- **Added (Backend):** Chat endpoint integrating RAG context, conversation history, and the local `Qwen2.5` model.
- **Added (Frontend):** Assistant chat interface (`src/features/assistant/pages/Index.tsx`) with optimistic UI updates and thread management.
- **Tested:** API endpoint and RAG execution (via mocking) successfully.

### Step 4: Content Studio (Module 3)
- **Added (Backend):** `Material` and `ExtractedChunk` models in `content`.
- **Added (Backend):** `content.services.extraction.process_material` background job utilizing `STTService` (Whisper) for video transcription and `EmbeddingService` for vector encoding.
- **Added (Backend):** SQLite-vec vector storage via raw BinaryField blobs.
- **Added (Frontend):** Content Studio UI (`src/features/content-studio/pages/Index.tsx`) for uploading files and checking background processing status.
- **Tested:** Mocked extraction pipeline (both PDF and Video paths) executing correctly via tests.

### Step 3: Adaptive Pathways (Module 2)
- **Added (Backend):** `LearningPath` and `PathNode` models in `pathways`.
- **Added (Backend):** `PathwayGenerator` service leveraging the local `LLMService` (Qwen2.5) to dynamically break down competencies into a DAG of sub-skills.
- **Added (Backend):** `LearningPathViewSet` with a `generate` endpoint.
- **Added (Frontend):** Pathways UI (`src/features/pathways/pages/Index.tsx`) that renders the generated DAG in a neat, level-based layout.
- **Tested:** LLM generator logic and API endpoints (with mocked LLM for fast test execution).

### Step 2: Catalog & Integrations (Module 1)
- **Added (Backend):** `Course` and `Enrolment` models to `catalog`.
- **Added (Backend):** `CatalogProvider` interface with `IGotMockProvider` and `TpacMockProvider` pulling from JSON fixtures.
- **Added (Backend):** `SyncService` and `sync_catalog` management command for fetching and mapping courses to `Competency`.
- **Added (Backend):** `CourseViewSet` and `EnrolmentViewSet` APIs.
- **Added (Frontend):** Catalogue browser page (`src/features/catalog/pages/Index.tsx`) with search, filter, and enroll functionality.
- **Tested:** Catalog sync service logic and API endpoints.

### Step 1: Foundations
- **Fixed:** 7 TypeScript `TS6133` (unused variable) errors blocking `npm run build`.
- **Fixed:** Orphaned `ChatMessage` records causing `IntegrityError` during migrations.
- **Added (Backend):** `core` Django app with domain models: `Role`, `Competency`, `RoleCompetency`, `UserProfile`, and `Job`.
- **Added (Backend):** Scaffolded 6 new Django apps: `catalog`, `pathways`, `content`, `assistant`, `analytics`, `edge`. Registered all apps in `settings.py` and `urls.py`.
- **Added (Backend):** `seed_orbis` management command (idempotent seeder for roles, competencies, and demo users).
- **Added (Backend):** `run_worker` management command (simple DB-backed async task runner replacing Celery).
- **Added (Frontend):** Scaffolded feature-sliced directory structure under `src/features/`.
- **Added (Frontend):** Role-based `ProtectedRoute` route guard.
- **Changed (Frontend):** Updated `App.tsx` with lazy-loaded routes for the new features while preserving legacy routes.
- **Tested:** Core models, views, and seed idempotency (13 tests passing). Build, lint, and Django checks passing.
