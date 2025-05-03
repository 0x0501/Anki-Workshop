// get all the decks from API end point

import { checkRole } from '$lib/api';
import { UserRole } from '$lib/database/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();

    console.log('layout [server] run.')
	try {
		// all the operations under decks/* need root permission
		checkRole(session, UserRole.Root);
	} catch (e) {
		const error = e as { status?: number; message?: string };

		return {
			status: 'error',
			data: null,
			error: {
				code: error.status || 500,
				message: error.message || '服务器错误'
			}
		};
	}
};
