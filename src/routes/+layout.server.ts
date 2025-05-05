import type { LayoutServerLoad } from './$types';
import { workshop_settings } from "$lib/database/schema";
import { eq, type InferSelectModel } from "drizzle-orm";

type WorkshopSettings = InferSelectModel<typeof workshop_settings>;

export const load: LayoutServerLoad = async (
    event
): Promise<{ session: Awaited<ReturnType<typeof event.locals.auth>>; system_settings: WorkshopSettings }> => {
	// Auth.js session
	const session = await event.locals.auth();

    console.log('+layout.server.ts运行')

    const settings = await event.locals.db.query.workshop_settings.findFirst({
        where: eq(workshop_settings.id, 2)
    });

    // if settings have not defined yet, create a new one.
    if (settings === undefined) {
        const new_settings = await event.locals.db
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
            system_settings: new_settings[0]
        };
    } else {
        return {
            session,
            system_settings: settings
        };
    }
};
