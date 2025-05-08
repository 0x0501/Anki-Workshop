export function formatDateFromTimestamp(timestamp: number, isMilliseconds = false) {
	const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // month counted from zero(0)
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function convertImageToWebP(blob: Blob): Promise<Blob | null> {
	try {
		const img = new Image();
		img.src = URL.createObjectURL(blob);
		await img.decode(); // wait until the image was decoded

		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Failed to get canvas context');
		}
		ctx.drawImage(img, 0, 0);

		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.6);
		});
	} catch (error) {
		console.error('Error converting image to WebP:', error);
		return null;
	}
}
