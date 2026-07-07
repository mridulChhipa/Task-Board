import { afterEach } from 'node:test';

import { prisma } from '../lib/prisma';

/**
 * Shared Prisma client, loosely typed so tests can assign stub delegates
 * (e.g. `db.user = { findUnique: async () => null }`).
 *
 * Unit tests must call `restoreDbAfterEach()` inside their `describe` so
 * per-test stubs never leak into the next test. Integration tests that set
 * suite-wide stubs in `before()` should not call it.
 */
export const db = prisma as unknown as Record<string, unknown>;

const MODEL_KEYS = [
  'user',
  'session',
  'project',
  'projectMember',
  'board',
  'workflow',
  'task',
  'activity',
  'thread',
  'comment',
  'notification',
  'edgeConstraint',
] as const;

interface StubRecord {
  target: Record<string, unknown>;
  key: string;
  value: unknown;
}

const activeStubs: StubRecord[] = [];

/**
 * Replace `target[key]` for the current test. Restored by the hook that
 * `restoreDbAfterEach()` registers. Use for module singletons such as
 * `stub(notificationService, 'createNotification', impl)`.
 */
export function stub<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K],
): void {
  const record = target as Record<string, unknown>;
  activeStubs.push({
    target: record,
    key: key as string,
    value: record[key as string],
  });
  record[key as string] = value;
}

/**
 * Register an afterEach hook that resets every Prisma delegate (and anything
 * replaced via `stub()`) back to the real implementation. Call once inside
 * the suite's `describe` callback.
 */
export function restoreDbAfterEach(): void {
  const originals = new Map<string, unknown>(
    MODEL_KEYS.map((key) => [key, db[key]]),
  );

  afterEach(() => {
    for (const [key, value] of originals) {
      db[key] = value;
    }
    for (const record of activeStubs.splice(0).reverse()) {
      record.target[record.key] = record.value;
    }
  });
}
