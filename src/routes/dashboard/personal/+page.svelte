<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { RESTfulApiResponse } from '$lib/api.js';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import {
		Avatar,
		Button,
		Dropzone,
		Heading,
		Helper,
		Hr,
		Input,
		Label,
		Modal
	} from 'flowbite-svelte';

	type UserAvatarData = {
		id: number;
		blob: Blob;
		dataUrl: string;
	};

	let { data } = $props();

	let username = $state<string>();

	let userEmail = $state<string>();

	$effect(() => {
		username = data.user.name ?? '';
		userEmail = data.user.email ?? '';

		console.log(userAvatar);
	});

	let oldPassword = $state('');

	let newPassword = $state('');

	let fileInput: HTMLInputElement;

	let imageCropModalStatus = $state(false);
	let imageCropperInstance = $state<ImageCropper>();

	let userAvatar = $state<UserAvatarData>();

	let formErrorMessage = $state('');

	const openFilePicker = () => {
		fileInput.click();
	};

	const processFile = (file: File) => {
		return new Promise<UserAvatarData>((resolve, reject) => {
			if (file && file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (e) => {
					resolve({
						id: 0,
						blob: new Blob(),
						dataUrl: e.target?.result as string
					});
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			} else {
				reject('Uploaded file is not an image.');
			}
		});
	};

	const openCropModal = () => {
		imageCropModalStatus = true;
	};

	const confirmCrop = async () => {
		if (imageCropperInstance && userAvatar) {
			const croppedData = await imageCropperInstance.getCroppedBlobUrl();

			if (croppedData?.blob && croppedData.imageBlobUrl) {
				userAvatar.dataUrl = croppedData?.imageBlobUrl;
				userAvatar.blob = croppedData?.blob as Blob;
			}
		}
		imageCropModalStatus = false;
	};

	const handleChange = async (event: Event) => {
		const input = event.target as HTMLInputElement;

		if (input.files && input.files.length > 0) {
			const imageData = await processFile(input.files[0]);
			userAvatar = imageData;
			console.warn(userAvatar);
			openCropModal();
		}
	};

	console.log(data);
</script>

<div class="flex flex-col">
	<Heading tag="h4" class="mb-2">账号设置</Heading>
	<form
		class="flex gap-3 flex-col"
		method="POST"
		action="?/updateUserInfo"
		use:enhance={async ({ formData, cancel, action }) => {
			// 1. upload user image to R2

            console.warn(userAvatar)

			if (userAvatar !== null && userAvatar !== undefined) {
				try {
					const avatarFormData = new FormData();
					avatarFormData.append('avatarImageBlob', userAvatar.blob, 'avatarImageBlob');

					const uploadResponse = await fetch('/api/v1/user/image', {
						method: 'POST',
						body: avatarFormData
					});

					console.log(userAvatar.blob);

					const uploadResult: RESTfulApiResponse = await uploadResponse.json();

					if (uploadResponse.ok && !uploadResult.error) {
						userAvatar.dataUrl = uploadResult.data as string;
						console.log('Image uploaded successfully:', uploadResult.data);
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

			// 2. update user info
			try {
				const updateFormData = new FormData();
				updateFormData.append('id', data.user.id);
				updateFormData.append('username', username ?? data.user.name ?? '');
				updateFormData.append('email', userEmail ?? data.user.email ?? '');

				if (userAvatar) {
					updateFormData.append('avatar', userAvatar.dataUrl);
				}

				if (oldPassword.length > 0) {
					updateFormData.append('old_password', oldPassword);
				}

				if (newPassword.length > 0) {
					updateFormData.append('new_password', newPassword);
				}

				const updateResponse = await fetch(action, { method: 'POST', body: updateFormData });

				const updateResult: RESTfulApiResponse = await updateResponse.json();

				if (updateResponse.ok && !updateResult.error) {
					console.log('Image uploaded successfully:', updateResult.data);
				} else {
					console.error('Failed to upload image:', updateResult);
					// TODO: Handle upload error - maybe show a user notification
					return; // Stop the process if image upload fails
				}
			} catch (error) {
				console.error(error);
				formErrorMessage = String(error);
			}

			cancel();
		}}
		enctype="multipart/form-data"
	>
		<div class="inline-flex justify-center w-full cursor-pointer">
			<Label for="avatar" class="mt-2 mb-2">
				<input
					bind:this={fileInput}
					type="file"
					name="avatar"
					class="hidden"
					onchange={handleChange}
					multiple={false}
				/>
				<button onclick={openFilePicker}>
					{#if data.user.image !== null || userAvatar}
						<img
							alt="user_avatar"
							src={data.user.image ? data.user.image : userAvatar?.dataUrl}
							class="size-24 rounded-full"
						/>
					{:else}
						<Avatar size="lg" />
					{/if}
				</button>
			</Label>
		</div>
		<div class="grid grid-cols-2 w-full gap-3">
			<div>
				<Label for="username" class="mt-2 mb-2">昵称</Label>
				<Input name="username" type="text" bind:value={username} />
			</div>
			<div>
				<Label for="email" class="mt-2 mb-2">邮箱</Label>
				<Input name="email" type="text" bind:value={userEmail} />
			</div>
		</div>
		<Hr hrClass="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
		<div class="grid grid-cols-2 w-full gap-3">
			<Heading tag="h5" class="m-0 col-span-2">更改密码</Heading>
			<div>
				<Label for="username" class="mt-2 mb-2">原密码</Label>
				<Input name="old_password" type="text" bind:value={oldPassword} />
			</div>
			<div>
				<Label for="email" class="mt-2 mb-2">新密码</Label>
				<Input name="new_password" type="text" bind:value={newPassword} />
			</div>
		</div>
		{#if formErrorMessage}
			<Helper color="red">{formErrorMessage}</Helper>
		{/if}

		<div class="flex justify-end gap-3">
			<Button size="sm" type="submit">保存</Button>
			<Button size="sm" color="alternative" onclick={async () => await goto('/dashboard')}
				>取消</Button
			>
		</div>
	</form>

	<!-- Image Crop Modal -->
	{#if imageCropModalStatus}
		<Modal title="裁剪图片" bind:open={imageCropModalStatus} size="lg">
			<ImageCropper
				bind:this={imageCropperInstance}
				class="w-sm self-center"
				id="snapshot-cropper"
				src={userAvatar?.dataUrl}
				alt="Snapshot Cropper"
				aspectRatio={1 / 1}
			/>
			<svelte:fragment slot="footer">
				<Button
					color="alternative"
					onclick={() => {
						imageCropModalStatus = false;
					}}>取消</Button
				>
				<Button onclick={confirmCrop}>选好了</Button>
			</svelte:fragment>
		</Modal>
	{/if}
</div>
