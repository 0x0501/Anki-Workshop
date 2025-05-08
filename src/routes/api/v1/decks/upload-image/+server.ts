import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { RESTfulApiErrorCode, type RESTfulApiResponse } from '$lib/api.js';
import { v4 as uuidv6 } from 'uuid';

// This endpoint will handle receiving image data (Data URL),
// converting it to a suitable format (e.g., WebP), and uploading it to Cloudflare R2 (or local equivalent).

const verifyPostSchema = z.object({
	deckCoverImageBlob: z.instanceof(File)
});

export async function POST({ request, platform }) {
	try {
		// when we send file, we use `formData` method
		const data = await request.formData();

		const result = verifyPostSchema.safeParse(Object.fromEntries(data));

		if (!result.success) {
			return json({
				status: 'error',
				data: null,
				error: {
					code: RESTfulApiErrorCode.IllegalInput,
					message: '请求参数错误，deckCoverImageBlob不存在或解析错误'
				}
			} as RESTfulApiResponse);
		}

		const arrayBuffer = await result.data?.deckCoverImageBlob.arrayBuffer();
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

		const bucketObjectKey = `${uuidv6()}.webp`;

		/**
		 * Upload .webp image to R2 bucket. For security reason, we must enable CORS protection on
		 * Cloudflare R2 Bucket panel. The Node.js version of Buffer need to convert to ArrayBuffer
		 */
		const saveResult = await bucket.put(bucketObjectKey, await webpBlob.arrayBuffer(), {
			httpMetadata: {
				contentType: 'image/webp'
			}
		});

		console.log(saveResult);

		if (!saveResult.uploaded) {
            console.log('bucket error')
			return json({
				status: 'error',
				data: null,
				error: {
					code: RESTfulApiErrorCode.IllegalAccess,
					message: `Cloudflare R2存储失败，Key：${bucketObjectKey}`
				}
			} as RESTfulApiResponse);
		} else {
            console.log('bucket success')
            return json({
				status: 'success',
				data: `${platform.env.R2_PUBLIC_LINK}/${bucketObjectKey}`,
				error: null
			} as RESTfulApiResponse);
		}
		// In local development, this might be a path to a locally served file.
		// const r2ImageUrl = 'https://your-r2-public-access-url/path/to/uploaded-image.webp'; // Replace with actual URL or local path

		// Return the public URL of the uploaded image
		// return json({ imageUrl: r2ImageUrl }, { status: 200 });
	} catch (error) {
		console.error('Error processing image upload:', error);
		return json({ error: 'Failed to upload image.' }, { status: 500 });
	}
}
