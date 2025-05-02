// Protect dashboard unless user is login in.
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async(event) => {
    const session = await event.locals.auth(); // Get session

    if (!session?.user) {
        // Not logged in, redirect to login page
        // Auth.js default signin page is /auth/signin, or use your custom /login
        throw redirect(303, '/login'); // Use 303 for POST->GET redirect after login
    }

    // User is logged in, return necessary data (including user info from session)
    // we can get these data by $props.data
    return {
        user: session.user // Pass user data to the page component
        // Load other dashboard-specific data here...
    };
}