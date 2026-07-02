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

If additional features were implemented that are missing from the prompt, include them.

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

If implementation changed in the current codebase, document the real implementation.

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

# Codebase Verification

Before writing documentation, inspect the implementation.

Identify:

- Features added after the original prompt
- Features removed
- Refactors
- Additional fields
- Database changes
- New APIs
- Middleware changes
- UI improvements
- Shared abstractions
- Naming changes

Update the documentation to match the current implementation.

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
