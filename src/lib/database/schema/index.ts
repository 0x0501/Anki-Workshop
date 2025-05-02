import { int, real, sqliteTable, text, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { supportPlatformOption } from '$lib/interfaces/supportPlatformOption';
import type { AdapterAccount } from '@auth/sveltekit/adapters';

export enum UserRole {
	Root = 1,
	Admin = 2,
	User = 3
}

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()), // Changed to TEXT for Auth.js compatibility
	email: text('email').unique().notNull(),
	username: text('username').unique().notNull(),
	name: text('name'), // Added for Auth.js
	emailVerified: int('emailVerified', { mode: 'timestamp_ms' }), // Added for Auth.js
	image: text('image'), // Added for Auth.js
	hashed_password: text('hashed_password').notNull(),
	created_at: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`(current_timestamp)`)
		.$onUpdate(() => new Date().toString()),
	role: int('role').$type<UserRole>().notNull().default(UserRole.User)
});

export const decks = sqliteTable(
	'decks',
	{
		id: int('id').primaryKey({ autoIncrement: true }),
		// foreign key linking to user table
		deck_author_id: int('id').references(() => users.id),
		deck_name: text('deck_name').notNull(),
		deck_description: text('deck_description').notNull(),
		// stored as serialized JSON Blob
		deck_tags: text('deck_tags'),
		deck_size: int('deck_size').notNull().default(0),
		deck_card_count: int('deck_card_count'),
		deck_price: real('deck_price'),
		last_updated_date: text('last_updated_date')
			.notNull()
			.default(sql`(current_timestamp)`)
			.$onUpdate(() => new Date().toString()),
		created_date: text('created_date')
			.notNull()
			.default(sql`(current_timestamp)`),
		is_deck_on_sale: int('is_deck_on_sale', { mode: 'boolean' }).default(false),
		deck_liked_by_people: int('deck_liked_by_people').default(0),
		deck_cover_image_url: text('deck_cover_image_url'),
		// stored as serialized JSON Blob
		support_platform: text('support_platform')
			.notNull()
			.default(
				JSON.stringify({
					platform: 'All'
				} as supportPlatformOption)
			)
	},
	(table) => [index('deck_name_idx').on(table.deck_name)]
);

export const workshop_settings = sqliteTable('workshop_setting', {
	id: int('id').primaryKey({ autoIncrement: true }),
	allow_user_register: int('allow_user_register', { mode: 'boolean' }).notNull().default(true),
	enable_showing_follower: int('enable_showing_follower', { mode: 'boolean' })
		.notNull()
		.default(true),
	enable_user_follow_func: int('enable_user_follow_func', { mode: 'boolean' })
		.notNull()
		.default(true),
	enable_deck_favorite_func: int('enable_user_favorite_func', { mode: 'boolean' })
		.notNull()
		.default(true)
});

export const accounts = sqliteTable(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: int('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

export const sessions = sqliteTable('session', {
	sessionToken: text('sessionToken').notNull().primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: int('expires', { mode: 'timestamp_ms' }).notNull()
});

export const verificationTokens = sqliteTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull().unique(), // Unique constraint is important
		expires: int('expires', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [primaryKey({ columns: [table.identifier, table.token] })]
);
