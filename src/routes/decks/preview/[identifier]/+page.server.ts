// Get front and back code from server

import { RESTfulApiBase } from '$lib/api';
import type { PageServerLoad } from './$types';

export type DeckPreviewCode = {
	data: {
		deck_front_preview_code: string;
		deck_back_preview_code: string;
	};
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	console.log('Fetching deck preview code for identifier:', params.identifier);

	const response = await fetch(`${RESTfulApiBase}/decks/preview?deck_id=${params.identifier}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	// Add error handling for non-OK responses
	if (!response.ok) {
		const errorText = await response.text();
		console.error('Fetch failed:', response.status, response.statusText, errorText);
		// Depending on requirements, you might throw an error or return a specific structure
		throw new Error(`Failed to fetch deck preview: ${response.status} ${response.statusText}`);
	}

	const deckPreviewCode = await response.json();

	console.log('Received deck preview code:', deckPreviewCode);

	return {
		deckPreviewCode: deckPreviewCode as DeckPreviewCode
	};
};
