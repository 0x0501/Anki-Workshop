import type { LayoutServerLoad } from './$types';
import { decks, users, workshop_settings } from '$lib/database/schema';
import { eq } from 'drizzle-orm';
import type { DeckData, WorkshopSettings } from '$lib/database/schema/types';

export const load: LayoutServerLoad = async ({
	locals
}): Promise<{
	session: Awaited<ReturnType<typeof locals.auth>>;
	system_settings: WorkshopSettings;
	deck_data: DeckData[];
}> => {
	// Auth.js session
	const session = await locals.auth();

	const settings = await locals.db.query.workshop_settings.findFirst({
		where: eq(workshop_settings.id, 2)
	});

	// const decksResult = await locals.db.query.decks.findMany({
	// 	columns: {
	// 		deck_author_id: false,
	// 		created_date: false,
	// 		is_deck_on_sale: false
	// 	},
	// 	where: eq(decks.is_deck_on_sale, true)
	// });

	const decksResult = await locals.db
		.select({
			id: decks.id,
			deck_name: decks.deck_name,
			deck_description: decks.deck_description,
			deck_tags: decks.deck_tags,
			deck_size: decks.deck_size,
			deck_card_count: decks.deck_card_count,
			deck_price: decks.deck_price,
			// deck_download_link: decks.deck_download_link,
			deck_purchase_link: decks.deck_purchase_link,
			// deck_compress_password: decks.deck_compress_password,
			deck_liked_by_people: decks.deck_liked_by_people,
			deck_cover_image_url: decks.deck_cover_image_url,
			support_platform: decks.support_platform,
			// deck_front_preview_code: decks.deck_front_preview_code,
			// deck_back_preview_code: decks.deck_back_preview_code,
			last_updated_date: decks.last_updated_date,
			deck_author_name: users.username,
			deck_author_image: users.image
		})
		.from(decks)
		.where(eq(decks.is_deck_on_sale, true))
		.innerJoin(users, eq(decks.deck_author_id, users.id));

	// if (decksResult.length === 0) {
	// 	error(404, { message: 'No deck data was return from server.' });
	// }

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
