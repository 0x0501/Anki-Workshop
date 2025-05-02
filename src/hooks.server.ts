import { initializeDrizzle } from "$lib/database/server";
import type { Handle } from "@sveltejs/kit";
import { createAuthHandle, createAuthJsConfig } from "./auth";
import { sequence } from "@sveltejs/kit/hooks";

// export const handle = createAuthHandle({ providers: [] });

// First Handle: Initialize Drizzle and make it available via locals
const initializeDatabaseHandle: Handle = async ({ event, resolve }) => {
    const DB = event.platform?.env.DB;

    if (!DB) {
        // Handle case where D1 binding is missing (e.g., local dev without wrangler)
        if (process.env.NODE_ENV === 'development') {
            console.warn("D1 binding 'DB' not found. Database features may not work.");
            // Optionally, you could connect to a local SQLite DB here for dev
        } else {
            console.error("D1 binding 'DB' missing in production!");
            // Throwing an error might be appropriate in production
            throw new Error("Database connection failed: D1 binding missing.");
        }
        // Proceed without db if needed, or throw error
         // event.locals.db = null; // Mark db as unavailable
    } else {
         // Initialize Drizzle and attach client to locals for use in endpoints/load functions
        event.locals.db = initializeDrizzle(DB);
    }

    return resolve(event);
};

// Second Handle: Initialize and run Auth.js
// This needs to run *after* the DB might be initialized if Auth config needs it immediately
// However, our createAuthJsConfig *takes* the D1 binding, so it's fine.
const authHandle: Handle = async ({ event, resolve }) => {
    const DB = event.platform?.env.DB;
    if (!DB) {
         // Auth.js might still work for some parts without DB (e.g. JWT session validation)
         // but adapter-based operations will fail. Handle gracefully.
         console.warn("Auth.js running without D1 Database binding.");
         // Resolve without Auth.js or with limited functionality?
         // For simplicity, let's try to resolve normally, errors will occur on DB ops.
         // Or, you could pass a dummy config / skip Auth.js handle if D1 is missing
         return resolve(event);
    }

    // Create the specific config and handle for this request using the D1 instance
    const authJsConfig = createAuthJsConfig(DB);
    const handleAuth = createAuthHandle(authJsConfig);

    // Run the Auth.js handle
    return handleAuth({ event, resolve });
};

// Chain the handles using sequence
export const handle = sequence(initializeDatabaseHandle, authHandle);
