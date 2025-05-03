// API Endpoint permission check

import { error } from '@sveltejs/kit';
import type { Session } from '@auth/sveltekit';
import { UserRole } from './database/schema';

export type ApiUserRole = UserRole | 'public'

export const RESTfulApiVersion = 1;

export const RESTfulApiBase = `/api/v${RESTfulApiVersion}`

export function checkPermission(session: Session | null, requiredRole: ApiUserRole): void {
	// 未登录用户
	if (!session || !session.user) {
		if (requiredRole === 'public') {
			return; // 公开权限允许未登录访问
		}
		throw error(401, '未授权：请登录');
	}

	// 检查用户权限
	const userPermissions = session.user.role || UserRole.User;
	if (userPermissions !== requiredRole) {
		throw error(403, '禁止访问：权限不足（Permission error 10001）');
	}
}

export function checkRole(session: Session | null, requiredRole: ApiUserRole): void {
	if (!session || !session.user || session.user.role !== requiredRole) {
		throw error(403, `禁止访问：权限不足（Permission error 10002）`);
	}
}

export enum RESTfulApiErrorCode {
	PermissionErrorCheck = 10001,
	PermissionErrorRole = 10002,
	IllegalAccess = 10003,
    NoRecordsMatched = 10004,
    IllegalInput = 10005,
    DBInsertError = 10006,
    DBDeleteError = 10007,
    DBUpdateError = 10008
}

export type RESTfulApiError = {
	code: RESTfulApiErrorCode;
	message: string;
};

export type RESTfulApiResponse = {
	status: 'success' | 'error';
	data: Object | null;
	error: RESTfulApiError | null;
};

// {
//     "status": "success" | "error",
//     "data": object | null, // 成功时的返回数据
//     "error": {
//       "code": number, // HTTP 状态码
//       "message": string // 错误信息
//     } | null
//   }
