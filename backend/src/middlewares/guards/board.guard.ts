import type { Response, Request, NextFunction, RequestHandler } from 'express';
import { GlobalRole, type ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';

export function authorizeBoardRole(
	allowedRoles: ProjectRole[],
): RequestHandler {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const authReq = req as unknown as AuthenticatedRequest;
			const userId = authReq.user.sub;
			const email = authReq.user.email;

			const boardId = authReq.params.boardId ?? authReq.body.boardId;
			const columnId =
				authReq.params.colId ??
				authReq.params.columnId ??
				authReq.body.columnId;

			if (!boardId && !columnId) {
				throw new Error('Board ID or Column ID is required for authorization');
			}

			if (boardId && typeof boardId !== 'string') {
				throw new Error('Invalid Board ID format');
			}

			if (columnId && typeof columnId !== 'string') {
				throw new Error('Invalid Column ID format');
			}

			let resolvedBoardId = boardId ?? '';

			if (columnId) {
				const workflow = await db.workflow.findUnique({
					where: {
						id: columnId,
					},
					select: {
						boardId: true,
					},
				});

				if (!workflow) {
					throw new Error('Workflow not found for authorization');
				}

				resolvedBoardId = workflow.boardId;
			}

			const board = await db.board.findUnique({
				where: {
					id: resolvedBoardId,
				},
				select: {
					projectId: true,
				},
			});

			if (!board) {
				throw new Error('Board not found for authorization');
			}

			const user = await db.user.findUnique({
				where: {
					email,
				},
			});

			const membership = await db.projectMember.findUnique({
				where: {
					uniqueUser: {
						projectId: board.projectId,
						userId,
					},
				},
			});

			if (!user) {
				throw new Error('User does not exists');
			}

			if (!membership) {
				if (user.globalRole !== GlobalRole.GLOBAL_ADMIN) {
					throw new Error('Not a global user');
				}
			} else {
				if (!allowedRoles.includes(membership.role as ProjectRole)) {
					throw new Error('Insufficient Priviledges');
				}
			}

			next();
		} catch (err) {
			next(err);
		}
	};
}
