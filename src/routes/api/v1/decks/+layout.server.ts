// 所有API遵循下面的返回格式

import { checkRole, type ApiUserRole } from '$lib/api';
import { UserRole } from '$lib/database/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, request }) => {
	const session = await locals.auth();
	const method = request.method;

	// 定义路由级权限
	const permissions: Record<string, { role: ApiUserRole }> = {
		GET: { role: UserRole.Root },
		POST: { role: UserRole.Root }
	};

	const routeConfig = permissions[method];
	if (routeConfig) {
		if (routeConfig.role) {
			checkRole(session, routeConfig.role);
		}
	}
	return {};
};
