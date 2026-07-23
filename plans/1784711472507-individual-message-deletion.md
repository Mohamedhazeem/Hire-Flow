# Individual Message Deletion (Soft-Delete)

## Goal

Change single-message deletion from a hard `delete` to a soft-delete so the
receiver sees a placeholder instead of the message disappearing entirely.

## Behavior

- **Sender view:** placeholder "You deleted this message". Actual content
  (text + files) hidden. Message bubble stays in the chat.
- **Receiver view:** placeholder "`{senderName}` deleted this message". Actual
  content hidden.
- **Thread list preview:** if the latest message is deleted, show
  "Message deleted" instead of the actual content.
- **Pusher:** when a message is deleted, fire `message-deleted` on
  `private-thread-{threadId}` so the other participant's UI updates in
  real-time.

## Changes (ordered)

### 1. Schema — `prisma/schema.prisma`

Add `deletedAt` to the Message model:

```
model Message {
  ...
  deletedAt  DateTime?
  ...
}
```

After editing, run `npx prisma migrate dev --name add-message-deleted-at` then
`npx prisma generate`.

### 2. Repository types — `lib/repositories/interfaces.ts`

- Add `deletedAt: Date | null` to `MessageRow`.
- Add `receiverId: string` to `MessageIdOnly` (needed by `deleteSingleMessage`
  to know who to notify via Pusher).
- Add `markDeleted(messageId: string): Promise<unknown>` to
  `IMessageRepository`.

### 3. Repository — `lib/repositories/message-repository.ts`

- Add `deletedAt` to `messageSelect`.
- Implement `markDeleted(messageId: string)` — sets `deletedAt = new Date()`
  and pushes senderId into `hiddenFor`.
- Update `findById` to also select `receiverId`.

### 4. Service — `lib/services/message-service.ts`

**`deleteSingleMessage`** — replace the current `deleteById` call with:
1. `messageRepository.markDeleted(messageId)` — soft-deletes the message
   (sets `deletedAt` + pushes sender to `hiddenFor`).
2. `pusher.trigger("private-thread-{threadId}", "message-deleted", { messageId, threadId, senderId })` —
   notify the other participant.

**`getMessages` / `findByThreadId`** — no change needed; `hiddenFor` filter
already keeps the sender from seeing the message in queries, and
`deletedAt` is now part of `messageSelect`.

**`getThreadList` / `findLatestMessages`** — update the thread-preview logic:
if the latest message has `deletedAt != null`, show a sentinel string
`__MESSAGE_DELETED__` as content.

### 5. API handler — `lib/handlers/messages.ts`

`createMessageIdDeleteHandler` — no change needed (the handler calls
`deleteSingleMessage` and returns `ok({ deleted: true })`). The service
change is transparent.

### 6. MessageItem type — `components/chat/message-item.ts`

Add `deletedAt: string | null`.

### 7. MessageBubble — `components/chat/message-bubble.tsx`

- Add `isDeleted: boolean` and `deletedBy: string` props.
- When `isDeleted` is true, render a muted placeholder instead of the actual
  content and file attachments:
  - If `deletedBy === currentUserId` → "You deleted this message"
  - Otherwise → "`{deletedBy}` deleted this message"
- Keep the timestamp and delete button visible.

### 8. ChatMessageList — `components/chat/chat-message-list.tsx`

Pass `isDeleted={!!msg.deletedAt}` and `deletedBy={msg.senderId}` to
`MessageBubble`.

(This uses the existing `msg.senderId`; the placeholder text differentiates
between "You" vs `"{name}"` based on comparison with `currentUserId`.)

### 9. usePusherThread — `components/chat/use-pusher-thread.ts`

Add a `message-deleted` channel handler that:
- Updates the messages cache: sets `deletedAt` on the matching message.
- Updates the thread list cache: if the deleted message is the last message
  for that thread, set the preview to `"Message deleted"`.

### 10. Delete-message hook — `app/features/shared/hooks/use-messages.ts`

`createUseDeleteMessage` — Change `onSuccess` cache update:
- Instead of `filter`-ing the message out of the cache, update it
  in-place by setting `deletedAt` on the matching message.
- Keep the `invalidateQueries` call as a fallback.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Sender deletes own message | `hiddenFor` includes sender → `findByThreadId` hides it from sender. Client shows "You deleted this message" placeholder. |
| Receiver refreshes after deletion | `getMessages` returns message with `deletedAt` set → client renders placeholder. |
| Both participants already hid the thread (`hiddenFor`) | Message already hidden. Deletion is a no-op for the viewing user. |
| Delete while offline | `onSuccess` won't fire. `invalidateQueries` triggers a refetch on reconnect. |
| Sender deletes a file message | File url/content hidden from both sides via placeholder. |

## Migration

```bash
npx prisma migrate dev --name add-message-deleted-at
npx prisma generate
```

## Validation

1. Admin sends a message to Recruiter.
2. Admin deletes their own message.
3. Admin sees "You deleted this message" in their chat.
4. Recruiter (without refreshing) sees "{Admin name} deleted this message" in
   their chat.
5. On the thread list, the preview shows "Message deleted" if that was the
   latest message.
6. Same flow with Recruiter → User.
