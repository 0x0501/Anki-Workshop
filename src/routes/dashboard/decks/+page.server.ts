import { RESTfulApiBase, RESTfulApiVersion, type RESTfulApiResponse } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	console.log('re-run');
	try {
		const response = await fetch(`${RESTfulApiBase}/decks`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		console.log(`${RESTfulApiBase}/decks 请求成功`);
		// console.log(result);

		// transmit response data to pages

		return result as RESTfulApiResponse;
	} catch (e) {
		console.log(`${RESTfulApiBase}/decks: 请求失败`);
		console.log(e);
		return {
			status: 'error',
			data: null,
			error: {
				code: 500,
				message: '服务器请求失败'
			}
		};
	}
};
