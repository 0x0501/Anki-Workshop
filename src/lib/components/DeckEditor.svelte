<script lang="ts">
	import {
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Dropzone,
		Fileupload,
		Heading,
		Hr,
		Input,
		Label,
		Modal,
		MultiSelect,
		Textarea,
		type SelectOptionType
	} from 'flowbite-svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';

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

	interface DeckEditorProps {
		editorType: 'Create' | 'Edit';
	}

	let props: DeckEditorProps = $props();

	let deckCoverImageUrl = $state('');

	let deckFile = $state('');

	let deckDescription = $state('');

	// State to hold multiple images for snapshots
	let deckSnapshots = $state<{ id: number; dataUrl: string; isCropped: boolean }[]>([]);
	let nextImageId = 0; // Simple counter for unique IDs

	let imageCropModalStatus = $state(false);
	let imageCropperInstance = $state<ImageCropper>(); // Declare variable for ImageCropper instance
	let currentImageIndexToCrop = $state<number | null>(null); // Index of the image being cropped

	const processFile = (file: File) => {
		return new Promise<{ id: number; dataUrl: string; isCropped: boolean }>((resolve, reject) => {
			if (file && file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (e) => {
					resolve({
						id: nextImageId++,
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
			const blobUrl = await imageCropperInstance.getCroppedBlobUrl();
			if (blobUrl) {
				deckSnapshots[currentImageIndexToCrop].dataUrl = blobUrl;
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

	const handleEditSuccess = (event: Event) => {
		// TODO: handle when success
	};

	// Check if all images are cropped
	const allImagesCropped = $derived.by(() => {
		return deckSnapshots.length > 0 && deckSnapshots.every((img) => img.isCropped);
	});
</script>

<div>
	<Heading tag="h4" class="">
		{props.editorType === 'Create' ? '新建卡组' : '编辑卡组'}
	</Heading>

	<div class="flex w-full justify-between">
		<!-- edit button -->
		<Breadcrumb aria-label="Default breadcrumb example">
			<BreadcrumbItem href="/dashboard/decks" home>卡组管理</BreadcrumbItem>
			<BreadcrumbItem href="#">
				{props.editorType === 'Create' ? '新建' : '编辑'}
			</BreadcrumbItem>
		</Breadcrumb>
		<div>
			<Button size="sm" disabled={!allImagesCropped} onclick={handleEditSuccess}>
				{props.editorType === 'Create' ? '添加' : '完成编辑'}
			</Button>
			<Button size="sm" color="alternative" href="/dashboard/decks">取消编辑</Button>
		</div>
	</div>
	<form>
		<div class="grid grid-cols-8 gap-3 grid-rows-4">
			<div class="col-span-2 row-span-4 mb-10">
				<Label for="deckCover" class="mt-2 mb-2">卡组封面</Label>
				{#if deckSnapshots.length > 0}
					<!-- Display the first image as cover preview -->
					<div class="inline-flex flex-col gap-3">
						<button onclick={() => openCropModal(0)}>
							<img
								src={deckSnapshots[0].dataUrl}
								alt="Uploaded cover"
								class="max-w-full object-contain rounded-md border-2"
								class:border-gray-100={!deckSnapshots[0].isCropped}
								class:border-green-500={deckSnapshots[0].isCropped}
							/>
						</button>

						<p
							class="text-sm mt-1 text-center"
							class:text-green-600={deckSnapshots[0].isCropped}
							class:text-red-600={!deckSnapshots[0].isCropped}
						>
							{deckSnapshots[0].isCropped ? '已裁剪' : '未裁剪'}
						</p>
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
							<span class="font-semibold">点击上传</span> 或拖拽文件
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 5张)</p>
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
	<Hr classHr="my-8" />
	<!-- deck snapshot preview -->
	<div class="mt-6 flex flex-col h-auto">
		<Label class="mt-2 mb-2">卡组快照预览 (最多5张)</Label>
		<div class="grid grid-cols-5 gap-4 auto-rows-auto">
			{#each deckSnapshots.slice(1) as snapshot, index (snapshot.id)}
				<div class="flex flex-col items-center h-full">
					<button
						class="relative w-full border-2 rounded-md overflow-hidden cursor-pointer h-full"
						class:border-gray-100={!snapshot.isCropped}
						class:border-green-500={snapshot.isCropped}
						onclick={() => openCropModal(index + 1)}
					>
						<img
							src={snapshot.dataUrl}
							alt={`Snapshot ${index + 2}`}
							class="max-w-full object-contain"
						/>
						{#if !snapshot.isCropped}
							<div
								class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold"
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
					<div class="flex flex-col items-center justify-center pt-5 pb-6">
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
