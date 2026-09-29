# ORBIS Codebase Audit — Step 0

> Generated: 2026-09-29 | Status: **Baseline, no code changes**

---

## 1. Repository Map

### 1.1 High-level structure

```
ORBIS/
├── backend/                     # Django project ("educarnival")
│   ├── educarnival/             # Project config (settings, urls, wsgi, asgi)
│   ├── api/                     # Django app — core student/teacher models, views, sync
│   ├── ai_engine/               # Django app — LLM, STT, TTS, prompts, RAG context
│   ├── models/                  # Downloaded model weights (GGUF, ONNX)
│   ├── media/                   # Uploaded content (videos, PDFs, PPTs, TTS output)
│   ├── manage.py
│   ├── db.sqlite3               # SQLite database
│   ├── requirements.txt
│   ├── seed_all_chapters.py     # Standalone seed script (not a management command)
│   └── download_models.py       # Downloads Qwen, Piper, Whisper models
├── frontend/                    # React + Vite + TypeScript + Tailwind 4
│   ├── src/
│   │   ├── App.tsx              # Router: student + teacher routes
│   │   ├── api.ts               # Axios client (base URL auto-detects host)
│   │   ├── pages/               # Page components (flat, not feature-sliced)
│   │   │   ├── teacher/         # Teacher portal pages (5 files)
│   │   │   └── *.tsx            # Student pages (10 files)
│   │   ├── components/          # Shared components (8 files)
│   │   ├── hooks/               # 2 custom hooks (focus alert, session timer)
│   │   ├── lib/                 # 4 utility files (sync engine, focus alarm, IndexedDB)
│   │   └── index.css            # Tailwind + custom CSS
│   ├── package.json
│   └── vite.config.ts
├── PRD.md
└── README.md
```

### 1.2 Backend apps

| App | Role | Models | URL prefix |
|-----|------|--------|------------|
| `api` | Core data: students, grades, subjects, chapters, resources, learning state, teacher portal, sync | Student, Grade, Subject, Chapter, ChapterResource, ChatSession, ChatMessage, FlashcardSet, Flashcard, ChapterFormulaSheet, ChapterQuizQuestion, QuizAttempt, QuizQuestion, LearningProgress, QuestionExplanation, WeakConcept, ActivityEvent, ContentChunk, TeacherProfile, ContentAsset, SyncManifestVersion, DeviceSyncStatus, TeacherActivityLog | `/api/` |
| `ai_engine` | LLM inference, STT (Whisper), TTS (Piper), prompts, RAG context extraction | (none — uses `api` models) | `/api/ai/` |

### 1.3 Backend services and key modules

| File | Purpose | Reuse value |
|------|---------|-------------|
| `ai_engine/services.py` | **LLMService** (llama-cpp singleton, `chat()`, `generate()`, `generate_json()`), **STTService** (faster-whisper), **TTSService** (Piper + gTTS fallback for Kannada), **EmbeddingService** (SentenceTransformer all-MiniLM-L6-v2) | ★★★ Core reuse |
| `ai_engine/prompts.py` | All prompt templates: tutor (EN/HI/KN), voice tutor, summarize, flashcards, quiz, analysis. Functions: `get_system_tutor_prompt()`, `get_voice_tutor_prompt()`, `build_messages()`, `build_chat_prompt()` | ★★★ Extend |
| `ai_engine/context.py` | `get_chapter_context()` (PDF/transcript extraction, LRU cached), `get_rag_context()` (sqlite-vec KNN search), `get_chapter_language()`, translation helpers | ★★★ RAG reusable |
| `ai_engine/views.py` | Chatbot, Voice assistant, Summarize, Flashcard gen, Quiz gen/submit/analyze | ★★★ Voice pipeline reusable |
| `api/content_pipeline.py` | Upload → hash → validate → save → manifest pipeline | ★★ Reusable |
| `api/chunk_engine.py` | Chunked download/delta sync engine (512KB chunks, SHA-256, sidecar manifests) | ★★ Reusable for edge |
| `api/media_scanner.py` | Auto-discovers chapter resources from media directory | ★ |
| `api/sync_views.py` | Export/import sync, manifest versioning, device check-in | ★★ Reusable for edge |
| `api/teacher_views.py` | Teacher login/logout, dashboard, content CRUD, activity feed | ★★ Extend for trainer |

### 1.4 Management commands

| Command | Purpose |
|---------|---------|
| `ingest_chapter_content` | Chunks chapter resources → ContentChunk rows → sqlite-vec embeddings |
| `generate_quizzes` | Generates ChapterQuizQuestion from chapter context via LLM |
| `generate_formulas` | Generates formula sheets |
| `generate_notes` | Generates AI study notes |
| `transcribe_videos` | Whisper transcription of uploaded videos |
| `seed_content` | Seeds sample content data |
| `create_teacher` | Creates a teacher user |
| `cleanup_soft_deletes` | Purges expired soft-deleted content |
| `translate_chapters` | Translates chapter content |

### 1.5 Frontend structure

| Page/Component | Purpose |
|----------------|---------|
| `SelectProfile.tsx` | Student profile picker (no auth) |
| `Registration.tsx` | Student registration |
| `Dashboard.tsx` | Student subject/grade dashboard |
| `ChapterList.tsx` | Chapter browser per subject |
| `ChapterContent.tsx` | Chapter detail (video, notes, chat, voice, summary) |
| `FlashcardScreen.tsx` | Flashcard study interface |
| `QuizScreen.tsx` | Quiz interface with hints + analysis |
| `FormulaSheetScreen.tsx` | Formula sheet viewer |
| `Profile.tsx` | Student profile page |
| `ProgressDashboard.tsx` | Progress/activity heatmap + quiz results + PDF report card |
| `teacher/TeacherLogin.tsx` | Teacher auth page |
| `teacher/TeacherDashboard.tsx` | Teacher overview |
| `teacher/ContentUpload.tsx` | Teacher content upload |
| `teacher/ContentList.tsx` | Teacher content management |
| `teacher/TeacherActivity.tsx` | Teacher activity log |
| `components/AIChatbot.tsx` | Chat panel with markdown + math |
| `components/Header.tsx` | Student header/nav |
| `components/TeacherHeader.tsx` | Teacher header/nav |
| `components/SyncManager.tsx` | Sync UI with chunk progress |
| `components/AttentionTracker.tsx` | Face-based attention detection |
| `components/ParentSessionLock.tsx` | Parental time-lock |
| `lib/syncDb.ts` + `syncEngine.ts` | IndexedDB + chunked sync client |

### 1.6 Models on disk

| Model | File | Size |
|-------|------|------|
| Qwen 2.5 1.5B Instruct (Q4_K_M) | `models/qwen2.5-1.5b-instruct-q4_k_m.gguf` | ~1.1 GB |
| Piper English (lessac-medium) | `models/en_US-lessac-medium.onnx` | ~63 MB |
| Piper Hindi (pratham-medium) | `models/hi_IN-pratham-medium.onnx` | ~63 MB |
| Whisper base (auto-downloaded) | downloaded at runtime | ~145 MB |
| SentenceTransformer all-MiniLM-L6-v2 | auto-cached by HuggingFace | ~80 MB |

### 1.7 Key dependencies

**Backend:** Django 6.1, DRF, django-cors-headers, llama-cpp-python, faster-whisper, PyMuPDF, piper-tts, xhtml2pdf, deep-translator, gTTS, sentence-transformers, sqlean, sqlite-vec

**Frontend:** React 19, react-router-dom 7, axios, react-markdown, remark-math, rehype-katex, lucide-react, face-api.js, Tailwind CSS 4, oxlint, TypeScript 6

---

## 2. Baseline Status

| Check | Result |
|-------|--------|
| `python3 manage.py check` | ✅ System check identified no issues |
| `python3 manage.py makemigrations --check` | ✅ No changes detected |
| `python3 manage.py test` | ✅ 0 tests ran (no tests written yet) |
| `npm run lint` | ✅ 0 errors, 33 warnings (all `react-hooks/exhaustive-deps`) |
| `npm run build` | ❌ 7 TypeScript errors (all `TS6133` — unused variables) |

> **Note:** `npm run build` fails due to `tsc -b` treating `TS6133` (unused vars) as errors. These are pre-existing in `App.tsx`, `SyncManager.tsx`, `TeacherHeader.tsx`, `focusAlarm.ts`, `focusAudioDb.ts`, `ChapterContent.tsx`, `FormulaSheetScreen.tsx`. Must be fixed in Step 1 or tsconfig adjusted.

---

## 3. Module Reuse Analysis

### Module 1: `catalog` — Mock iGOT + TPAC Adapter

| Aspect | Status | Action |
|--------|--------|--------|
| Backend app | Does not exist | **Create** `catalog` app |
| Course model | No equivalent | **Create** `Course`, `Enrolment`, `SyncLog` |
| Adapter pattern | No adapter exists | **Create** `CatalogProvider` interface + mocks |
| Fixtures | No iGOT/TPAC data | **Create** fixture JSON files |
| Frontend | No catalogue UI | **Create** `features/catalog/` |
| **Disposition** | | **Create** |

### Module 2: `pathways` — Embeddings, Vector Search, Recommendations

| Aspect | Status | Action |
|--------|--------|--------|
| Backend app | Does not exist | **Create** `pathways` app |
| Embedding service | ✅ `EmbeddingService` in `ai_engine/services.py` | **Reuse** |
| sqlite-vec integration | ✅ `get_rag_context()` + `ingest_chapter_content` | **Extend** |
| Vector search | ✅ KNN search in `context.py` | **Extend** |
| Recommendation model | Does not exist | **Create** |
| LLM explanation | ✅ `LLMService.chat()` + `generate_json()` | **Reuse** wrapper |
| Frontend | No pathway UI | **Create** `features/pathways/` |
| **Disposition** | | **Extend + Create** |

### Module 3: `content` — Content Studio

| Aspect | Status | Action |
|--------|--------|--------|
| Backend app | Does not exist as separate app | **Create** `content` app |
| Upload pipeline | ✅ `content_pipeline.py` | **Reuse** |
| PDF extraction | ✅ PyMuPDF/pdfplumber | **Reuse** |
| PPT extraction | Not implemented | **Create** (python-pptx) |
| Video transcription | ✅ `STTService` + `transcribe_videos` | **Reuse** |
| MCQ generation | ✅ Quiz prompts + `generate_json()` | **Extend** |
| Question model | ✅ `ChapterQuizQuestion` | **Extend** |
| Frontend | Teacher portal exists | **Extend** |
| **Disposition** | | **Extend + Create** |

### Module 4: `assistant` — Chatbot, Voice, RAG, Multilingual

| Aspect | Status | Action |
|--------|--------|--------|
| Backend app | Does not exist as separate app | **Create** `assistant` app |
| Chatbot | ✅ `ChatbotView` — grounded, session, translation | **Extend** |
| Voice | ✅ `VoiceAssistantView` — full chain | **Reuse** |
| RAG | ✅ `get_rag_context()` | **Extend** |
| Multilingual | ✅ EN/HI/KN prompts + translation | **Reuse** |
| Chat UI | ✅ `AIChatbot.tsx` | **Extend** |
| **Disposition** | | **Extend** (very heavy reuse) |

### Module 5: `analytics` — Assessments, Gaps, Dashboards

| Aspect | Status | Action |
|--------|--------|--------|
| Backend app | Does not exist | **Create** `analytics` app |
| Assessment | ✅ `QuizAttempt`/`QuizQuestion` | **Extend** |
| Gap analysis | Not implemented | **Create** |
| Predictive analytics | Not implemented | **Create** |
| Progress/heatmap | ✅ `ProgressDashboard.tsx` | **Reuse** |
| Report card / PDF | ✅ xhtml2pdf | **Reuse** |
| Admin dashboard | Not implemented | **Create** |
| **Disposition** | | **Extend + Create** |

### Module 6: `virtual-lab` — Pyodide Python/SQL Lab

| **Disposition** | | **Create** (nothing exists) |

### Module 7: `edge` — Offline Packs and Sync

| Aspect | Status | Action |
|--------|--------|--------|
| Chunk sync engine | ✅ `chunk_engine.py` | **Reuse** |
| Sync protocol | ✅ `syncDb.ts` + `syncEngine.ts` | **Reuse** |
| Device tracking | ✅ `DeviceSyncStatus` | **Reuse** |
| Pack building | Not implemented | **Create** |
| **Disposition** | | **Extend + Create** |

---

## 4. Conflicts and Deviations from PRD

| # | PRD expectation | Current reality | Resolution |
|---|-----------------|-----------------|------------|
| 1 | Apps under `backend/apps/<name>/` | Apps at `backend/api/`, `backend/ai_engine/` (flat) | **Keep flat.** New apps at `backend/catalog/`, etc. |
| 2 | Project named `orbis` | Project is `educarnival` | **Keep `educarnival`** to avoid breakage. |
| 3 | Auth for 3 roles | Students: custom model (no auth); Teachers: `auth.User` + `TeacherProfile` | **Extend** Django auth with `UserProfile.role`. Keep `Student` model. |
| 4 | No network calls | `deep-translator` and `gTTS` make network calls | Add config toggle for offline mode. |
| 5 | `npm run build` should pass | 7 TS errors (unused variables) | **Fix** in Step 1. |
| 6 | Tests should exist | Both `tests.py` empty | **Create** from Step 1. |
| 7 | `seed_orbis` command | Standalone script `seed_all_chapters.py` | **Create** management command. |
| 8 | `apiClient.ts` centralized | `api.ts` exists (minimal) | **Extend** existing file. |
| 9 | Feature-sliced frontend | Flat `pages/` + `components/` | **Restructure** in Step 1. |
| 10 | `prompts/` versioned files | Inline in `ai_engine/prompts.py` | **Keep** existing, add `prompts/` for new. |

---

## 5. Proposed Final Directory Layout

```
ORBIS/
├── docs/
│   ├── AUDIT.md          ← this file
│   ├── CHANGELOG.md
│   └── PERF.md
├── backend/
│   ├── educarnival/      # Project config (unchanged)
│   ├── api/              # PRESERVED — existing student/teacher models + views
│   ├── ai_engine/        # PRESERVED — LLM/STT/TTS/RAG (shared, extends)
│   ├── catalog/          # NEW — mock iGOT/TPAC, courses, enrolment
│   ├── pathways/         # NEW — recommendations, search, pathways
│   ├── content/          # NEW — content studio, extraction, question bank
│   ├── assistant/        # NEW — chatbot, voice, RAG, multilingual
│   ├── analytics/        # NEW — assessments, gaps, dashboards
│   ├── edge/             # NEW (stretch) — offline packs, sync
│   ├── core/             # NEW — Role, Competency, UserProfile, Job
│   ├── prompts/          # NEW — versioned prompt files for new modules
│   ├── models/           # Model weights (unchanged)
│   └── media/            # Uploaded content (unchanged)
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── api.ts (extended)
│       ├── features/
│       │   ├── catalog/
│       │   ├── pathways/
│       │   ├── content-studio/
│       │   ├── assistant/
│       │   ├── dashboard-learner/
│       │   ├── dashboard-admin/
│       │   ├── virtual-lab/
│       │   └── edge/
│       ├── pages/         # PRESERVED (existing student pages)
│       ├── components/    # PRESERVED
│       ├── hooks/         # PRESERVED
│       └── lib/           # PRESERVED + extended
```

---

## 6. Reuse Summary Table

| PRD Module | Backend Reusable | Frontend Reusable | Disposition |
|------------|-----------------|-------------------|-------------|
| 1. catalog | — | — | **Create** |
| 2. pathways | EmbeddingService, sqlite-vec, RAG | — | **Extend + Create** |
| 3. content | content_pipeline, PDF extraction, Whisper, quiz prompts | ContentUpload, ContentList | **Extend + Create** |
| 4. assistant | ChatbotView, VoiceAssistant, RAG, STT/TTS, multilingual | AIChatbot.tsx | **Extend** (heavy) |
| 5. analytics | QuizAttempt, progress data, xhtml2pdf | ProgressDashboard.tsx | **Extend + Create** |
| 6. virtual-lab | — | — | **Create** |
| 7. edge | chunk_engine, sync protocol, DeviceSyncStatus | SyncManager.tsx | **Extend + Create** |

---

## 7. Risk Notes

1. **Django project name mismatch** — `educarnival` vs PRD's `orbis`. Keeping `educarnival` to avoid import breakage.
2. **Student auth is custom** — current `Student` model has no password/auth. New role-based users need Django `auth.User`. Both must coexist.
3. **TypeScript build currently fails** — 7 unused-variable errors. Quick fix needed before feature work.
4. **No test coverage** — starting from zero. Must add tests incrementally.
5. **`deep-translator` and `gTTS` require network** — conflicts with offline requirement. Need config toggle.
6. **sqlite-vec virtual table** — created imperatively, not via Django migrations. Follow same pattern for new tables.
