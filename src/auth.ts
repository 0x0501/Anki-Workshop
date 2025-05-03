// Auth.js configuration

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { CredentialsSignin, SvelteKitAuth, type SvelteKitAuthConfig, type User } from '@auth/sveltekit';
import { initializeDrizzle } from '$lib/database/server';
import * as schema from '$lib/database/schema';
import type { Handle } from '@sveltejs/kit';
import CredentialsProvider from '@auth/sveltekit/providers/credentials';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types'; // Import D1Database type

// Define auth options - pass D1 instance via dependency injection from hooks
export function createAuthJsConfig(DB: D1Database): SvelteKitAuthConfig {
	const drizzleClient = initializeDrizzle(DB); // Get Drizzle instance connected to D1

	return {
		adapter: DrizzleAdapter(drizzleClient, {
			usersTable: schema.users,
			accountsTable: schema.accounts,
			sessionsTable: schema.sessions,
			verificationTokensTable: schema.verificationTokens
		}), // Use Drizzle adapter with tables
		providers: [
			CredentialsProvider({
				name: 'Credentials',
				credentials: {
					username: { label: 'Username', type: 'text' },
					password: { label: 'Password', type: 'password' }
				},
				async authorize(credentials) {
					if (!credentials?.username || !credentials.password) {
						return null;
					}
					const username = credentials.username as string;
					const password = credentials.password as string;

					// 1. Find user by username
					const user = await drizzleClient.query.users.findFirst({
						where: eq(schema.users.username, username)
					});

					if (!user) {
						console.log('User not found:', username);
						throw null; // User not found
					}

					if (!user.hashed_password) {
						console.log('User has no password set:', username);
						return null; // User created via OAuth, has no password
					}

					// 2. Verify password
					const validPassword = await bcrypt.compare(password, user.hashed_password);

					if (!validPassword) {
						console.log('Invalid password for user:', username);
						return null; // Invalid password
					}

					console.log('Credentials authorized for:', username);
					// 3. Return user object (without password!)
					// Auth.js expects id, name, email, image
					// The code below return the value to JWT (jwt callback)
					// and the return value of jwt callback goes into session callback
					// Path: adapter --> jwt --> session
					return {
						id: user.id,
						name: user.username,
						email: user.email,
						image: user.image,
						role : user.role
					} as User; // Explicitly cast to the augmented User type
				}
			})
		],
		session: {
			// strategy: 'database', // Use database sessions (recommended with adapter)
			strategy: 'jwt', // Or use JWT if preferred
			maxAge: 30 * 24 * 60 * 60, // 30 days
			updateAge: 24 * 60 * 60 // 24 hours
		},
		callbacks: {
			// Optional: Modify session object or JWT token
			async session({ session, token }) {
				// Add user ID and custom fields (like username) to the session object
				if (session.user && token) {
					session.user.id = token.id as string;
					session.user.role = token.role as schema.UserRole;
					// Query the full user object if needed to get username
					// const fullUser = await drizzleClient.query.users.findFirst({...});
					// if (fullUser) session.user.username = fullUser.username;
				}
				return session;
			},
			async jwt({ token, user }) {
				if (user) {
					// User is available on sign-in
					token.id = user.id;
					token.role = user.role
					// Add other custom claims
					// token.username = user.username;
				}
				return token;
			}
		},
		debug: false,
		// trustHost: true, // Use only if necessary behind a trusted proxy, prefer AUTH_TRUST_HOST env var
		secret: process.env.AUTH_SECRET // !! REQUIRED: Set in environment variables
		// debug: process.env.NODE_ENV === 'development', // Enable debug logs in dev
	};
}

// We export the handle creator, not the handle itself yet
// This avoids initializing Auth.js (and Drizzle) at the module level before D1 is available
export function createAuthHandle(config: SvelteKitAuthConfig): Handle {
	const { handle } = SvelteKitAuth(async (event) => {
		const db = initializeDrizzle(event.platform?.env.DB);
		const adapter = DrizzleAdapter(db, {
			usersTable: schema.users,
			accountsTable: schema.accounts,
			sessionsTable: schema.sessions,
			verificationTokensTable: schema.verificationTokens
		});
		// Merge the provided config with the adapter
		return {
			...config, // Spread the provided config
			adapter: adapter // Override or add the adapter
		};
	});
	return handle as Handle;
}
