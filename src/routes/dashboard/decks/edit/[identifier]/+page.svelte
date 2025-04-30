<script lang="ts">
	import {
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Dropzone,
		Fileupload,
		Heading,
		Input,
		Label,
		Modal,
		MultiSelect,
		Textarea,
		type SelectOptionType
	} from 'flowbite-svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import { page } from '$app/state';

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
		{ value: '考编', name: '考编' }
	];

	let deckCoverImageUrl = $state('');

	let imageDataUrl = $state(''); // State to hold the image data URL

	let deckFile = $state('');

	let deckDescription = $state('');

	let isImageCropped = $state(false);

	let imageCropModalStatus = $state(false);

	let imageCropperInstance = $state<ImageCropper>(); // Declare variable for ImageCropper instance

	const processFile = (file: File) => {
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imageDataUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			// Handle non-image files or provide feedback
			imageDataUrl = ''; // Reset if not an image
			console.warn('Uploaded file is not an image.');
		}
	};

	const confirmCrop = async () => {
		if (imageCropperInstance) {
			const blobUrl = await imageCropperInstance.getCroppedBlobUrl();
			if (blobUrl) {
				imageDataUrl = blobUrl;
				isImageCropped = true;
			}
		}
		imageCropModalStatus = false;
	};

	const dropHandle = (event: DragEvent) => {
		event.preventDefault();
		imageDataUrl = ''; // Reset preview

		if (event.dataTransfer?.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...event.dataTransfer.items].forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file) {
						processFile(file);
						// Handle only the first file for simplicity in preview
						return;
					}
				}
			});
		} else if (event.dataTransfer?.files) {
			// Use DataTransfer interface to access the file(s)
			if (event.dataTransfer.files.length > 0) {
				processFile(event.dataTransfer.files[0]);
			}
		}
	};

	const closeImagePreview = (_: Event) => {
		imageDataUrl = '';
		isImageCropped = false;
	};

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			imageDataUrl = ''; // Reset preview
			processFile(target.files[0]);
			// Show image crop modal
			imageCropModalStatus = true;
		}
	};
</script>

<div>
	<Heading tag="h4" class="">编辑卡组</Heading>

	<div class="flex w-full justify-between">
		<!-- edit button -->
		<Breadcrumb aria-label="Default breadcrumb example">
			<BreadcrumbItem href="/dashboard/decks" home>卡组管理</BreadcrumbItem>
			<BreadcrumbItem href="#edit">编辑</BreadcrumbItem>
		</Breadcrumb>
		<div>
			<Button size="sm">完成编辑</Button>
			<Button size="sm" color="alternative" href="/dashboard/decks">取消编辑</Button>
		</div>
	</div>
	<form>
		<div class="grid grid-cols-8 gap-3 grid-rows-4">
			<div class="col-span-2 row-span-4 max-h-11/12">
				<Label for="deckCover" class="mt-2 mb-2">卡组封面</Label>
				{#if !isImageCropped && imageDataUrl}
					<Modal title="选择封面" bind:open={imageCropModalStatus} size="lg">
						<ImageCropper
							bind:this={imageCropperInstance}
							class="w-sm self-center"
							id="deck-preview"
							src={imageDataUrl}
							alt="Deck Preview"
						/>
						<svelte:fragment slot="footer">
							<Button
								color="alternative"
								onclick={() => {
									imageCropModalStatus = false;
									imageDataUrl = '';
								}}>取消</Button
							>
							<Button onclick={confirmCrop}>选好了</Button>
						</svelte:fragment>
					</Modal>
				{:else if imageDataUrl != '' && imageCropModalStatus === false}
					<!-- Display the image preview -->
					<div class="inline-flex flex-col gap-3">
						<img
							src={imageDataUrl}
							alt="Uploaded cover"
							class="max-h-11/12 max-w-full object-contain rounded-md border-2 border-gray-100"
						/>
						<Button color="alternative" onclick={closeImagePreview}>关闭</Button>
					</div>
				{:else}
					<Dropzone id="deckCover" ondrop={dropHandle} onchange={handleChange} class="h-full">
						<svg
							aria-hidden="true"
							class="mb-3 w-10 h-10 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/></svg
						>

						<!-- Default Dropzone content -->
						<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span class="font-semibold">Click to upload</span> or drag and drop
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							SVG, PNG, JPG or GIF (MAX. 800x400px)
						</p>
					</Dropzone>
				{/if}
			</div>
			<div class="flex flex-col col-span-6 row-span-4">
				<div class="col-span-2">
					<Label for="deckName" class="mt-2 mb-2">卡组名称</Label>
					<Input type="text" id="deckName" required />
				</div>
				<div class="col-span-2">
					<Label for="deckPrice" class="mt-2 mb-2">价格(￥)</Label>
					<Input type="number" id="deckPrice" required />
				</div>
				<div class="col-span-2">
					<Label for="deckCount" class="mt-2 mb-2">卡片数量</Label>
					<Input type="number" id="deckCount" required />
				</div>
				<div class="col-span-2">
					<Label for="deckSupportPlatform" class="mt-2 mb-2">支持平台</Label>
					<MultiSelect
						bind:value={selectedPlatform}
						items={supportPlatformList}
						id="deckSupportPlatform"
					/>
				</div>
				<div class="col-span-2">
					<Label for="deckTags" class="mt-2 mb-2">标签</Label>
					<MultiSelect bind:value={selectedTags} items={deckTagOptions} id="deckTags" />
				</div>
				<div class="col-span-2">
					<Label for="deckFile" class="mt-2 mb-2">卡组文件</Label>
					<Fileupload bind:value={deckFile} id="deckFile" />
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
				</div>
			</div>
		</div>
	</form>
</div>
