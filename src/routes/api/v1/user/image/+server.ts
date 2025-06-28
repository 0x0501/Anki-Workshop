import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

const verifyPostSchema = z.object({
	avatarImageBlob: z.instanceof(File)
});

export const POST = async ({ request, platform }) => {
	try {
		const data = await request.formData();
		const result = verifyPostSchema.safeParse(Object.fromEntries(data));

		if (!result.success) {
			return json({
				status: 'error',
				data: null,
				error: {
					code: RESTfulApiErrorCode.IllegalInput,
					message: '请求参数错误，avatarImageBlob不存在或解析错误'
				}
			} as RESTfulApiResponse);
		}

		const arrayBuffer = await result.data.avatarImageBlob.arrayBuffer();

		const webpBlob = new Blob([arrayBuffer], { type: 'image/webp' });

		if (!platform?.env.anki_workshop_images) {
			return json({
				status: 'error',
				data: null,
				error: {
					code: RESTfulApiErrorCode.IllegalAccess,
					message: 'Cloudflare R2 未配置'
				}
			} as RESTfulApiResponse);
		}

		const bucket = platform?.env.anki_workshop_images;

		const bucketObjectKey = 'anki-workshop-user-avatar.webp';

		const saveResult = await bucket.put(bucketObjectKey, await webpBlob.arrayBuffer(), {
			httpMetadata: {
				contentType: 'image/webp'
			}
		});

		console.log(saveResult);

		if (!saveResult.uploaded) {
			console.log('bucket error');
			return json({
				status: 'error',
				data: null,
				error: {
					code: RESTfulApiErrorCode.IllegalAccess,
					message: `Cloudflare R2存储失败，Key：${bucketObjectKey}`
				}
			} as RESTfulApiResponse);
		} else {
			console.log('bucket success');
			return json({
				status: 'success',
				data: `${platform.env.R2_PUBLIC_LINK}/${bucketObjectKey}`,
				error: null
			} as RESTfulApiResponse);
		}
	} catch (error) {
		console.error('Error processing image upload (avatar):', error);
		return json({ error: 'Failed to upload image  (avatar).' }, { status: 500 });
	}
};
