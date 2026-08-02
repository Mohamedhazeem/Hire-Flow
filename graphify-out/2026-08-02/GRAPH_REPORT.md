# Graph Report - hire-flow-next  (2026-07-31)

## Corpus Check
- 732 files · ~319,653 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 108 nodes · 113 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41537f1f`
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

## God Nodes (most connected - your core abstractions)
1. `resolveApplication()` - 5 edges
2. `requireRole()` - 4 edges
3. `getUserApplicationDetail()` - 4 edges
4. `getUserApplicationByJobSlug()` - 4 edges
5. `handleGET()` - 3 edges
6. `handleDELETE()` - 3 edges
7. `createRecruiterJobColumns()` - 3 edges
8. `RecruiterJobRow` - 3 edges
9. `mapApplication()` - 3 edges
10. `FeaturedJobsGrid()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `resolveApplication()` --calls--> `getUserApplicationByJobSlug()`  [EXTRACTED]
  app/api/user/applications/[id]/route.ts → app/features/user/queries/user-application-queries.ts
- `resolveApplication()` --calls--> `getUserApplicationDetail()`  [EXTRACTED]
  app/api/user/applications/[id]/route.ts → app/features/user/queries/user-application-queries.ts
- `handleGET()` --calls--> `requireRole()`  [EXTRACTED]
  app/api/user/applications/[id]/route.ts → app/features/shared/api/require-role.ts
- `handleDELETE()` --calls--> `requireRole()`  [EXTRACTED]
  app/api/user/applications/[id]/route.ts → app/features/shared/api/require-role.ts
- `RecruiterJobsTable()` --calls--> `createRecruiterJobColumns()`  [EXTRACTED]
  app/features/recruiter/components/recruiter-jobs-table.tsx → app/features/recruiter/components/recruiter-job-columns.tsx

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (13): requireRole(), ResolvedSession, DELETE, GET, handleDELETE(), handleGET(), resolveApplication(), getUserApplicationByJobSlug() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (8): Actions, createRecruiterJobColumns(), STATUS_BADGE, EMPLOYMENT_TYPE_LABELS, RecruiterJobsTable(), WORK_MODE_LABELS, RecruiterJobListResult, RecruiterJobRow

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (6): JobDetail(), JobDetailProps, STATUS_BADGE, TABS, PageProps, RecruiterJobDetail

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (3): ParamHandler, RouteContext, SimpleHandler

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (4): childVariants, FeaturedJobsGrid(), FeaturedJobsGridProps, parentVariants

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (4): parentVariants, sectionVariants, Tip, tips

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (4): FAQ, faqs, parentVariants, sectionVariants

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (3): items, parentVariants, sectionVariants

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (3): CATEGORY_ICONS, childVariants, parentVariants

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (3): childVariants, parentVariants, steps

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): mockCompanyFindUnique, mockFindUnique, mockSession

## Knowledge Gaps
- **46 isolated node(s):** `PageProps`, `GET`, `DELETE`, `CATEGORY_ICONS`, `parentVariants` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `PageProps`, `GET`, `DELETE` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._