import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// Auth.js session
	const session = await event.locals.auth();

    console.log('+layout.server.ts运行')
	return {
		session
	};
};
