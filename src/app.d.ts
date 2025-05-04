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
				DB: D1Database; // Changed D1 to DB to match wrangler.toml binding,
				anki_workshop_images : R2Bucket // Cloudflare R2 bucket
				R2_PUBLIC_LINK : string
			};
		}
	}
}
import { DefaultSession } from '@auth/sveltekit'; // Import necessary types
import type { R2Bucket } from "@cloudflare/workers-types";

declare module '@auth/sveltekit' {
	interface User {
		id: string;
		role?: import('$lib/database/schema').UserRole;
	}

	interface Session {
		user: {
			id: string;
			role: import('$lib/database/schema').UserRole;
		} & DefaultSession['user'];
		anything: number;
	}

	interface JWT {
		id: string;
		role: import('$lib/database/schema').UserRole;
		anything: number;
	}
}

export {};
