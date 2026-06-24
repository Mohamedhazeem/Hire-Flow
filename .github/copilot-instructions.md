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

## graphify

For any question about this repo's architecture, structure, components, or how to add/modify/find
code, your first action should be `graphify query "<question>"` when `graphify-out/graph.json`
exists. Use `graphify path "<A>" "<B>"` for relationship questions and `graphify explain "<concept>"`
for focused-concept questions. These return a scoped subgraph, usually much smaller than the full
report or raw grep output.

Triggers: "how do I…", "where is…", "what does … do", "add/modify a <component>",
"explain the architecture", or anything that depends on how files or classes relate.

If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read `graphify-out/GRAPH_REPORT.md`
only for broad architecture review or when query/path/explain do not surface enough context. Only read
source files when (a) modifying/debugging specific code, (b) the graph lacks the needed detail, or
(c) the graph is missing or stale.

Type `/graphify` in Copilot Chat to build or update the graph.
