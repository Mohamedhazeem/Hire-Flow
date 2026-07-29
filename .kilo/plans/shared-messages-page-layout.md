# Shared Messages Page Layout

Extract three duplicated messages page implementations into a shared `MessagesPageLayout` component. Role-specific pages become thin wrappers.

## Files

### Create

- `components/chat/messages-page-layout.tsx` — Shared split-panel layout with:
  - `ThreadListSkeleton` (currently duplicated 3x, byte-identical)
  - `ThreadListPanel` — header + optional search bar + thread list + empty state
  - Split-panel responsive layout (`-m-4 md:-m-6 lg:-m-8`)
  - Right-panel empty state ("Select a conversation…")
  - Accepts `threads: ThreadListItemData[]` to avoid coupling to role-specific types (the `as unknown as ThreadListItemData` cast moves from callers into the shared component's `ThreadListPanel`)

### Modify

- `app/(roles)/admin/messages/page.tsx`
- `app/features/recruiter/components/recruiter-messages-page.tsx`
- `app/features/user/components/user-messages-page.tsx`

## Props

```ts
type MessagesPageLayoutProps = {
  threads: ThreadListItemData[] | undefined;
  isLoading: boolean;
  userId: string;
  activeThreadId: string | null;
  basePath: string;
  searchEndpoint?: string; // undefined → no search bar (user role)
  panelDescription: string; // "Your conversations" | "Conversations with applicants"
  emptyListTitle: string;
  emptyListDescription: string;
  emptySelectDescription: string; // right-panel empty state text
  ThreadViewComponent: typeof AdminThreadView;
  threadHooks: ThreadViewHooks;
  onThreadSelect: (threadId: string) => void;
  onBack: () => void;
};
```

## Edge Cases Preserved

| Aspect              | Admin                                                            | Recruiter                                                            | User                                                       |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| Search bar          | ✅                                                               | ✅                                                                   | ❌ (no search endpoint)                                    |
| Panel subtitle      | "Your conversations"                                             | "Conversations with applicants"                                      | "Your conversations"                                       |
| Empty list text     | "Search for a user above…"                                       | "Go to a job's applicants…"                                          | "Recruiters will message you…"                             |
| Empty select text   | "Or start a new thread…"                                         | "Or search for an applicant…"                                        | "Click on a thread to view messages"                       |
| Empty title         | "No conversations yet"                                           | "No conversations yet"                                               | "No messages yet"                                          |
| `useThreadPresence` | Inside `ThreadListPanel`                                         | Inside `ThreadListPanel`                                             | At page level → moved into shared `ThreadListPanel`        |
| `isOnline`          | Inside `ThreadListPanel`                                         | Inside `ThreadListPanel`                                             | At page level → moved into shared `ThreadListPanel`        |
| Delete thread       | ✅ (in `SharedThreadView` hooks)                                 | ✅                                                                   | ❌ (no hook passed)                                        |
| Negative margin     | `-m-4 md:-m-6 lg:-m-8` (had redundant extra `-mr-8 -mb-8 -ml-8`) | `-m-4 md:-m-6 lg:-m-8`                                               | `-m-4 md:-m-6 lg:-m-8`                                     |
| Routing location    | `(roles)/admin/messages/page.tsx`                                | `features/recruiter/components/` exported as `RecruiterMessagesPage` | `features/user/components/` exported as `UserMessagesPage` |

## Tasks

1. Create `components/chat/messages-page-layout.tsx` with the shared component
2. Edit `app/(roles)/admin/messages/page.tsx` to thin wrapper (import shared layout, pass role-specific props)
3. Edit `app/features/recruiter/components/recruiter-messages-page.tsx` to thin wrapper
4. Edit `app/features/user/components/user-messages-page.tsx` to thin wrapper
5. Run `npx tsc --noEmit` then `npm run lint`

## Non-goals

- No schema changes, DB migrations, or new dependencies
- No changes to `SharedThreadView`, thread hooks, or queries
- No changes to `role-layout-client.tsx` or layout structure
- No changes to routing or page entry points
- No renaming of exported function names (preserves existing imports)
