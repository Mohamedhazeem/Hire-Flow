# GitHub Copilot Instructions

## Primary Instruction Source

Before performing any task, read and follow:

- ./AGENT.md

AGENT.md is the authoritative source for:

- Architecture
- Coding standards
- Folder structure
- Naming conventions
- Next.js rules
- Prisma rules
- Better Auth rules
- TypeScript rules
- Feature development workflow
- Scope limitations

## Mandatory Retrieval

Before making code changes:

1. Read package.json
2. Read tsconfig.json
3. Read next.config.ts
4. Read prisma/schema.prisma
5. Read relevant feature files
6. Read existing implementations

# Rule

Respond ONLY with code blocks. No intro. No outro. Max 20 lines. Use placeholders.

Never create a new pattern when an existing pattern already exists.

Prefer consistency over novelty.

If instructions in this file conflict with AGENT.md, follow AGENT.md.
