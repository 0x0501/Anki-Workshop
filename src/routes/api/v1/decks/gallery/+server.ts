import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { decks } from '$lib/database/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	
};
