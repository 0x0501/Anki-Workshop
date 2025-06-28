import { integer, real, sqliteTable, text, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccount } from '@auth/sveltekit/adapters';
import type { supportPlatformOption } from '../../interfaces/supportPlatformOption';
import { formatDateFromTimestamp } from '../../utils/helper';

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
	emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }), // Added for Auth.js
	image: text('image').notNull().default(''), // Added for Auth.js
	hashed_password: text('hashed_password').notNull(),
	created_at: text('created_at')
		.notNull()
		.$default(() => formatDateFromTimestamp(Date.now(), true)),
	updated_at: text('updated_at')
		.notNull()
		.$default(() => formatDateFromTimestamp(Date.now(), true))
		.$onUpdate(() => formatDateFromTimestamp(Date.now(), true)),
	role: integer('role').$type<UserRole>().notNull().default(UserRole.User)
});

export const decks = sqliteTable(
	'decks',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		// foreign key linking to user table
		deck_author_id: text('deck_author_id').references(() => users.id),
		deck_name: text('deck_name').notNull(),
		deck_description: text('deck_description').notNull(),
		// stored as serialized JSON Blob
		deck_tags: text('deck_tags'),
		deck_size: integer('deck_size').notNull().default(0),
		deck_card_count: integer('deck_card_count'),
		deck_price: real('deck_price'),
		deck_download_link: text('deck_download_link').notNull(),
		deck_compress_password: text('deck_compress_password'),
		deck_purchase_link: text('deck_purchase_link').notNull(),
		last_updated_date: text('last_updated_date')
			.notNull()
			.$default(() => formatDateFromTimestamp(Date.now(), true))
			.$onUpdate(() => formatDateFromTimestamp(Date.now(), true)),
		created_date: text('created_date')
			.notNull()
			.$default(() => formatDateFromTimestamp(Date.now(), true)),
		is_deck_on_sale: integer('is_deck_on_sale', { mode: 'boolean' }).default(false),
		deck_liked_by_people: integer('deck_liked_by_people').default(0),
		deck_cover_image_url: text('deck_cover_image_url'),
		// stored as serialized JSON Blob
		support_platform: text('support_platform')
			.notNull()
			.default('All' as supportPlatformOption),
		deck_front_preview_code: text('deck_front_preview_code').notNull(),
		deck_back_preview_code: text('deck_back_preview_code').notNull(),
	},
	(table) => [index('deck_name_idx').on(table.deck_name)]
);

export const workshop_settings = sqliteTable('workshop_setting', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	allow_user_register: integer('allow_user_register', { mode: 'boolean' }).notNull().default(true),
	enable_showing_follower: integer('enable_showing_follower', { mode: 'boolean' })
		.notNull()
		.default(true),
	enable_user_follow_func: integer('enable_user_follow_func', { mode: 'boolean' })
		.notNull()
		.default(true),
	enable_deck_favorite_func: integer('enable_user_favorite_func', { mode: 'boolean' })
		.notNull()
		.default(true),
	enable_online_study_func: integer('enable_user_favorite_func', { mode: 'boolean' })
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
		expires_at: integer('expires_at'),
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
	expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
});

export const verificationTokens = sqliteTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull().unique(), // Unique constrainteger is important
		expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [primaryKey({ columns: [table.identifier, table.token] })]
);
