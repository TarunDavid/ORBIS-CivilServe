
# ORBIS — Incremental Refactor & Implementation PRD

## 0. Document Purpose

This document is the master execution plan for evolving the **existing ORBIS code base** into the new ORBIS product direction without rebuilding the application from scratch.

The original ORBIS concept was primarily an AI-powered personalized learning platform. The new center of gravity is **Demonstrated Competency** while preserving the existing learning, assistant, catalogue, analytics, virtual-lab, and offline capabilities.

The product direction is:

> **ORBIS — AI-powered Competency Intelligence and Experiential Learning Platform for India's Official Statistical System.**

Core loop:

> **ASSESS → DIAGNOSE → LEARN → PRACTICE → DECIDE → MEASURE → IMPROVE**

The implementation must be an **incremental refactor of the current code base**. Do not create a second application, do not throw away working functionality, and do not replace the current architecture merely for cosmetic reasons.

The final product should feel like:

> **A competency intelligence system with an integrated learning ecosystem and professional simulation engine.**

Not:

> **An LMS with games added to it.**

---

# 1. Existing ORBIS Code Base — Preserve and Extend

Current functional mapping:

| Area | Backend App | Frontend Folder | Direction |
|---|---|---|---|
| Mock iGOT and TPAC catalogues behind an adapter, enrolment and completion sync | `catalog` | `features/catalog` | Preserve and strengthen as the learning-integration layer |
| Embeddings and vector search, recommendations, “why this course” explanations, ordered pathways | `pathways` | `features/pathways` | Preserve; evolve into competency-driven recommendation layer |
| Trainer upload, PDF/PPT/video extraction (Whisper), MCQ and case generation, review and publish, question bank | `content` | `features/content-studio` | Preserve; connect generated content to competencies and labs |
| Chatbot and voice assistant, RAG, multilingual | `assistant` | `features/assistant` | Preserve; make context competency/learning aware |
| Learner and admin dashboards, predictive analytics | `analytics` | `features/dashboard-learner`, `features/dashboard-admin` | Preserve; add competency intelligence and training effectiveness |
| Browser-based Python/SQL virtual lab (Pyodide) | none | `features/virtual-lab` | Preserve; integrate as a practical assessment environment where appropriate |
| ORBIS Edge offline packs and sync (stretch) | `edge` | `features/edge` | Preserve as secondary/stretch capability |

### Required architectural principle

**Work on the existing code base.** Before editing anything, inspect the repository structure, existing models, API routes, serializers, services, hooks, components, tests, design system, environment configuration, migrations, and current user flows.

Do not assume that a file, route, model, or service exists just because this PRD names a feature. Reuse existing implementations where possible.

---

# 2. Product Direction Change

## 2.1 Old center of gravity

The previous product loop was approximately:

> **Profile → Assess → Find Gap → Recommend Course → Learn → Quiz → Track Progress**

This made ORBIS feel primarily like an AI LMS / personalized training platform.

## 2.2 New center of gravity

The new loop is:

> **Assess → Diagnose → Learn → Practice → Decide → Measure → Improve**

The primary product question is:

> **Can this official actually apply what they learned in a realistic professional situation?**

## 2.3 What is NOT being removed

Keep and integrate:

- Videos
- Learning documents
- AI Tutor
- MCQs and quizzes
- AI-generated assessment content
- Personalized learning
- iGOT catalogue integration
- Course recommendations
- “Why this course?” explanations
- Learner dashboard
- Admin dashboard
- Analytics
- Python/SQL virtual lab
- Multilingual assistant
- Voice assistant
- Offline/edge capability as a secondary feature

## 2.4 What becomes central

Add or elevate:

- Evidence-backed competency profiles
- Competency assessment across knowledge and application
- Experiential Competency Labs
- Scenario/simulation engine
- Deterministic, explainable competency scoring
- Continuous reassessment
- Before/after competency improvement
- Training effectiveness measurement
- Competency relationships / graph
- Future Skill Radar
- “Why this intervention?” explainability

## 2.5 What is no longer the main focus

Do not make these the product identity:

- History-based games
- Generic entertainment games
- Offline-first positioning
- Course completion as the main outcome
- Arbitrary LLM-generated competency scores
- “AI LMS” as the headline positioning

---

# 3. Target Users

## Learner / Official

An employee/official engaged in India’s Official Statistical System.

The user should be able to:

1. View their role and competency profile.
2. Complete assessments.
3. See competency gaps.
4. Access personalized learning.
5. Watch videos and study documents.
6. Use the AI tutor.
7. Take quizzes.
8. Enter competency labs.
9. Make decisions in realistic scenarios.
10. Receive evidence-backed competency feedback.
11. Reassess after learning.
12. See measurable competency improvement.

## Trainer / Content Manager

The trainer should be able to:

1. Upload learning content.
2. Extract text/transcripts.
3. Generate MCQs, quizzes, cases, and scenario material.
4. Map generated content to competencies.
5. Review and edit AI-generated items.
6. Publish approved content.
7. View question-bank coverage.
8. Build or approve competency-lab scenarios.

## Administrator / Department Leadership

The administrator should be able to:

1. View workforce competency distribution.
2. Filter by department, role, competency, and status.
3. Identify critical gaps.
4. View training interventions.
5. Compare competency before and after interventions.
6. View learning completion alongside demonstrated improvement.
7. Identify future/emerging skill requirements.
8. View aggregated insights without exposing unnecessary personal information.

---

# 4. Competency Framework

Build the competency layer around the SIH 26101 competency categories.

## Statistical competencies

- Survey Design
- Sampling
- National Accounts
- Price Statistics
- Labour Statistics
- Agricultural Statistics
- Industrial Statistics
- SDG Indicators
- Metadata Standards
- Data Quality Frameworks

## Technical competencies

- Python
- R
- SQL
- Stata
- SPSS
- SAS
- GIS
- Data Visualization
- AI/ML
- Cloud Computing
- APIs
- Open Data

## Digital Governance competencies

- Cybersecurity
- Data Privacy
- Digital Signatures
- Government Cloud
- Digital Public Infrastructure

## Behavioral / Managerial competencies

- Leadership
- Communication
- Project Management
- Ethics
- Decision Making
- Change Management

### Competency model requirements

Each competency should support, at minimum:

- `id`
- name
- category
- description
- target/proficiency requirement
- role associations
- prerequisite/related competencies
- assessment evidence types
- active/inactive state

Use the existing project conventions for naming, validation, migrations, API responses, and permissions.

Do not invent complicated knowledge-graph infrastructure unless the existing code base requires it. For the MVP, a relational competency relationship model can provide the graph behavior.

---

# 5. Evidence-Backed Competency Model

Competency scores must be explainable.

Do not let an LLM directly invent a final numeric score such as:

> Leadership = 72%

Instead use a transparent evaluation pipeline:

> **Evidence → Rubric → Score → Explanation**

Possible evidence sources:

- Knowledge assessment
- MCQ/quiz performance
- Virtual-lab performance
- Competency-lab decisions
- Scenario reasoning
- Previous assessment
- Reassessment
- Approved learning completion, as contextual evidence rather than proof of mastery

Example display:

### Data Quality — 64 / 85

| Evidence | Result |
|---|---:|
| Knowledge Assessment | 72% |
| Data Detective Lab | 58% |
| Statistical Crisis Lab | 61% |
| Previous Assessment | 66% |

Detected weakness:

> **Anomaly detection and quality-control decisions**

Recommended action:

> **Data Quality refresher + Data Detective Level 2**

The LLM may generate natural-language explanations, but the underlying score must come from deterministic rules/rubrics implemented in code.

---

# 6. Core Domain Additions

If equivalent models/services do not already exist, add the minimum new domain layers needed to support the new product direction.

Recommended backend additions:

- `competencies` app for competency definitions, role requirements, profiles, evidence, scores, and relationships.
- `simulations` app for reusable scenario definitions, scenario sessions, decisions, consequences, rubrics, and competency evidence.

These should only be created after inspecting the existing code base. If an existing app already owns the same domain, extend that app instead of duplicating it.

Do not create duplicate models for users, roles, courses, content, or assessments when compatible models already exist.

---

# 7. Reusable Experiential Competency Lab Engine

The platform should contain a **single reusable scenario engine** rather than eight separate game implementations.

A scenario should conceptually contain:

- Situation
- Scenario metadata
- Target competencies
- Difficulty
- Available information
- Constraints
- Stages/events
- Decision options
- Consequences
- Branching rules
- Evaluation rubric
- Final outcome
- Competency evidence

A learner session should capture:

- learner
- scenario
- start/end time
- selected decisions
- reasoning where applicable
- evidence inspected
- consequences reached
- rubric results
- competency evidence
- final score

The engine should support branching:

> **Decision → Consequence → New Event → Decision → Outcome**

Do not hard-code an individual lab directly into React components if the scenario can be represented as data/configuration.

---

# 8. Competency Lab Catalogue

## Lab 1 — Statistical Crisis Lab

**Flagship demonstration experience.**

Scenario examples:

- Survey response rate decline
- Limited field resources
- Duplicate records
- Data-quality issue
- Reporting deadline pressure
- Conflicting stakeholder priorities

Evaluate:

- Statistical reasoning
- Data quality
- Decision making
- Risk management
- Resource management
- Communication
- Ethics

The simulation must have real consequences. Earlier decisions should affect later events.

## Lab 2 — Data Detective

Provide a realistic but safe synthetic statistical dataset.

Learner should identify:

- Missing values
- Duplicates
- Impossible values
- Outliers
- Inconsistencies
- Metadata/data-quality issues

Use the result as competency evidence.

This lab may reuse the existing `features/virtual-lab` infrastructure where appropriate.

## Lab 3 — Decision Room

The learner receives:

- Limited budget
- Competing requirements
- Conflicting stakeholder priorities
- Limited staff

Evaluate:

- Leadership
- Decision making
- Communication
- Project management
- Resource allocation

## Lab 4 — Ethics & Judgment

Situations involving:

- Data integrity
- Reporting pressure
- Accountability
- Public impact
- Conflicting instructions

Evaluate the quality of reasoning and judgment, not only a binary correct/incorrect answer.

## Lab 5 — Field Operations Crisis

Simulate:

- Staff shortage
- Connectivity problem
- Access problem
- Communication breakdown
- Deadline change
- Resource constraints

Evaluate:

- Leadership
- Communication
- Adaptability
- Problem solving
- Operational decision making

## Lab 6 — Officer’s Desk / Inbox Zero

Provide a virtual work inbox with competing items such as:

- Urgent data-quality issue
- Meeting request
- Department request
- Cybersecurity alert
- Survey problem
- Deadline reminder
- Senior communication

Evaluate prioritization, risk assessment, decision making, time management, and communication.

## Lab 7 — What Would You Do?

Short 30–60 second micro-scenarios.

The learner must choose an action and, where useful, explain why.

Evaluate:

> **Decision + Reasoning**

## Lab 8 — What If?

After completing a decision, allow the learner to explore a counterfactual:

> “What would have happened if you selected another option?”

Display the alternate branch and consequence.

### MVP rule

Do not build all eight deeply for the hackathon.

Build the reusable engine and implement:

1. **Statistical Crisis Lab**
2. **Data Detective Lab**

Design the system so the other labs can be added as scenario configurations.

---

# 9. Learning Experience

Videos remain part of the product.

The learner journey inside a learning module should be able to include:

> **Video → Supporting Documents → AI Tutor → Quick Quiz → Competency Lab → Reassessment**

### Video requirements

Preserve the current video extraction/transcript capabilities.

A learning item may contain:

- video metadata
- transcript
- duration
- sections
- learning objectives
- competency mappings
- related documents
- associated quiz
- associated competency lab

Do not attempt to build a streaming platform from scratch. Reuse the current asset/content architecture.

---

# 10. Content Studio Evolution

Existing `content` / `features/content-studio` remains central.

Extend it so generated content can be mapped to competencies.

Trainer flow:

> **Upload → Extract → Generate → Map to Competencies → Review → Approve → Publish**

Supported input:

- PDF
- PPT
- DOC
- Video
- Video transcript

Supported generated outputs:

- MCQs
- Quiz sets
- Case studies
- Scenario questions
- Explanations
- Optional scenario-event drafts

### Quality controls

Each AI-generated item should support:

- Source reference
- Competency tag(s)
- Difficulty
- Correct answer
- Explanation
- Review status
- Reviewer/edit history

Do not auto-publish unreviewed high-stakes training content.

---

# 11. Personalized Recommendation Layer

Existing `pathways` and `features/pathways` must remain.

Refactor the recommendation inputs so recommendations use:

> **Role requirement + competency gap + evidence + learning history + future skill need**

Recommended interventions can include:

- iGOT course
- ORBIS video
- Document
- Quiz
- Virtual lab
- Competency lab
- Refresher learning
- Future-skill content

Each recommendation must expose a clear explanation.

Example:

> **Why this recommendation?**
>
> Data Quality is 54/85 for your role.
> The Data Detective Lab identified weakness in anomaly detection.
> This course directly targets the missing competency.

### Next Best Action

Do not overwhelm the learner with a giant catalogue on the home page.

Show a small number of prioritized next actions, for example:

1. Complete Data Quality refresher
2. Attempt Data Detective Level 2
3. Take Sampling assessment

Ranking must be explainable and derived from defined rules/signals.

---

# 12. iGOT / TPAC Integration Layer

Existing `catalog` must continue to provide the abstraction layer.

Required conceptual operations:

- Fetch course catalogue
- Search/filter learning items
- Map course → competency
- Enrol learner
- Track completion
- Sync completion state
- Expose an integration status

Use adapter interfaces so a mock provider can power the hackathon demo and an authorized production provider can be substituted later.

Do not invent or claim undocumented live iGOT API endpoints.

The demo should visibly distinguish:

> **Mock/demo integration**

from:

> **Production-ready adapter design**

Do not replace iGOT; position ORBIS as the competency intelligence and experiential layer around the learning ecosystem.

---

# 13. AI Assistant Evolution

Existing `assistant` / `features/assistant` remains.

The assistant should understand ORBIS context:

- Current competency profile
- Active learning module
- Source material
- Recommended pathway
- Assessment history
- Lab context

Capabilities:

- Explain a concept
- Answer questions from approved material
- Give examples
- Help prepare for assessment
- Explain competency evidence
- Explain recommendation rationale
- Provide multilingual assistance
- Voice interaction where already supported

Do not let the assistant silently change official competency scores.

The assistant may explain scores produced by the competency engine.

---

# 14. Analytics & Dashboards

Existing `analytics` stays as the central analytics app.

## Learner dashboard

Add or refine:

- Overall competency snapshot
- Competency-by-category view
- Critical gaps
- Required vs current competency
- Evidence breakdown
- Recommended next actions
- Learning progress
- Lab progress
- Improvement over time
- Training effectiveness for the learner
- Future skills

Avoid making the dashboard a wall of charts.

The main question should be:

> **“What do I need to do next to improve my role readiness?”**

## Admin dashboard

Add/refine:

- Workforce competency heatmap
- Department comparison
- Role comparison
- Critical competency gaps
- Training completion
- Demonstrated competency improvement
- Intervention effectiveness
- Emerging/future skills
- Drill-down by department → role → competency

The key analytical loop is:

> **Who needs training → What competency is missing → What intervention was applied → Did competency improve?**

Use aggregated views wherever possible.

---

# 15. Training Effectiveness

Add a first-class concept of intervention outcome.

Before intervention:

> Data Quality = 54

Intervention:

> Video + iGOT course + Data Detective Lab

After reassessment:

> Data Quality = 76

Display:

> **+22 competency improvement**

The system should record enough evidence to distinguish:

- Course completion
- Assessment improvement
- Practical/simulation improvement
- Overall competency change

Do not equate course completion with competency mastery.

---

# 16. Competency Drift

Optional but architecturally desirable.

ORBIS may detect decline over time, for example:

> 82 → 79 → 72 → 64

and flag:

> **Competency Drift Detected**

Then suggest a refresher or reassessment.

This is a secondary feature; do not let it delay core MVP delivery.

---

# 17. Future Skill Radar

ORBIS should distinguish:

### Current competency gap

Example:

> GIS = 42 / 65 required

from:

### Future / emerging skill

Example:

> AI-assisted statistical analysis becoming relevant to this role

Use this as an admin and learner planning feature.

Do not claim that ORBIS has authoritative future workforce predictions unless a documented dataset/model exists.

---

# 18. ORBIS Edge — Stretch Capability

Existing `edge` / `features/edge` remains secondary.

Potential capabilities:

- Download role-specific learning packs
- Cache approved video/materials
- Offline selected assessments
- Offline selected competency labs
- Local progress storage
- Sync when connection returns

Offline must not become the headline product positioning.

For the hackathon, implement only when it does not compromise the core end-to-end demo.

---

# 19. Gamification Rules

Gamification should support engagement but never replace competency measurement.

Use professional concepts:

- Missions
- Skill progress
- Badges
- Competency levels
- Scenario completion
- Progress maps

Avoid:

- Cartoon-heavy visuals
- Arcade mechanics
- Leaderboard-centric design
- Children’s-game terminology

The UI should feel appropriate for government professionals.

---

# 20. UX / Product Design Direction

The new interface must visually communicate **professional competency intelligence** rather than a generic LMS.

## Main navigation

Recommended structure:

```text
ORBIS
│
├── Dashboard
├── My Competencies
├── Assessments
├── Learning
│   ├── Recommended
│   ├── Videos
│   ├── Courses
│   ├── Documents
│   └── AI Tutor
├── Competency Labs
│   ├── Statistical Crisis
│   ├── Data Detective
│   ├── Decision Room
│   ├── Ethics & Judgment
│   └── Field Operations
├── Progress
└── Competency Passport
```

Admin:

```text
ADMIN
│
├── Workforce Overview
├── Competency Heatmap
├── Skill Gaps
├── Training Effectiveness
├── Emerging Skills
├── Learning Analytics
└── Content / Assessment Studio
```

### Competency dashboard design

A competency detail page should make this understandable at a glance:

- Current score
- Required score
- Gap
- Evidence
- Strengths
- Weaknesses
- Recommended interventions
- Trend
- Reassessment action

Do not use unexplained decorative metrics.

---

# 21. Technical Guardrails

## Existing stack

Preserve the current stack unless the repository proves a change is necessary.

The expected architecture is:

### Frontend

- Existing React/TypeScript/Vite architecture
- Existing component system
- Existing Tailwind/design system
- Existing routing/state/query conventions
- Existing PWA/offline conventions where present

### Backend

- Existing Django architecture
- Existing API conventions
- Existing authentication/RBAC
- Existing migrations
- Existing task/job infrastructure

### AI

- Existing RAG/vector search stack
- Existing Whisper video extraction
- Existing LLM integration
- Existing embeddings

Do not add a new AI provider merely because a different provider seems trendy.

## Reuse first

Before creating new code:

1. Search for equivalent models.
2. Search for equivalent service functions.
3. Search for existing API endpoints.
4. Search for existing UI components.
5. Reuse existing design tokens.
6. Reuse existing validation.
7. Reuse existing auth/permissions.
8. Extend existing abstractions where possible.

---

# 22. Data / Domain Relationships

The target conceptual relationship is:

```text
Role
  ↓
Required Competencies
  ↓
Learner Competency Profile
  ↓
Assessments + Learning History + Lab Evidence
  ↓
Competency Scores
  ↓
Skill Gaps
  ↓
Interventions
  ├── iGOT Course
  ├── ORBIS Video
  ├── Document
  ├── Quiz
  ├── Virtual Lab
  └── Competency Lab
  ↓
Reassessment
  ↓
Updated Score
  ↓
Training Effectiveness
```

The data model must support traceability.

A score should be explainable back to evidence.

---

# 23. Suggested Core Entities

Only create equivalents that do not already exist.

Potential entities:

- `Competency`
- `RoleCompetencyRequirement`
- `LearnerCompetency`
- `CompetencyEvidence`
- `Assessment`
- `AssessmentAttempt`
- `CompetencyAssessmentResult`
- `Scenario`
- `ScenarioEvent`
- `ScenarioDecision`
- `ScenarioBranch`
- `ScenarioSession`
- `ScenarioDecisionRecord`
- `ScenarioEvaluation`
- `TrainingIntervention`
- `CompetencyReassessment`
- `CompetencyImprovement`

Use foreign keys to existing User/Role/Course/Content entities instead of duplicating them.

---

# 24. API Requirements

Use the project's current API style.

Potential endpoint capabilities:

## Competencies

- list competencies
- competency detail
- learner competency profile
- competency evidence
- competency trend

## Assessments

- start assessment
- submit assessment
- get result
- get evidence
- trigger reassessment

## Labs

- list available labs
- get scenario
- start session
- submit decision
- advance scenario
- get session state
- complete scenario
- get evaluation

## Recommendations

- get recommended actions
- get recommendation rationale
- get ordered pathway

## Training effectiveness

- before/after score
- intervention outcome
- aggregated intervention metrics

## Admin

- competency heatmap
- workforce distribution
- gaps by department/role
- intervention effectiveness

Do not expose internal implementation details to the client.

---

# 25. Security & Privacy

The target environment involves government-related workforce capability data.

Implement according to the project's current authentication and security conventions.

At minimum:

- RBAC
- server-side permission checks
- secure API validation
- safe file handling
- audit-friendly evidence records
- separation of learner and admin data
- minimum necessary personal data display
- safe handling of uploaded documents
- no sensitive information embedded in frontend code
- environment variables for credentials/secrets

Do not hard-code API keys or credentials.

---

# 26. Accessibility & Professional UX

The application should support:

- keyboard navigation
- readable contrast
- clear error states
- responsive layout
- accessible form controls
- descriptive labels
- loading states
- empty states
- meaningful validation messages

The visual style should communicate:

**trusted + analytical + modern + professional + mission-driven**

not:

**consumer gaming + cartoon LMS**

---

# 27. Demo Narrative

The product demo must tell one coherent story.

### Opening

Show a statistical officer.

Question:

> **Two officials completed the same training course. Which one is actually prepared to handle a real statistical crisis?**

ORBIS answers:

> **We don't only track who completed training. We measure demonstrated competency.**

### Demo sequence

1. Login as official.
2. Open competency profile.
3. Show required vs current competency.
4. Show a critical Data Quality gap.
5. Show “Why this gap?” evidence.
6. Show recommended intervention.
7. Open learning module.
8. Watch/video state or open lesson content.
9. Ask AI tutor a question.
10. Take generated quiz.
11. Launch **Statistical Crisis Lab**.
12. Make decisions.
13. Show consequences.
14. Finish scenario.
15. Show competency evidence.
16. Reassess.
17. Show improvement, e.g. 54 → 76.
18. Switch to admin dashboard.
19. Show aggregated workforce gap and intervention effectiveness.
20. Show iGOT adapter/catalogue layer.
21. Optionally show ORBIS Edge only if stable.

End statement:

> **ORBIS closes the loop between learning, demonstrated ability, and workforce capability.**

---

# 28. Incremental Execution Strategy

## CRITICAL AGENT INSTRUCTION

**Do not execute the entire PRD in one destructive pass.**

Execute it phase by phase.

After every phase:

1. Inspect what exists.
2. Implement only that phase.
3. Run backend tests.
4. Run frontend type/lint/build checks relevant to changed areas.
5. Run migrations if required.
6. Verify API contracts.
7. Verify existing features did not regress.
8. Fix errors before moving to the next phase.
9. Summarize files changed and why.
10. Identify any remaining risks.

Never continue into a later phase while an earlier phase is fundamentally broken.

---

# 29. PHASE-BY-PHASE IMPLEMENTATION PLAN

## PHASE 0 — Repository Audit & Baseline

### Goal
Understand the current application before modifying it.

### Actions

- Inspect backend apps and frontend features.
- Identify existing user, role, course, content, assessment, analytics, and authentication models.
- Inspect routing and API structure.
- Inspect current dashboards.
- Inspect content-studio upload/extraction flow.
- Inspect `catalog` adapter structure.
- Inspect `pathways` recommendation logic.
- Inspect assistant/RAG implementation.
- Inspect virtual-lab architecture.
- Inspect edge/offline implementation.
- Run the existing application.
- Run the existing test suite.
- Capture baseline build/test status.

### Deliverable
Create an internal implementation map in the agent response or project notes:

- Existing reusable components
- Existing reusable services
- Required additions
- Potential conflicts
- Files likely to be modified

### Do not

- Do not refactor unrelated code.
- Do not rename large sections of the project.
- Do not introduce a new framework.

---

## PHASE 1 — Competency Domain Foundation

### Goal
Create the competency model without disturbing current learning features.

### Implement

- Competency definitions
- Categories
- Role-to-competency requirements
- Learner competency profile
- Competency evidence structure
- Competency score/trend representation
- Related competency relationships

### Frontend
Add the minimum reusable competency UI:

- competency card
- score/requirement display
- gap indicator
- competency detail page

### Acceptance criteria

- A role can have required competencies.
- A learner can have current competency records.
- A learner can see required/current/gap.
- Data is persisted through the backend.
- No existing catalogue/pathway/content feature breaks.

---

## PHASE 2 — Evidence & Assessment Integration

### Goal
Connect existing assessments to competency evidence.

### Implement

- Map quiz/assessment questions to competencies.
- Record assessment result by competency.
- Store evidence records.
- Calculate deterministic competency scores.
- Show evidence breakdown.

### Scoring principle

Use a transparent rule-based system. Keep it simple enough to explain during the hackathon.

Example concept:

> knowledge evidence + practical evidence + historical evidence → weighted competency score

Do not claim a scientifically validated formula unless one exists.

### Acceptance criteria

A learner completes an assessment and ORBIS can answer:

- Which competency was tested?
- What was the result?
- What evidence supports the competency score?
- What gap remains?

---

## PHASE 3 — Content Studio → Competency Mapping

### Goal
Connect existing AI-generated learning material to competencies.

### Implement

- Competency selection during content creation/review.
- Competency tags on questions.
- Competency tags on cases.
- Source reference for generated items.
- Review/publish workflow preservation.

### Acceptance criteria

Trainer can:

> Upload → Extract → Generate MCQs → Map Competencies → Review → Publish

Generated content remains traceable to the source material.

---

## PHASE 4 — Competency-Driven Recommendations

### Goal
Upgrade the existing `pathways` engine from course recommendation to competency intervention recommendation.

### Inputs

- Role
- Required competency
- Current competency
- Gap
- Evidence
- Learning history
- Available catalogue
- Future-skill metadata where available

### Outputs

- Recommended next actions
- Ordered pathway
- “Why this?” explanation
- Priority/rationale

### Acceptance criteria

The learner sees recommendations that explicitly connect:

> role requirement → gap → evidence → intervention

Existing recommendation/vector-search functionality must remain intact.

---

## PHASE 5 — Competency Lab Engine

### Goal
Build the reusable simulation infrastructure.

### Implement

- Scenario definition format
- Scenario events
- Decision options
- Branching
- Consequences
- Session persistence
- Decision history
- Rubric structure
- Evaluation output

### Frontend
Build reusable lab UI:

- scenario intro
- context/information panel
- timeline/event area
- decision cards
- consequence state
- progress indicator
- evidence/evaluation screen

### Acceptance criteria

At least one scenario can run end-to-end with branching and persisted decisions.

---

## PHASE 6 — Build Statistical Crisis Lab

### Goal
Create the flagship ORBIS experience.

### Implement

At least 4–6 scenario stages:

1. Initial statistical challenge
2. Resource/response-rate issue
3. Data-quality issue
4. Time/deadline pressure
5. Stakeholder pressure
6. Final resolution

Every decision should map to one or more competencies.

### Evaluation

At minimum:

- Statistical reasoning
- Data quality
- Decision making
- Risk management

Add other competencies when useful.

### Acceptance criteria

The lab can produce a meaningful competency evidence record.

---

## PHASE 7 — Build Data Detective Lab

### Goal
Create a practical data-quality experience.

### Implement

Use synthetic data only.

Learner should interactively identify:

- duplicate rows
- missing data
- impossible values
- inconsistencies
- suspicious outliers

Use the existing virtual-lab architecture where practical instead of creating duplicate Python/SQL execution infrastructure.

### Acceptance criteria

Completion creates competency evidence linked to Data Quality and related skills.

---

## PHASE 8 — Continuous Reassessment & Training Effectiveness

### Goal
Complete the feedback loop.

### Implement

- Baseline competency score
- Intervention tracking
- Post-intervention assessment
- Competency improvement calculation
- Evidence comparison
- Trend chart
- Training effectiveness summary

Example UI:

> Data Quality
>
> **54 → 76**
>
> **+22 improvement**

### Acceptance criteria

The system can show the relationship between:

> baseline → intervention → reassessment → outcome

---

## PHASE 9 — Dashboard & Workforce Intelligence Upgrade

### Goal
Make the learner/admin dashboards tell the new ORBIS story.

### Learner dashboard

Prioritize:

- competency gaps
- evidence
- next best action
- learning progress
- lab progress
- improvement

### Admin dashboard

Prioritize:

- workforce competency distribution
- critical gaps
- training effectiveness
- department/role views
- emerging skills where data exists

### Acceptance criteria

The dashboards should not look like generic LMS analytics dashboards.

---

## PHASE 10 — Assistant Context Upgrade

### Goal
Make the existing assistant understand the new ORBIS model.

### Implement

Assistant should be able to explain:

- competency scores
- evidence
- gaps
- recommendations
- current lesson material
- assessment feedback

Preserve RAG, multilingual, and voice features.

### Acceptance criteria

Assistant explanations agree with system-of-record competency values and do not invent scores.

---

## PHASE 11 — Future Skills + Competency Drift

### Goal
Add strategic intelligence after the MVP loop is stable.

### Implement only if core phases are stable

- Competency drift detection
- Future Skill Radar
- Refresher recommendations

Do not let this phase delay the hackathon-critical flow.

---

## PHASE 12 — ORBIS Edge / Offline Stretch

### Goal
Preserve and refine offline capability as a secondary deployment feature.

### Implement only after the main demo is stable

- Pack download
- Cached content
- Selected offline assessments/labs
- Progress queue
- Sync on reconnect

Do not allow offline work to destabilize the main online application.

---

# 30. Final Acceptance Criteria

ORBIS is ready for the main hackathon demo when this complete journey works:

```text
Official Login
   ↓
Role & Competency Profile
   ↓
Assessment
   ↓
Evidence-backed Gap
   ↓
Personalized Recommendation
   ↓
Video / Learning Material
   ↓
AI Tutor
   ↓
Quiz
   ↓
Statistical Crisis Lab
   ↓
Real Decisions
   ↓
Consequences
   ↓
Competency Evidence
   ↓
Reassessment
   ↓
Competency Improvement
   ↓
Admin Training Effectiveness
```

The full journey must work using seeded/demo data even if external government integrations are mocked.

---

# 31. Hackathon MVP Priority

## Must work

1. Competency profile
2. Assessment
3. Skill-gap engine
4. Learning/video module
5. AI quiz generation
6. Statistical Crisis Lab
7. Data Detective Lab
8. Evidence-based competency scoring
9. Reassessment + improvement
10. Mock iGOT catalogue/integration
11. Learner dashboard
12. Admin competency/training-effectiveness dashboard

## High-value if stable

- Competency graph visualization
- “Why this recommendation?”
- Future Skill Radar
- Competency drift
- AI assistant context awareness

## Stretch

- Offline Edge
- Voice enhancements
- More labs
- More scenario branches
- Device-to-device sync

---

# 32. Explicit Anti-Scope-Creep Rules

The agent MUST NOT:

- Rewrite the whole project.
- Replace the existing framework.
- Create a parallel ORBIS application.
- Duplicate existing user/course/content models unnecessarily.
- Build eight independent simulation systems.
- Add unnecessary microservices.
- Add VR/3D.
- Add multiplayer.
- Build facial/emotion detection.
- Build an enormous predictive AI system before core functionality works.
- Depend on live iGOT APIs that are not authorized/available.
- Hard-code secrets.
- Make LLMs the source of truth for competency scores.
- Remove videos.
- Remove the AI tutor.
- Remove the existing content studio.
- Remove current recommendation functionality.
- Turn ORBIS into a children’s game UI.

---

# 33. Master Agent Execution Prompt

Use the following as the **direct execution instruction** for the coding agent:

```text
You are modifying the EXISTING ORBIS code base.

Do NOT start a new project.
Do NOT rewrite the application from scratch.
Do NOT replace the existing stack.
Do NOT remove working features unless a specific conflict requires it.

The product direction has changed from an AI-centered personalized LMS to an AI-powered Competency Intelligence and Experiential Learning Platform for India's Official Statistical System.

The new product center is DEMONSTRATED COMPETENCY.

The existing learning ecosystem must remain.

Core product loop:
ASSESS → DIAGNOSE → LEARN → PRACTICE → DECIDE → MEASURE → IMPROVE

Preserve and extend these existing areas:
- catalog / features/catalog
- pathways / features/pathways
- content / features/content-studio
- assistant / features/assistant
- analytics / features/dashboard-learner and features/dashboard-admin
- features/virtual-lab
- edge / features/edge

Before changing code, inspect the full repository and determine what already exists. Reuse existing models, services, components, APIs, auth, design system, tests, and state management whenever possible.

Execute the work PHASE BY PHASE according to this PRD.

For every phase:
1. Inspect relevant existing code.
2. State the implementation plan briefly.
3. Modify only the necessary files.
4. Run migrations if required.
5. Run backend tests.
6. Run frontend type/lint/build checks.
7. Validate changed API contracts.
8. Fix regressions.
9. Verify the current user flow still works.
10. Report what changed, what was tested, and any remaining risk.
11. Only then move to the next phase.

Do not silently skip a broken phase.
Do not pretend an integration is live when it is mocked.
Do not invent undocumented iGOT endpoints.
Do not use an LLM as the authoritative source for competency scores.

Competency scores must be explainable from evidence and deterministic rubrics.

The major differentiator is the reusable Experiential Competency Lab engine.
Do NOT implement separate hard-coded game applications.
Build one reusable scenario engine and configure multiple professional labs through data/configuration.

The first two labs to implement are:
1. Statistical Crisis Lab — flagship
2. Data Detective Lab — practical data-quality assessment

Keep videos, documents, AI tutor, quiz generation, personalized learning, iGOT catalogue integration, dashboards, and virtual lab functionality.

Do not make offline the main product identity. Treat ORBIS Edge as stretch/secondary.

Do not make history games the central concept.

The main demonstrable experience must be:

Role → Competency Profile → Assessment → Gap → Learning → Quiz → Competency Lab → Decision → Consequence → Evidence → Reassessment → Improvement → Admin Training Effectiveness

For the hackathon, prioritize depth and end-to-end coherence over breadth.

When an existing implementation can support a requirement, EXTEND it rather than replacing it.

When a new model/app is genuinely required, first confirm no equivalent exists. Prefer a clean separation such as a competency domain and simulation domain only when the existing architecture does not already provide those capabilities.

The final application should feel like:
A competency intelligence system with an integrated learning ecosystem and professional simulation engine.

It must NOT feel like:
An LMS with games added to it.

Start with PHASE 0 and do not jump ahead until the repository audit and baseline validation are complete.
```

---

# 34. Definition of Done

The refactor is complete when:

- Existing ORBIS learning features remain functional.
- Competencies are represented as first-class data.
- Learner competency profiles are evidence-backed.
- Assessments contribute competency evidence.
- Recommendations are competency-driven.
- Content Studio outputs can be competency-mapped.
- Videos remain in the learning experience.
- AI Tutor remains functional.
- iGOT remains an external learning ecosystem/adapter layer.
- Competency Labs run through a reusable simulation engine.
- Statistical Crisis Lab works end-to-end.
- Data Detective works end-to-end.
- Competency scores are explainable.
- Reassessment demonstrates measurable change.
- Admin dashboard measures intervention effectiveness.
- Existing tests/builds continue to pass or all regressions are explicitly resolved.
- No undocumented live integration claims are made.

## Final product statement

> **ORBIS transforms capacity building from learning completion into demonstrated competency by combining competency intelligence, personalized learning, experiential professional simulations, evidence-based assessment, and continuous measurement.**
