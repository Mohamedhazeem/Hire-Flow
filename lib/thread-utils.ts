const THREAD_DELIMITER = "_";

export function computeThreadId(idA: string, idB: string): string {
  const [first, second] = [idA, idB].sort();
  return `${first}${THREAD_DELIMITER}${second}`;
}

/**
 * Extract the other participant's user ID from a thread ID.
 * Uses prefix/suffix matching to handle user IDs that may contain the delimiter.
 */
export function getOtherUserId(
  threadId: string,
  userId: string,
): string | null {
  const prefix = userId + THREAD_DELIMITER;
  if (threadId.startsWith(prefix)) {
    return threadId.slice(prefix.length);
  }
  const suffix = THREAD_DELIMITER + userId;
  if (threadId.endsWith(suffix)) {
    return threadId.slice(0, threadId.length - suffix.length);
  }
  return null;
}

/**
 * Check whether the given user participates in this thread.
 * More reliable than `threadId.includes(userId)` which can produce false
 * positives when one user ID is a substring of another.
 */
export function participatesInThread(
  threadId: string,
  userId: string,
): boolean {
  return getOtherUserId(threadId, userId) !== null;
}

/**
 * Extract both participant IDs from a thread ID.
 * Returns null if the thread ID format is invalid.
 */
export function parseThreadParticipants(
  threadId: string,
): [string, string] | null {
  // The first participant ID is everything before the first occurrence of
  // the delimiter when matched with the last occurrence.
  // Strategy: try splitting on the delimiter. If exactly 2 parts, great.
  // Otherwise, the delimiter may appear within IDs — in that case we cannot
  // reliably parse without knowing at least one participant ID.
  const idx = threadId.indexOf(THREAD_DELIMITER);
  if (idx === -1) return null;
  const first = threadId.slice(0, idx);
  const rest = threadId.slice(idx + 1);
  if (!first || !rest) return null;
  return [first, rest];
}

/**
 * Validate that a thread ID has the correct structure.
 */
export function isValidThreadId(threadId: string): boolean {
  const idx = threadId.indexOf(THREAD_DELIMITER);
  if (idx === -1) return false;
  const first = threadId.slice(0, idx);
  const rest = threadId.slice(idx + 1);
  return first.length > 0 && rest.length > 0;
}
