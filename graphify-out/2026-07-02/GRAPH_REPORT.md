# Graph Report - hire-flow-next  (2026-07-02)

## Corpus Check
- 457 files · ~170,354 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 440 nodes · 431 edges · 17 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29b6d5a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `Phase 2: Recruiter` - 59 edges
2. `Phase 3: User (Job Seeker)` - 34 edges
3. `Phase 4: Public Job Routes & Home Page` - 30 edges
4. `Phase 1: Admin` - 23 edges
5. `Technical Design` - 21 edges
6. `Phase 0: Foundation` - 20 edges
7. `Agent Rules (applied always)` - 19 edges
8. `Testing Strategy` - 15 edges
9. `Phase 2: Recruiter` - 13 edges
10. `Context Pack — Read Before Writing Any Code` - 12 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (17 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (59): Phase 2: Recruiter, TASK-2.0.1 — Pre-Phase 2 Refactoring, TASK-2.0.2 — Recruiter Layout & Sidebar, TASK-2.10.1 — Shared Notification Utility, TASK-2.10.2 — Notification Page & Dropdown, TASK-2.10.3 — Notification API, TASK-2.10.4 — Refactor Notifications in Existing Routes, TASK-2.11.1 — CSV Builder (+51 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (40): AI Integration, API Conventions, Authentication, Authorization & Middleware, Chat Components (`components/chat/`), Coding Standards, Core Models, CSS & Theming (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (35): Additional Unit Tests (Post-Implementation Additions), Auth Fixtures (`lib/test/auth-fixtures.ts`), CI Pipeline, Configuration, Coverage Thresholds, External Service Mocks (`lib/test/mocks.ts`), Global Setup (`lib/test/global-setup.ts`), IDOR (Insecure Direct Object Reference) Protection — Every Resource (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (34): Phase 3: User (Job Seeker), TASK-3.0a.1 — Infrastructure Audit, TASK-3.0b.1 — Schema Migration, TASK-3.1.1 — Profile Schema, TASK-3.1.2 — Profile Server Action, TASK-3.1.3 — Profile Form UI, TASK-3.1.4 — Profile API & Hooks, TASK-3.2.1 — Resume Schema (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (32): Audit Trail Integrity, Authentication & Sessions, Authorization & Data Boundaries, Concurrent Operations & Race Conditions, Data Integrity, Email & Notification Delivery, Error Handling & Information Leakage, File Upload & Download Edge Cases (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (30): Absolute Rules (unchanged), Agent Rules (applied always), Commands (unchanged), Context Pack — Read Before Writing Any Code, Core Layout & Shell, Cross‑Feature Reuse, Dependencies Protocol (unchanged), Error & API Utilities (+22 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (30): Phase 4: Public Job Routes & Home Page, TASK-4.0.1 — Public Route Group, TASK-4.0.2 — Privacy & Terms Pages, TASK-4.1.1 — Public Job Queries, TASK-4.1.2 — Public Job API, TASK-4.1.3 — Job Card Component, TASK-4.1.4 — Job Search Bar, TASK-4.1.5 — Filter Components (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (27): 0.1 Project Initialisation, 0.2 Database Schema, 0.3 Middleware & Route Guards, 0.4 Shared UI Primitives, 0.5 File Upload Infrastructure, 0.6 Database Seed Script, 0.7 State Management Infrastructure, 1.1 Admin API (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (23): Phase 1: Admin, TASK-1.1.1 — Admin Schema, TASK-1.1.2 — Admin User Queries, TASK-1.1.3 — Admin User API Routes, TASK-1.1.4 — Admin User Hooks, TASK-1.2.1 — Admin UI: Users Page, TASK-1.2.2 — Admin UI: Recruiters Page, TASK-1.3.1 — Admin Team Management Actions (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (22): Execution Order Summary (paste into Kilo Code in this sequence), `.github/workflows/test.yml`, Hire Flow Next — Test Suite Build Plan, Journeys (one spec file each, run against `user`/`recruiter`/`admin`/`anonymous` projects as appropriate), Phase 0 — Test Infrastructure, Phase 1 — Unit Tests: Pure Logic (no DB, no network, highest ROI first), Phase 2 — Integration Tests: API Routes + Real Test DB, Phase 3 — Component Tests (RTL, `*.dom.test.tsx`) (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (22): Execution Order Summary (paste into Kilo Code in this sequence), `.github/workflows/test.yml`, Hire Flow Next — Test Suite Build Plan, Journeys (one spec file each, run against `user`/`recruiter`/`admin`/`anonymous` projects as appropriate), Phase 0 — Test Infrastructure, Phase 1 — Unit Tests: Pure Logic (no DB, no network, highest ROI first), Phase 2 — Integration Tests: API Routes + Real Test DB, Phase 3 — Component Tests (RTL, `*.dom.test.tsx`) (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (21): Implementation Tasks, Phase 0: Foundation, TASK-0.0.1 — Project Initialisation & Dependencies, TASK-0.10.1 — Role Guard, TASK-0.1.1 — Prisma Schema, TASK-0.2.1 — Proxy Middleware, TASK-0.2.2 — Shared Route Constants, TASK-0.3.1 — Shared UI Primitives (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): 1. Architecture, 2. Specification, 3. Implementation, 4. Testing, Archive Original Files, Codebase Verification (Required), Critical Rules, DO NOT (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (13): 2.0 Recruiter Layout & Sidebar, 2.10 Notifications & Activity Feed, 2.11 CSV Export, 2.1 Company Profile CRUD, 2.2 Recruiter Team Management, 2.3 Job Posts CRUD, 2.4 Applicants View & Status Updates, 2.5 Recruiter Direct Messaging (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (10): 3.0a Infrastructure Audit, 3.0b Schema Migration, 3.1 User Profile, 3.2 Resumes & In-App Builder, 3.2a AI-Powered Resume Assistance, 3.3 Job Application Flow, 3.4 My Applications, 3.5 Application Detail, Withdraw & Message Recruiter (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (10): Audit Trail Integrity, Concurrent Operations & Race Conditions, Email & Notification Delivery, Error Handling & Information Leakage, File Upload & Download Edge Cases, Notification Permissions & Delivery, Pagination Boundary Tests, Phase 4 — Integration Tests: API Routes + Real Test DB (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (7): Authentication & Sessions, Authorization & Data Boundaries, Data Integrity, Input & Injection, Real-time & External Services, Security Audit Checklist (Manual), SEO & Public Access

## Knowledge Gaps
- **383 isolated node(s):** `Retrieval‑first (Always)`, `Shared Assets`, `Role Guard Requirement`, `State & Cache Rules (Updated for Spec‑Driven)`, `Graphify` (+378 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Implementation Tasks` connect `Community 11` to `Community 8`, `Community 0`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `Phase 2: Recruiter` connect `Community 0` to `Community 11`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `Phase 3: User (Job Seeker)` connect `Community 3` to `Community 11`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `Retrieval‑first (Always)`, `Shared Assets`, `Role Guard Requirement` to the rest of the system?**
  _383 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03389830508474576 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._