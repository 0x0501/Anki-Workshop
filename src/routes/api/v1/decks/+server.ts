import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { json, type RequestHandler } from '@sveltejs/kit';
import { number, string, z } from 'zod';
import { decks } from '$lib/database/schema/index';
/**
 * @descriptionAll Get the decks in database
 */
export const GET: RequestHandler = async ({ locals }) => {
	// for now no limitation was given
	const decks = await locals.db.query.decks.findMany();

	// if decks.length is 0, meaning we got empty decks
	return json({
		status: 'success',
		data: decks,
		error: null
	});
};

const verifyPostSchema = z.object({
	deck_author_id : z.string().nonempty('卡组作者不能为空'),
	deck_name: z.string().nonempty('卡组名称不能为空'),
	deck_description: z.string().nonempty('卡组描述不能为空'),
	deck_card_count: z.number().min(1, '卡片数量不能小于1'),
	deck_price: z.number().min(0.01, '卡组价格不能小于0.01'),
	is_deck_on_sale: z.boolean().default(false),
	// support_platform: serialized json object
	support_platform: z.string().nonempty('支持平台不能为空'),
	deck_cover_image_url: z.string().nonempty('卡组封面链接不能为空'),
	// deck_tags: serialized json object
	deck_tags: z.string().optional()
});

/**
 * @description create a new deck
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	const data = await request.json();

	const result = verifyPostSchema.safeParse(data);

	if (!result.success) {
		// print error to console
		console.log(`POST api/v1/decks`)
		console.log(result.error)
		console.log(data)
		return json({
			status: 'error',
			data: null,
			error: {
				code: RESTfulApiErrorCode.IllegalInput,
				message: `无效输入数据: ${result.error.message}`
			}
		} as RESTfulApiResponse);
	}

	// create a new deck, and store it it database
	const newDeck = await locals.db
		.insert(decks)
		.values({
			deck_name: result.data.deck_name,
			deck_author_id : result.data.deck_author_id,
			deck_card_count: result.data.deck_card_count,
			deck_price: result.data.deck_price,
			deck_cover_image_url: result.data.deck_cover_image_url,
			deck_tags: result.data.deck_tags ?? '',
			support_platform: result.data.support_platform,
			deck_description: result.data.deck_description,
			is_deck_on_sale: result.data.is_deck_on_sale
		})
		.returning();

	if (newDeck.length > 0) {
		return json({
			status: 'success',
			data: newDeck,
			error: null
		} as RESTfulApiResponse);
	} else {
		return json({
			status: 'error',
			data: newDeck,
			error: {
				code: RESTfulApiErrorCode.DBInsertError,
				message: `新建牌组失败，返回数字length为${newDeck.length}`
			}
		} as RESTfulApiResponse);
	}
};

/**
 * @description Modify a deck
 */
export const PUT: RequestHandler = async () => {
	return json({
		status: 'success',
		data: 'put',
		error: null
	});
};
