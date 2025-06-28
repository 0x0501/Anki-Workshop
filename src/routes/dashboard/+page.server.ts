import type { PageServerLoad } from './$types';
import { UserRole, users, workshop_settings } from '$lib/database/schema';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

// infer database schema into types
type WorkshopSettings = InferSelectModel<typeof workshop_settings>;

export const load: PageServerLoad = async (
	event
): Promise<{ system_settings: WorkshopSettings }> => {

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
			system_settings: new_settings[0]
		};
	} else {
		return {
			system_settings: settings
		};
	}
};

// Toggle actions
export const actions = {
	updateSetting: async ({ request, locals }) => {
		const data = await request.formData();
		const settingName = data.get('settingName') as string;

		// Read the boolean value using the settingName as the key
		const settingValueString = data.get('settingValue') as string;

		// console.log('[server] settingName = ' + data.get('settingName') as string);
		// console.log('[server] settingValue = ' + data.get('settingValue') as string);
		// Convert the string value ('true' or 'false') to a boolean
		const settingValue = settingValueString === 'true';

		// Validate settingName to prevent arbitrary column updates
		const validSettings = [
			'allow_user_register',
			'enable_showing_follower',
			'enable_user_follow_func',
			'enable_deck_favorite_func'
		];
		if (!validSettings.includes(settingName)) {
			// console.warn({ success: false, error: 'Invalid setting name' });
			return { success: false, error: 'Invalid setting name' };
		}

		try {
			// console.log('Update tables, settings tag name: ' + settingName);
			// console.log('Update tables, settings tag value: ' + settingValue)
			const result = await locals.db
				.update(workshop_settings)
				.set({ [settingName]: settingValue })
				.where(eq(workshop_settings.id, 2))
				.returning();
			// console.warn({ success: true });
			// output the result db value
			console.log(result)
			return { success: true };
		} catch (error) {
			// console.error('Database update failed:', error);
			return { success: false, error: 'Failed to update setting' };
		}
	}
};
