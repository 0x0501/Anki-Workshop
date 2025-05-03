import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { decks } from '$lib/database/schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const verifyDeleteSchema = z.object({
	ids: z.array(z.number()).min(1, '至少需要提供1个ID')
});

/**
 * @description Delete one deck or many decks, as DELETE method don't support body params, use POST instead
 */
export const DELETE: RequestHandler = async ({ locals, request }) => {
	// verify user input
	const data = await request.json();
	const result = verifyDeleteSchema.safeParse(data);
	if (!result.success) {
		return json({
			status: 'error',
			data: null,
			error: {
				code: RESTfulApiErrorCode.IllegalInput,
				message: '无效输入数据'
			}
		} as RESTfulApiResponse);
	}

	const { ids } = result.data;

	const decksDeleted = await locals.db.delete(decks).where(inArray(decks.id, ids)).returning();

	if (decksDeleted.length === ids.length) {
		return json({
			status: 'success',
			data: 'delete',
			error: null
		} as RESTfulApiResponse);
	} else {
		return json({
			status: 'error',
			data: null,
			error: {
				code: RESTfulApiErrorCode.NoRecordsMatched,
				message: `传入删除的ID length为${ids.length}, 已删除的Deck length为${decksDeleted.length}`
			}
		} as RESTfulApiResponse);
	}
};
