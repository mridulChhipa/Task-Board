import type { Request } from 'express';

import { db } from '../../config/db';
import { GlobalRole, type ProjectRole } from '../../types/project.types';
import { ForbiddenError, UnauthorizedError } from '../../errors';

/**
 * Core membership check shared by every resource guard: project members must
 * hold one of the allowed roles; global admins pass without a membership.
 * Both lookups run in parallel and fetch only the role columns.
 */
export async function authorizeMembership(
  projectId: string,
  userId: number,
  email: string,
  allowedRoles: ProjectRole[],
): Promise<void> {
  const [user, membership] = await Promise.all([
    db.user.findUnique({
      where: { email },
      select: { globalRole: true },
    }),
    db.projectMember.findUnique({
      where: {
        uniqueUser: {
          projectId,
          userId,
        },
      },
      select: { role: true },
    }),
  ]);

  if (!user) {
    throw new UnauthorizedError('User does not exists');
  }

  if (!membership) {
    if (user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
      throw new ForbiddenError('Not a global user');
    }
  } else if (!allowedRoles.includes(membership.role as ProjectRole)) {
    throw new ForbiddenError('Insufficient Priviledges');
  }
}

/**
 * Pull a non-empty string id out of req.params / req.body / req.query,
 * trying the given keys in order.
 */
export function resolveId(req: Request, keys: string[]): string | undefined {
  const sources = [req.params, req.body, req.query] as Array<
    Record<string, unknown>
  >;
  for (const source of sources) {
    if (!source) {
      continue;
    }
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }
  }
  return undefined;
}
