<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import type { number } from 'zod';

	let img = $state<HTMLImageElement | null>(null);

	let cropper = $state<any>(null); // Store cropper instance in reactive state

	let imageHeight = $state(0);

	let imageWidth = $state(0);

	onMount(() => {
		if (!browser || !img) return;

		const initCropperWhenReady = () => {
			// @ts-ignore
			if (typeof window.Cropper !== 'undefined') {
				try {
					// @ts-ignore
					cropper = new window.Cropper(img, {
						aspectRatio: props.aspectRatio ? props.aspectRatio : 9 / 16,
						viewMode: 1,

						// @ts-ignore
						crop(event) {
							imageHeight = event.detail.height;
							imageWidth = event.detail.width;
						}
					});
				} catch (error) {
					console.error('Failed to initialize Cropper:', error);
				}
			} else {
				// Cropper not available yet, retry
				setTimeout(initCropperWhenReady, 50);
			}
		};

		// Wait for the image to load first
		if (img.complete) {
			initCropperWhenReady();
		} else {
			img.addEventListener('load', initCropperWhenReady);
		}

		// Cleanup
		return () => {
			if (cropper) {
				cropper.destroy();
				cropper = null;
			}
		};
	});

	export interface ImageCropProps extends Partial<SvelteHTMLElements['img']> {
		aspectRatio?: number;
	}

	let props: ImageCropProps = $props();

	type CroppedImageData = {
		blob: Blob | MediaSource;
		imageBlobUrl: string;
	};

	export function getCroppedBlobUrl(): Promise<CroppedImageData | null> {
		return new Promise((resolve) => {
			if (!cropper) {
				resolve(null);
				return;
			}

			const canvas: HTMLCanvasElement = cropper.getCroppedCanvas({
				width: imageWidth,
				height: imageHeight
			});

			if (canvas) {
				canvas.toBlob((blob: Blob | MediaSource | null) => {
					if (blob) {
						const imageUrl = URL.createObjectURL(blob);
						resolve({
							blob: blob,
							imageBlobUrl: imageUrl
						});
					} else {
						resolve(null);
					}
				}, 'image/jpeg');
			} else {
				resolve(null);
			}
		});
	}
</script>

<svelte:head>
	<link
		href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/2.0.0-alpha.2/cropper.css"
		rel="stylesheet"
	/>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/2.0.0-alpha.2/cropper.min.js"
	></script>
</svelte:head>

<div>
	<img bind:this={img} alt="deck-preview" src={props.src} />
</div>
