import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (
    event
) => {
    // No server-side data needed for this page after moving system_settings to layout
    return {};
};
