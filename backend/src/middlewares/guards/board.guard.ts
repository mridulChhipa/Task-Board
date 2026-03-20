import type { Response, Request, NextFunction, RequestHandler } from 'express';
import { GlobalRole, type ProjectRole } from '../../types/project.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { db } from '../../config/db';

async function authorizeForBoard(
	boardId: string,
	userId: number,
	email: string,
	allowedRoles: ProjectRole[],
): Promise<void> {
	const board = await db.board.findUnique({
		where: {
			id: boardId,
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
}

export function authorizeBoardIdRole(
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

			const rawBoardId = authReq.params.boardId ?? authReq.body.boardId;
			const boardId =
				typeof rawBoardId === 'string' && rawBoardId.trim() !== ''
					? rawBoardId
					: undefined;

			console.log('Authorizing user with id: ', userId, ' for boardId: ', boardId);

			if (!boardId) {
				throw new Error('Board ID is required for authorization');
			}

			if (typeof boardId !== 'string') {
				throw new Error('Invalid Board ID format');
			}

			await authorizeForBoard(boardId, userId, email, allowedRoles);
			next();
		} catch (err) {
			next(err);
		}
	};
}

export function authorizeColumnIdRole(
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

			const rawColumnId =
				authReq.params.colId ??
				authReq.params.columnId ??
				authReq.body.columnId;
			const columnId =
				typeof rawColumnId === 'string' && rawColumnId.trim() !== ''
					? rawColumnId
					: undefined;

			console.log('Authorizing user with id: ', userId, ' for columnId: ', columnId);

			if (!columnId) {
				throw new Error('Column ID is required for authorization');
			}

			if (typeof columnId !== 'string') {
				throw new Error('Invalid Column ID format');
			}

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

			await authorizeForBoard(workflow.boardId, userId, email, allowedRoles);
			next();
		} catch (err) {
			next(err);
		}
	};
}
