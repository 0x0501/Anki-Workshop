<script lang="ts">
	import {
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Dropzone,
		Heading,
		Helper,
		Hr,
		Input,
		Label,
		Modal,
		MultiSelect,
		Textarea,
		type SelectOptionType
	} from 'flowbite-svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import convertImageToWebp from '$lib/components/ImageCropper.svelte';
	import { RESTfulApiBase, type RESTfulApiResponse } from '$lib/api';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onDestroy, tick } from 'svelte';
	import { z } from 'zod';
	import CodeMirror from 'svelte-codemirror-editor';
	import { html } from '@codemirror/lang-html';
	import { basicSetup } from 'codemirror'; // Import basicSetup
	import type { StringifyOptions } from 'querystring';
	import { convertImageToWebP } from '$lib/utils/helper';

	// Define the extensions for CodeMirror
	let editorExtensions = [basicSetup, html()];

	// Store as JSON.stringify()
	let deckFrontPreviewCode = $state<string>();
	let deckBackPreviewCode = $state<string>();

	let selectedPlatform = $state([]);
	let supportPlatformList: SelectOptionType<string>[] = [
		{ value: 'All', name: '所有平台' },
		{ value: 'Windows', name: 'Windows' },
		{ value: 'iOS', name: 'iOS' },
		{ value: 'Android', name: '安卓' },
		{ value: 'MacOS', name: 'MacOS' }
	];

	let selectedTags = $state([]);
	let deckTagOptions = [
		{ value: 'CET-4', name: 'CET-4' },
		{ value: 'CET-6', name: 'CET-6' },
		{ value: '考研', name: '考研' },
		{ value: '考编', name: '考编' },
		{ value: '教资', name: '教资' },
		{ value: '英语', name: '英语' },
		{ value: '计算机', name: '计算机' },
		{ value: '模板', name: '模板' },
		{ value: '思维导图', name: '思维导图' }
	];

	interface DeckEditorProps {
		editorType: 'Create' | 'Edit';
		deckData?: DeckEditData;
	}

	export type DeckEditData = {
		deck_id?: number;
		deck_name: string;
		deck_author_id: string | undefined;
		deck_description: string;
		deck_card_count: number;
		deck_price: number;
		is_deck_on_sale: boolean;
		support_platform: string;
		deck_cover_image_url: string;
		deck_tags: string;
		deck_download_link: string;
		deck_compress_password: string;
		deck_purchase_link: string;
		deck_front_preview_code: string;
		deck_back_preview_code: string;
	};

	let props: DeckEditorProps = $props();

	let deckFileDownloadURL = $state('');
	let deckFilePassword = $state('');

	let deckPurchaseLink = $state('');

	let deckDescription = $state('');

	let deckName = $state('');
	let deckPrice = $state(0);
	let deckCount = $state(0);

	let formErrors = $state<{
		deckName?: string;
		deckPrice?: string;
		deckCount?: string;
		deckFileDownloadURL?: string;
		deckFilePassword?: string;
		deckPurchaseLink?: string;
		deckDescription?: string;
		selectedPlatform?: string;
		selectedTags?: string;
		deckFrontPreviewCode?: StringifyOptions;
		deckBackPreviewCode?: StringifyOptions;
		deckSnapshots?: string; // For the refinement error
	}>({});

	// Form input validation
	const deckSchema = z
		.object({
			deckName: z.string().nonempty('卡组名称不能为空'),
			deckPrice: z.number().min(0.01, '价格最少为0.01'),
			deckCount: z.number().min(1, '卡片数量最低为1张'),
			deckFileDownloadURL: z.string().nonempty('下载链接不能为空'),
			deckFilePassword: z.string(), // Optional for now
			deckPurchaseLink: z.string().nonempty('购买链接不能为空'), // Optional for now
			deckDescription: z.string().nonempty('卡组描述不能为空'),
			selectedPlatform: z.array(z.string()).min(1, '请选择至少一个支持平台'),
			selectedTags: z.array(z.string()).min(1, '请选择至少一个标签'),
			deckFrontPreviewCode: z.string().nonempty('正面预览代码不能为空'),
			deckBackPreviewCode: z.string().nonempty('背面预览代码不能为空')
		})
		.refine((data) => deckSnapshots.length > 0 && deckSnapshots.every((img) => img.isCropped), {
			message: '请上传至少一张已裁剪的卡组快照',
			path: ['deckSnapshots'] // Associate error with a conceptual field
		});

	const validateForm = () => {
		const result = deckSchema.safeParse({
			deckName,
			deckPrice,
			deckCount,
			deckFileDownloadURL,
			deckFilePassword,
			deckPurchaseLink,
			deckDescription,
			selectedPlatform,
			selectedTags,
			deckFrontPreviewCode,
			deckBackPreviewCode,
			deckSnapshots // Pass deckSnapshots for refinement
		});

		if (!result.success) {
			// Map Zod errors to formErrors state
			formErrors = result.error.issues.reduce(
				(acc, issue) => {
					// Zod path is an array of strings/numbers, join for simple field names
					const path = issue.path.join('.');
					// Handle the special 'deckSnapshots' path from refinement
					if (path === 'deckSnapshots') {
						acc.deckSnapshots = issue.message;
					} else {
						// Assuming path matches state variable names
						acc[path as keyof typeof formErrors] = issue.message;
					}
					return acc;
				},
				{} as typeof formErrors
			);
			return false; // Validation failed
		} else {
			formErrors = {}; // Clear errors on success
			return true; // Validation succeeded
		}
	};

	// State to hold multiple images for snapshots
	type DeckSnapshot = {
		id: number;
		dataUrl: string;
		blob: Blob | MediaSource;
		isCropped: boolean;
	};
	let deckSnapshots = $state<DeckSnapshot[]>([]);

	let nextImageId = 0; // Simple counter for unique IDs

	let deckCoverImageUrl = $state('');

	let deckCoverImageBlob = $derived.by<Blob | MediaSource>(() => {
		if (deckSnapshots.length > 0) {
			return deckSnapshots[0].blob;
		} else {
			return new Blob();
		}
	});

	let imageCropModalStatus = $state(false);
	let imageCropperInstance = $state<ImageCropper>(); // Declare variable for ImageCropper instance
	let currentImageIndexToCrop = $state<number | null>(null); // Index of the image being cropped

	const processFile = (file: File) => {
		return new Promise<DeckSnapshot>((resolve, reject) => {
			if (file && file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (e) => {
					resolve({
						id: nextImageId++,
						blob: new Blob(),
						dataUrl: e.target?.result as string,
						isCropped: false
					});
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			} else {
				reject('Uploaded file is not an image.');
			}
		});
	};

	const confirmCrop = async () => {
		if (imageCropperInstance && currentImageIndexToCrop !== null) {
			const croppedData = await imageCropperInstance.getCroppedBlobUrl();

			if (croppedData) {
				deckSnapshots[currentImageIndexToCrop].dataUrl = croppedData.imageBlobUrl;
				deckSnapshots[currentImageIndexToCrop].blob = croppedData.blob;
				deckSnapshots[currentImageIndexToCrop].isCropped = true;
				// Trigger state update for the array
				deckSnapshots = [...deckSnapshots];
			}
		}
		imageCropModalStatus = false;
		currentImageIndexToCrop = null;
	};

	const dropHandle = async (event: DragEvent) => {
		event.preventDefault();

		if (deckSnapshots.length >= 5) {
			console.warn('Maximum 5 images allowed.');
			return;
		}

		const files = [];
		if (event.dataTransfer?.items) {
			[...event.dataTransfer.items].forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file) {
						files.push(file);
					}
				}
			});
		} else if (event.dataTransfer?.files) {
			files.push(...event.dataTransfer.files);
		}

		for (const file of files) {
			if (deckSnapshots.length < 5) {
				try {
					const imageData = await processFile(file);
					if (deckSnapshots.length === 0) {
						// First image is potential cover
						deckCoverImageUrl = imageData.dataUrl;
						deckCoverImageBlob = imageData.blob;
					}
					deckSnapshots = [...deckSnapshots, imageData];
				} catch (error) {
					console.error('Error processing file:', error);
				}
			} else {
				console.warn('Maximum 5 images allowed.');
				break;
			}
		}
	};

	const handleChange = async (event: Event) => {
		const target = event.target as HTMLInputElement;

		console.warn(deckSnapshots);
		if (target.files && target.files.length > 0) {
			if (deckSnapshots.length >= 5) {
				console.warn('Maximum 5 images allowed.');
				return;
			}

			for (const file of Array.from(target.files)) {
				if (deckSnapshots.length < 5) {
					try {
						const imageData = await processFile(file);
						if (deckSnapshots.length === 0) {
							// First image is potential cover
							deckCoverImageUrl = imageData.dataUrl;
							deckCoverImageBlob = imageData.blob;
						}
						deckSnapshots = [...deckSnapshots, imageData];
					} catch (error) {
						console.error('Error processing file:', error);
					}
				} else {
					console.warn('Maximum 5 images allowed.');
					break;
				}
			}
		}
	};

	const openCropModal = (index: number) => {
		currentImageIndexToCrop = index;
		imageCropModalStatus = true;
	};

	const handleEditDeck = (event: Event) => {
		// TODO: handle when success
	};

	// Check if all images are cropped
	const allImagesCropped = $derived.by(() => {
		return deckSnapshots.length > 0 && deckSnapshots.every((img) => img.isCropped);
	});

	$effect(() => {
		if (props.editorType === 'Edit' && props.deckData) {
			// Get values from props.data
			deckName = props.deckData.deck_name;
			deckPrice = props.deckData.deck_price ?? 0.01;
			deckCount = props.deckData.deck_card_count ?? 0;
			selectedPlatform = JSON.parse(props.deckData.support_platform);
			selectedTags = JSON.parse(props.deckData.deck_tags ?? '[]');
			deckFileDownloadURL = props.deckData.deck_download_link;
			deckFilePassword = props.deckData.deck_compress_password ?? '';
			deckPurchaseLink = props.deckData.deck_purchase_link;
			deckDescription = props.deckData.deck_description;
			deckCoverImageUrl = props.deckData.deck_cover_image_url ?? '';

			// Add a small delay before setting CodeMirror values
			tick().then(() => {
				deckFrontPreviewCode = JSON.parse(props?.deckData?.deck_front_preview_code ?? '');
				deckBackPreviewCode = JSON.parse(props?.deckData?.deck_back_preview_code ?? ''); // Corrected
				deckSnapshots.push({
					id: 0,
					dataUrl: props?.deckData?.deck_cover_image_url ?? '',
					blob: new Blob(),
					isCropped: true
				});
			}); // Use 50ms delay to give CodeMirror time to initialize
		}
	});

	// free memory and Blob URL
	onDestroy(() => {
		deckSnapshots = [];
	});
</script>

<div>
	<Heading tag="h4" class="">
		{props.editorType === 'Create' ? '新建卡组' : '编辑卡组'}
	</Heading>
	<form
		method="POST"
		action={`${RESTfulApiBase}/decks`}
		use:enhance={async ({ action, formData, formElement, controller, submitter, cancel }) => {
			// Prevent default form submission
			cancel();

			// Input validation
			if (!validateForm()) {
				console.log('Form validation failed', formErrors);
				return; // Stop if validation fails
			}

			let finalCoverImageUrl = '';

			// 1. Upload image to cloudflare r2 (or local equivalent) if it's a data URL
			if ((deckCoverImageBlob as Blob).size > 0) {
				try {
					const formData = new FormData();

					/**
					 * 1.1 Convert image to .webp format using Web API
					 */
					const webpCoverBlob =
						(await convertImageToWebP(deckCoverImageBlob as Blob)) ?? (deckCoverImageBlob as Blob);

					formData.append('deckCoverImageBlob', webpCoverBlob, 'deckCoverImageBlob');
					const uploadResponse = await fetch('/api/v1/decks/upload-image', {
						method: 'POST',
						body: formData
					});

					const uploadResult: RESTfulApiResponse = await uploadResponse.json();

					if (uploadResponse.ok && !uploadResult.error) {
						finalCoverImageUrl = uploadResult.data as string;
						console.log('Image uploaded successfully:', finalCoverImageUrl);
					} else {
						console.error('Failed to upload image:', uploadResult);
						// TODO: Handle upload error - maybe show a user notification
						return; // Stop the process if image upload fails
					}
				} catch (error) {
					console.error('Error during image upload:', error);
					// TODO: Handle network error during upload
					return; // Stop the process if image upload fails
				}
			}

			// 2. Compose POST request body with the final image URL and send it to API End point
			const deckData: DeckEditData = {
				deck_name: deckName,
				deck_author_id: page.data.session?.user.id, // Use get(page) to access store value
				deck_description: deckDescription,
				deck_card_count: Number(deckCount), // Ensure it's a number
				deck_price: Number(deckPrice), // Ensure it's a number
				is_deck_on_sale: true, // Default to true as per original logic
				support_platform: JSON.stringify(selectedPlatform), // Serialized array
				deck_cover_image_url: props.editorType === 'Edit' ? deckCoverImageUrl : deckFileDownloadURL, // Use the URL from R2 or original if not uploaded
				deck_tags: JSON.stringify(selectedTags), // Serialized array
				deck_download_link: deckFileDownloadURL,
				deck_compress_password: deckFilePassword,
				deck_purchase_link: deckPurchaseLink,
				deck_front_preview_code: JSON.stringify(deckFrontPreviewCode),
				deck_back_preview_code: JSON.stringify(deckBackPreviewCode)
			};

			if (props.editorType === 'Edit') {
				// if the component is under `Edit` mode

				let currentEditDeckId = Number(
					page.url.pathname.slice(page.url.pathname.lastIndexOf('/') + 1)
				);

				// define new property for PUT
				deckData.deck_id = currentEditDeckId;
			}

			try {
				const response = await fetch(`${RESTfulApiBase}/decks`, {
					method: props.editorType === 'Create' ? 'POST' : 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(deckData)
				});

				const result = await response.json();

				if (response.ok) {
					console.log('Deck created successfully:', result);
					// TODO: handle when success, e.g., navigate to deck list page
					// show a notification
					setTimeout(async () => {
						await invalidateAll();
						await goto('/dashboard/decks');
					}, 500);
				} else {
					console.error('Failed to create deck:', result);
					// TODO: handle error, e.g., show error message to user
				}
			} catch (error) {
				console.error('Error during deck creation:', error);
				// TODO: handle network error
			}
		}}
	>
		<div class="flex w-full justify-between">
			<!-- edit button -->
			<Breadcrumb aria-label="Default breadcrumb example">
				<BreadcrumbItem href="/dashboard/decks" home>卡组管理</BreadcrumbItem>
				<BreadcrumbItem href="#">
					{props.editorType === 'Create' ? '新建' : '编辑'}
				</BreadcrumbItem>
			</Breadcrumb>
			<div>
				<Button size="sm" type="submit" disabled={!allImagesCropped}>
					{props.editorType === 'Create' ? '添加' : '完成编辑'}
				</Button>
				<Button size="sm" color="alternative" href="/dashboard/decks">取消编辑</Button>
			</div>
		</div>
		<div class="grid grid-cols-8 gap-3 grid-rows-4">
			<div class="flex flex-col col-span-full row-span-4">
				<div class="col-span-2">
					<Label for="deckName" class="mt-2 mb-2">卡组名称</Label>
					<Input type="text" id="deckName" required bind:value={deckName} />
					{#if formErrors.deckName}
						<Helper class="mt-1" color="red">{formErrors.deckName}</Helper>
					{/if}
				</div>
				<div class="col-span-2 inline-flex w-full gap-3">
					<div class="w-full">
						<Label for="deckPrice" class="mt-2 mb-2">价格(￥)</Label>
						<Input type="number" id="deckPrice" bind:value={deckPrice} />
						{#if formErrors.deckPrice}
							<Helper class="mt-1" color="red">{formErrors.deckPrice}</Helper>
						{/if}
					</div>
					<div class="w-full">
						<Label for="deckCount" class="mt-2 mb-2">卡片数量</Label>
						<Input type="number" id="deckCount" bind:value={deckCount} />
						{#if formErrors.deckCount}
							<Helper class="mt-1" color="red">{formErrors.deckCount}</Helper>
						{/if}
					</div>
				</div>
				<div class="col-span-2 inline-flex gap-3 flex-col md:flex-row">
					<div class="w-full">
						<Label for="deckSupportPlatform" class="mt-2 mb-2">支持平台</Label>
						<MultiSelect
							bind:value={selectedPlatform}
							items={supportPlatformList}
							name="deckSupportPlatform"
							id="deckSupportPlatform"
						/>
						{#if formErrors.selectedPlatform}
							<Helper class="mt-1" color="red">{formErrors.selectedPlatform}</Helper>
						{/if}
					</div>
					<div class="w-full">
						<Label for="deckTags" class="mt-2 mb-2">标签</Label>
						<MultiSelect bind:value={selectedTags} items={deckTagOptions} id="deckTags" />
						{#if formErrors.selectedTags}
							<Helper class="mt-1" color="red">{formErrors.selectedTags}</Helper>
						{/if}
					</div>
				</div>
				<div class="col-span-2 inline-flex w-full gap-3">
					<div class="w-full">
						<Label for="deckFileDownloadURL" class="mt-2 mb-2">卡组下载链接</Label>
						<Input bind:value={deckFileDownloadURL} id="deckFileDownloadURL" />
						{#if formErrors.deckFileDownloadURL}
							<Helper class="mt-1" color="red">{formErrors.deckFileDownloadURL}</Helper>
						{/if}
					</div>
					<div class="w-full">
						<Label for="deckFilePassword" class="mt-2 mb-2">解压密码</Label>
						<Input bind:value={deckFilePassword} id="deckFilePassword" />
						{#if formErrors.deckFilePassword}
							<Helper class="mt-1" color="red">{formErrors.deckFilePassword}</Helper>
						{/if}
					</div>
				</div>
				<div>
					<Label for="deckPurchaseLink" class="mt-2 mb-2">购买链接</Label>
					<Input bind:value={deckPurchaseLink} id="deckPurchaseLink" />
					{#if formErrors.deckPurchaseLink}
						<Helper class="mt-1" color="red">{formErrors.deckPurchaseLink}</Helper>
					{/if}
				</div>
				<div class="col-start-3 col-span-6">
					<Label for="deckDescription" class="mt-2 mb-2">卡组描述</Label>
					<Textarea
						bind:value={deckDescription}
						placeholder="输入该卡组的描述（支持HTML标签）"
						id="deckDescription"
						name="deckDescription"
						rows={5}
						required
					/>
					{#if formErrors.deckDescription}
						<Helper class="mt-1" color="red">{formErrors.deckDescription}</Helper>
					{/if}
				</div>
			</div>
			<!-- <div class="col-span-full lg:col-span-2 row-span-4 mb-10 bg-red-400">
		
			</div> -->
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<div class="grow">
				<Label for="deckDescription" class="mt-2 mb-2">卡组预览（正面代码）</Label>
				<CodeMirror
					bind:value={deckFrontPreviewCode}
					extensions={editorExtensions}
					placeholder="卡片的正面代码（HTML, Javascript, CSS）"
				/>
				{#if formErrors.deckFrontPreviewCode}
					<Helper class="mt-1" color="red">{formErrors.deckFrontPreviewCode}</Helper>
				{/if}
			</div>
			<div class="grow">
				<Label for="deckDescription" class="mt-2 mb-2">卡组预览（背面代码）</Label>
				<CodeMirror
					bind:value={deckBackPreviewCode}
					extensions={editorExtensions}
					placeholder="卡片的背面代码（HTML, Javascript, CSS）"
				/>
				{#if formErrors.deckBackPreviewCode}
					<Helper class="mt-1" color="red">{formErrors.deckBackPreviewCode}</Helper>
				{/if}
			</div>
		</div>
	</form>
	<Hr classHr="my-8" />
	<!-- deck snapshot preview -->
	<div class="mt-6 flex flex-col h-auto">
		<Label class="mt-2 mb-2">卡组快照预览 (最多5张)</Label>
		{#if formErrors.deckSnapshots}
			<Helper class="mt-1" color="red">{formErrors.deckSnapshots}</Helper>
		{/if}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-auto">
			{#each deckSnapshots as snapshot, index (props.editorType === 'Edit' ? snapshot.dataUrl.slice(10) : snapshot.id)}
				<div class="flex flex-col items-center h-full">
					<button
						class="relative w-full border-2 rounded-md overflow-hidden cursor-pointer h-full"
						class:border-gray-100={!snapshot.isCropped}
						class:border-green-500={snapshot.isCropped}
						onclick={() => openCropModal(index)}
					>
						<img
							src={snapshot.dataUrl}
							alt={`Snapshot ${index + 2}`}
							class="max-w-full object-contain"
						/>
						{#if !snapshot.isCropped}
							<div
								class="absolute inset-0 flex items-center justify-center bg-opacity-50 text-blue-500 text-lg font-bold"
							>
								点击裁剪
							</div>
						{/if}
					</button>
					<p
						class="text-sm mt-1"
						class:text-green-600={snapshot.isCropped}
						class:text-red-600={!snapshot.isCropped}
					>
						{snapshot.isCropped ? '已裁剪' : '未裁剪'}
					</p>
				</div>
			{/each}

			{#if deckSnapshots.length < 5}
				<!-- Upload more placeholder -->
				<Dropzone
					ondrop={dropHandle}
					onchange={handleChange}
					class="w-full aspect-video flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer"
				>
					<div class="flex flex-col items-center justify-center pt-5 pb-6 p-2">
						<svg
							aria-hidden="true"
							class="mb-3 w-10 h-10 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
						<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span class="font-semibold">点击上传</span> 或拖拽文件
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 5张)</p>
					</div>
				</Dropzone>
			{/if}
		</div>
	</div>

	<!-- Image Crop Modal -->
	{#if imageCropModalStatus && currentImageIndexToCrop !== null && deckSnapshots[currentImageIndexToCrop]}
		<Modal title="裁剪图片" bind:open={imageCropModalStatus} size="lg">
			<ImageCropper
				bind:this={imageCropperInstance}
				class="w-sm self-center"
				id="snapshot-cropper"
				src={deckSnapshots[currentImageIndexToCrop].dataUrl}
				alt="Snapshot Cropper"
			/>
			<svelte:fragment slot="footer">
				<Button
					color="alternative"
					onclick={() => {
						imageCropModalStatus = false;
						currentImageIndexToCrop = null;
					}}>取消</Button
				>
				<Button onclick={confirmCrop}>选好了</Button>
			</svelte:fragment>
		</Modal>
	{/if}
</div>
