import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { decks } from '$lib/database/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Update schema to expect deck_id as a string from URL search params
const verifyGetSchema = z.object({
	deck_id: z.string({
		required_error: 'deck_id必须存在',
		invalid_type_error: 'deck_id的类型必须为字符串'
	}).transform(val => parseInt(val, 10)) // Transform string to number
});

export const GET: RequestHandler = async ({ locals, url }) => {
	// Read deck_id from URL search parameters
	const deck_id = url.searchParams.get('deck_id');

    console.log('Received deck_id from query params:', deck_id);

	// Validate the deck_id using the updated schema
	const result = verifyGetSchema.safeParse({ deck_id });

	if (!result.success) {
		return json({
			status: 'error',
			data: null,
			error: {
				code: RESTfulApiErrorCode.IllegalInput,
				message: '请求参数错误: ' + result.error.errors[0].message // Include validation error message
			}
		} as RESTfulApiResponse, { status: 400 }); // Use 400 status for bad request
	}

	const deckResult = await locals.db.query.decks.findFirst({
		where: eq(decks.id, result.data.deck_id),
		columns: {
			deck_front_preview_code: true,
			deck_back_preview_code: true
		}
	});

	if (deckResult) {
		return json({
			status: 'success',
			data: deckResult,
			error: null
		} as RESTfulApiResponse);
	} else {
		return json({
			status: 'error',
			data: null,
			error: {
				code: RESTfulApiErrorCode.NoRecordsMatched,
				message: '未找到相关数据'
			}
		} as RESTfulApiResponse, { status: 404 }); // Use 404 status for not found
	}
};
