// get all the decks from API end point

import { checkRole, RESTfulApiBase, type RESTfulApiResponse } from '$lib/api';
import { UserRole } from '$lib/database/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	const session = await locals.auth();

	try {
		// all the operations under decks/* need root permission
		checkRole(session, UserRole.Root);

		const response = await fetch(`${RESTfulApiBase}/decks`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result  = await response.json();
		console.log(`${RESTfulApiBase}/decks 请求成功`);
		console.log('RESULT:')
		console.log(result)
		// console.log(result);

		// transmit response data to pages

		return result as RESTfulApiResponse;
	} catch (e) {
		const error = e as { status?: number; message?: string };
		console.log(`${RESTfulApiBase}/decks: 请求失败`);
        console.log(error)

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
