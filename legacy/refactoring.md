# Documentation Refactoring Task

## Objective

Refactor the existing engineering documentation into a professional, spec-driven documentation structure suitable for a production-quality GitHub portfolio.

The current documentation consists primarily of AI-oriented implementation prompts. Transform it into engineering documentation without changing the project's behavior or implementation.

---

# Primary Sources

Use ALL of the following:

1. hire_flow_prompts.md
2. hire_flow_testing.md
3. The current codebase
4. manifest.md

Inspect at minimum:

- app/features/admin
- app/features/recruiter
- app/features/user
- app/features/public
- components/
- lib/
- prisma/schema.prisma
- middleware.ts
- package.json

The current codebase is the source of truth whenever it differs from the historical planning documents.

---

# Critical Rules

## DO NOT

- Change implementation logic.
- Change architecture.
- Change business rules.
- Change workflows.
- Rewrite technical decisions.
- Remove features.
- Invent new features.
- Simplify implementation.
- Reorder implementation phases.
- Delete useful information.

This is a documentation migration—not a redesign.

---

# Documentation Principles

The resulting documentation should read as if it were written by experienced software engineers, not AI prompts.

Remove AI-specific wording such as:

- Prompt to Agent
- Actionable Tasks
- Execute the following
- Ask the agent to...
- You should generate...
- etc.

Replace them with professional engineering documentation while preserving the original technical meaning.

---

# Documentation Structure

Create:

docs/
architecture/
technical-design.md

    specs/
        hire-flow-requirements.md

    implementation/
        implementation-tasks.md

    testing/
        testing-strategy.md

---

# 1. Architecture

File:

docs/architecture/technical-design.md

Move all project-wide technical information here.

Include:

- Technology stack
- Framework versions
- Project structure
- Folder conventions
- Authentication
- Authorization
- Middleware
- Role guards
- Prisma schema overview
- Database design
- Shared UI architecture
- Shared components
- API conventions
- Validation conventions
- Error handling
- Logging strategy
- File uploads
- Seed scripts
- Utility libraries
- Naming conventions
- Coding standards
- Cross-cutting concerns

Verify every section against the actual codebase.

If implementation differs from the prompt, document the implementation that exists today.

---

# 2. Specification

File:

docs/specs/hire-flow-requirements.md

This document describes WHAT the application does.

For every feature include:

- Overview
- Purpose
- User stories
- Functional requirements
- Business rules
- Constraints
- Roles involved
- Acceptance criteria
- Edge cases
- Success criteria

Use professional specification language.

Example:

"As a Recruiter, I want..."

Do not include implementation details.

Phases include functionality that evolved during implementation.

Cross-reference the current codebase and ensure every implemented feature, enhancement, UI change, business rule, and acceptance criterion is reflected in this specification, even if it was not originally planned.

If features changed scope, document the current behavior.

---

# 3. Implementation

File:

docs/implementation/implementation-tasks.md

This document explains HOW the application is built.

Preserve:

- Phase numbers
- Step numbers
- Existing implementation order

Convert every implementation step into atomic tasks.

Format:

TASK-2.3.1
TASK-2.3.2
TASK-2.3.3

Each task should include:

- Goal
- Related files
- Technical approach
- Dependencies
- Completion criteria

Keep all technical implementation details including:

- Prisma
- Validation
- Server Actions
- Route Handlers
- Transactions
- Rate limiting
- RBAC
- UI components
- React hooks
- Services
- APIs
- Forms
- State management

Remove only the AI prompt wrappers.

If the current implementation contains additional tasks, refactors, or enhancements—especially those introduced during each Phases — create new Task IDs while preserving the existing phase hierarchy.

Do not force the implementation document to match the historical prompt if the codebase has evolved beyond it.

---

# 4. Testing

File:

docs/testing/testing-strategy.md

Move all testing documentation here.

Preserve:

- Testing phases
- Manual testing
- Regression testing
- Integration testing
- Validation
- Commands
- Assertions
- Edge cases

If the current application includes additional implemented functionality, ensure corresponding test coverage is documented.

Do not remove or weaken existing tests.

---

# Codebase Verification (Required)

Before writing any documentation, thoroughly inspect the current codebase and compare it against `hire_flow_prompts.md`. Also check `manifest.md` to get additional details.

The current codebase is the source of truth.

Each **Phases** may contain numerous enhancements, fixes, refactors, and additional functionality that were implemented after the original planning document was written.

Your goal is to ensure the new documentation represents the **actual implemented application**, not merely the historical plan.

Identify and document:

- Features added after the original documentation
- Additional UI fields
- New filters
- Bulk operations
- Additional CRUD functionality
- Database schema changes
- Validation changes
- Business rule updates
- Authentication/authorization changes
- Middleware updates
- Shared components
- Shared utilities
- API changes
- Server Action ↔ Route Handler refactors
- Additional reusable abstractions
- UI improvements
- Naming changes
- Folder structure changes
- Performance improvements
- Any implementation divergence from the original documents

If a feature exists in the codebase but is missing from the original documentation:

- Add it to the appropriate Specification.
- Add its implementation details to the Implementation document.
- Add corresponding testing requirements to the Testing document.

Do not omit implemented functionality simply because it was not present in the historical planning documents.

The final documentation must accurately describe the application's current implementation while preserving the original development phases and implementation order.

---

# Remove Duplication

Avoid copying identical information across documents.

Instead:

Architecture
→ referenced by Specifications

Specifications
→ referenced by Implementation

Implementation
→ referenced by Testing

Only keep detailed information in its most appropriate location.

---

# Preserve Traceability

Maintain the relationship between the original documentation and the new documentation.

For example:

Original:
Phase 2
Step 2.3

Becomes:

TASK-2.3.1
TASK-2.3.2

Do not lose this mapping.

---

# Archive Original Files

Do not delete:

- hire_flow_prompts.md
- hire_flow_testing.md

Instead, add this banner to the top of both files.

> ⚠️ ARCHIVED
>
> This document has been superseded by the documentation inside the /docs directory.
>
> Source of truth:
>
> - docs/architecture/
> - docs/specs/
> - docs/implementation/
> - docs/testing/

Leave the remaining historical content unchanged.

---

# Final Deliverables

Produce:

✓ docs/architecture/technical-design.md

✓ docs/specs/hire-flow-requirements.md

✓ docs/implementation/implementation-tasks.md

✓ docs/testing/testing-strategy.md

Update:

✓ hire_flow_prompts.md

✓ hire_flow_testing.md

Finally, generate a migration report containing:

- Information moved
- Information merged
- Information updated from the codebase
- Features added from implementation
- Sections archived
- Any discrepancies found between the historical plan and the current application

No implementation logic should be changed during this task.
