// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from '$lib/database/schema/index';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db : DrizzleD1Database<typeof schema>
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database; // Changed D1 to DB to match wrangler.toml binding
			};
		}
	}
}

export {};
