import type { LayoutServerLoad } from './$types';
import { decks, workshop_settings } from '$lib/database/schema';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

type WorkshopSettings = InferSelectModel<typeof workshop_settings>;
type FullDeckData = InferSelectModel<typeof decks>;
export type DeckData = Omit<FullDeckData, 'created_date' | 'is_deck_on_sale'>;

export const load: LayoutServerLoad = async ({
	locals
}): Promise<{
	session: Awaited<ReturnType<typeof locals.auth>>;
	system_settings: WorkshopSettings;
	deck_data: DeckData[];
}> => {
	// Auth.js session
	const session = await locals.auth();

	console.log('+layout.server.ts运行');

	const settings = await locals.db.query.workshop_settings.findFirst({
		where: eq(workshop_settings.id, 2)
	});

	const decksResult = await locals.db.query.decks.findMany({
		columns: {
			created_date: false,
			is_deck_on_sale: false
		},
		where: eq(decks.is_deck_on_sale, true)
	});

	if (decksResult.length === 0) {
		throw error(404, 'No deck data was return from server.');
	}

	// if settings have not defined yet, create a new one.
	if (settings === undefined) {
		const new_settings = await locals.db
			.insert(workshop_settings)
			.values({
				allow_user_register: true,
				enable_showing_follower: true,
				enable_user_follow_func: true,
				enable_deck_favorite_func: true
			})
			.returning();

		return {
			session,
			system_settings: new_settings[0],
			deck_data: decksResult
		};
	} else {
		return {
			session,
			system_settings: settings,
			deck_data: decksResult
		};
	}
};
