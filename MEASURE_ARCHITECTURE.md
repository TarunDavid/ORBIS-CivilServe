# ORBIS Measurement Suite: Architecture & Implementation Guide
**AI-Powered Competency Intelligence & Experiential Simulation for India's Official Statistical System**

---

## 1. Executive Summary

In India's Official Statistical System (MOSPI, CSO, NSSO), government officials must possess both rigorous theoretical grounding and battle-tested operational judgment. Traditional training platforms stop at video completion and multiple-choice quizzes, creating an unverified gap between **learning** and **real-world statistical execution**.

The **ORBIS Measurement Suite** (Dev A) closes this loop by establishing an evidence-backed competency framework and a professional simulation engine adhering to the core principle:

$$\text{Evidence} \longrightarrow \text{Rubric} \longrightarrow \text{Score} \longrightarrow \text{Explanation}$$

Officials do not receive black-box scores. Instead, every competency rating on their **Digital Skill Passport** is backed by an immutable ledger of verifiable simulation directives, code executions, and data quality audits.

---

## 2. Core Architectural Loop

```
  [ASSESS] ──► [DIAGNOSE] ──► [LEARN] ──► [PRACTICE] ──► [DECIDE] ──► [MEASURE] ──► [IMPROVE]
      ▲                                                                                 │
      └─────────────────────────── Continuous Verification ─────────────────────────────┘
```

1. **ASSESS**: Official attempts experiential labs, policy simulations, and diagnostic evaluations.
2. **DIAGNOSE**: Real-time evaluation against role benchmarks identifies specific competency gaps (`Met`, `Gap`, `Critical Gap`).
3. **LEARN**: Direct integration links identified gaps to curated iGOT Karmayogi learning pathways.
4. **PRACTICE**: Sandboxed coding (Python/Pandas, ANSI SQL) and microdata auditing environments.
5. **DECIDE**: High-stakes crisis simulations requiring branching trade-offs between Statistical Integrity, Public Trust, and Market Timeliness.
6. **MEASURE**: Automated rubric evaluators compute performance metrics (Precision, Recall, F1, Dilemma Balances).
7. **IMPROVE**: Verified evidence records update the multi-axis SVG Competency Radar Chart and Official Competency Card.

---

## 3. SIH 26101 Competency Taxonomy

ORBIS implements the official four-tier competency taxonomy:

| Category | Competencies Seeded & Assessed | Proficiency Scale |
|---|---|---|
| **Statistical Foundations** | Survey Design (`STAT-SD`), Sampling Techniques (`STAT-SAMP`), National Accounts (`STAT-NA`), Price Statistics (`STAT-CPI`), Data Quality Frameworks (`STAT-DQ`) | Level 1 (Awareness)<br>Level 2 (Basic)<br>Level 3 (Working)<br>Level 4 (Advanced)<br>Level 5 (Authoritative Expert) |
| **Technical & Computational** | Python Data Analysis (`TECH-PY`), SQL Relational Database Queries (`TECH-SQL`), Data Visualization (`TECH-VIZ`), GIS / Spatial Analysis (`TECH-GIS`) | Level 1 to Level 5 |
| **Digital Governance** | National Data Governance (`GOV-NDGAP`), Cybersecurity & Data Privacy (`GOV-PRIV`), Digital Public Infrastructure (`GOV-DPI`) | Level 1 to Level 5 |
| **Behavioral & Executive** | Decision Making & Conflict Resolution (`BEHAV-DEC`), Leadership & Public Communication (`BEHAV-LEAD`) | Level 1 to Level 5 |

---

## 4. Flagship Experiential Competency Labs

### 4.1 Statistical Crisis War-Room Simulation (`BEHAV-DEC`)
*Scenario: Operation Embargo — The CPI Price Index Anomaly*
- **Embargo Countdown & Live Telemetry HUD**:
  - T-Minus countdown clock to live media telecast.
  - **4 Dynamic Metric Meters**:
    - *Statistical Integrity* (0-100%)
    - *Public Trust* (0-100%)
    - *Timeliness & Markets* (0-100%)
    - *Inter-Agency Protocol* (0-100%)
- **3-Stage Branching Decision Tree**:
  - **Stage 1 (Anomaly Detection)**: Validation pipeline flags a +42.8% surge in urban fuel sub-index 2 hours before release. Candidate chooses between *24-hour embargo freeze with field audit*, *release with caveat footnote*, or *partial flash release excluding suspect region*.
  - **Stage 2 (Verification Findings)**: Field team confirms price collectors transposed retail diesel prices with wholesale aviation fuel. Whistleblower allegations surface. Candidate chooses between *transparent technical errata disclosure* vs. *quiet silent overwrite*.
  - **Stage 3 (Institutional Governance)**: Establishing permanent safeguards via *automated statistical sanity bounds (>3σ rejection) and dual cryptographic sign-offs* vs. *manual peer-review checklists*.
- **Executive Rationale Submission**: Candidate drafts their strategic justification memo for the Chief Statistician and Cabinet Secretary before evaluation.

### 4.2 Microdata Quality Detective Workbench (`STAT-DQ`)
*Scenario: National Rural Health & Demographics Survey Audit*
- **Interactive Microdata Table**: 25 primary household survey records with column sorting, keyword search, and filter tabs (`All`, `Flagged`, `Clean`).
- **Defect Inspector & Classification Drawer**:
  - *Physiological Impossibility*: e.g. Respondent Age = 240 (Data-entry transposition).
  - *Physiological Inversion*: e.g. Systolic BP 45 < Diastolic BP 185.
  - *Duplicate Key*: e.g. Cloned identical respondent entries.
  - *Jurisdiction Mismatch*: e.g. State `RJ` paired with district ID prefix `TN-99`.
  - *Domain Outlier*: e.g. 52 dependents in a single household (>6σ variance).
- **Remediation Actions**: Candidate marks records for *Quarantine*, *Median Imputation*, *Duplicate Rejection*, or *Re-enumeration*.
- **Scoring**: Computes exact **Precision**, **Recall**, and **F1-Scores** against ground-truth defects.

### 4.3 Python & SQL Interactive Workspaces (`TECH-PY`, `TECH-SQL`)
- Monospace code workspace with pre-populated starter code and syntax hints.
- Database schema and sample CSV structure preview drawers.
- **Interactive Test Runner Simulator**: "Run & Validate Code" executes sandbox syntax validation and renders formatted terminal execution output.

### 4.4 Policy Writing Canvas (`STAT-SD`, `STAT-SAMP`)
- Structured memorandum canvas with real-time word counter and section validation.
- Blueprint checklist verifying sampling formulas (Neyman allocation, cluster stratifiers) and operational definitions.

---

## 5. The Digital Skill Passport & Verification Seal

### 5.1 Multi-Axis SVG Competency Radar Chart
- Custom SVG radar chart mapping an official's demonstrated competency score (green/mint polygon) directly against their role's required benchmark (cobalt dashed polygon) across all evaluated dimensions.
- High-contrast Neo-Clay styling, interactive axis labels, and tooltip levels.

### 5.2 Cryptographic Verification Seal
Every Official Competency Card generates a deterministic SHA-256 seal:
$$\text{Seal} = \text{IN-MOSPI-ORBIS-} \big[\text{SHA-256}(\text{official\_id} : \text{employee\_id} : \text{dept\_code})\big]_{0:24}$$
Example: `IN-MOSPI-ORBIS-49BD1888CA9BBFBA37E09A24`

### 5.3 Immutable Evidence Ledger
Every completed simulation or assessment generates a verifiable `EvidenceRecord`:
- Source Type (`competency_lab`, `knowledge_assessment`, `virtual_lab`)
- Raw Score (`/100`)
- Proficiency Level Awarded (1 to 5)
- Qualitative Rubric Feedback
- Timestamp and Unique Event Seal

### 5.4 Gap-to-Pathway Handoff
For any competency with an identified gap, the UI displays:
- Required level increase (`Needs +2 levels to meet role target`)
- Direct one-click action button: **"Bridge Gap via iGOT Pathways"** linking seamlessly to Dev B's recommended learning modules.

---

## 6. Verification & Automated Test Results

The suite includes complete end-to-end integration tests (`backend/test_flagship_e2e.py`):

```text
============================================================
FLAGSHIP EXPERIENTIAL LABS & EVIDENCE PIPELINE VERIFICATION
============================================================
[OK] Official Profile verified: test_e2e_official (Designation: Senior Statistical Officer)
[OK] Found Flagship Crisis Lab: 'Statistical Release Embargo Crisis Simulation' (Stages: 3)
[OK] Found Flagship Detective Lab: 'Microdata Quality Detective: Rural Health Audit' (Records: 25)

--- Testing Crisis Simulation Lab Flow ---
[OK] Crisis Lab Evaluated Score: 93/100
Telemetry Posture: Integrity: 95% | Trust: 85% | Timeliness: 70% | Coordination: 90%

--- Testing Data Detective Lab Flow ---
[OK] Data Detective Evaluated Score: 77/100
Audit Performance: Precision: 100.0% | Recall: 60.0% | F1-Score: 75.0%
Correctly Detected Defects: 3/5

--- Testing Evidence Aggregation & Competency Card ---
[OK] Total Evidence Records for Official: 6
[OK] Aggregated Competency Scores count: 2
  * Decision Making (BEHAV-DEC): Level 5/5
  * Data Quality Frameworks (STAT-DQ): Level 4/5

[OK] Generated Competency Card Verification Seal: IN-MOSPI-ORBIS-49BD1888CA9BBFBA37E09A24
[OK] Total Sealed Evidence in Ledger: 6
============================================================
ALL FLAGSHIP LAB & MEASUREMENT SUITE CHECKS PASSED PERFECTLY!
============================================================
```
