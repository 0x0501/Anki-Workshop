<script lang="ts">
	import { Heading, Toggle } from 'flowbite-svelte';
	import { applyAction, enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';

	let { data, }  = $props();

	let allowUserRegister = $state(data.system_settings.allow_user_register);
	let enableShowingFollower = $state(data.system_settings.enable_showing_follower);
	let enableUserFollowFunc = $state(data.system_settings.enable_user_follow_func);
	let enableDeckFavoriteFunc = $state(data.system_settings.enable_deck_favorite_func);

	
	console.log(data.session)

	// Function to handle toggle change and submit the form
	const handleToggleChange = (event: Event) => {
		const form = (event.target as HTMLInputElement).closest('form');

		// allowUserRegister = !allowUserRegister;

		if (form) {
			form.requestSubmit();
		}
	};

	const handleToggleSubmit = ({
		formElement,
		formData
	}: {
		formElement: HTMLFormElement;
		formData: FormData;
	}) => {
		// Only checked value will send via form, if the input is unchecked,
		// no matter what the value is, it won't send to form
		// so we need to construct the form data manually
		const toggle = formElement.querySelector('input');

		formData.append('settingName', String(toggle?.name));
		formData.append('settingValue', String(toggle?.checked));

		// console.log('[client] settingName = ' + formData.get('settingName'));
		// console.log('[client] settingValue = ' + formData.get('settingValue'));

		return async ({ result }: { result: ActionResult }) => {
			await applyAction(result);
		};
	};
</script>

<div class="flex flex-col">
	<Heading tag="h4" class="">网站设置</Heading>
	<div class="mt-5 flex gap-3 flex-col">
		<!-- Toggle for Allow User Register -->
		<form method="POST" action="?/updateSetting" use:enhance={handleToggleSubmit}>
			<!-- <input type="hidden" name="settingName" value="allow_user_register" /> -->

			<Toggle
				name="allow_user_register"
				value={allowUserRegister ? 0 : 1}
				bind:checked={allowUserRegister}
				onchange={handleToggleChange}>允许用户注册</Toggle
			>
		</form>
		<!-- Toggle for Enable Showing Follower -->
		<form method="POST" action="?/updateSetting" use:enhance={handleToggleSubmit}>
			<Toggle
				name="enable_showing_follower"
				bind:checked={enableShowingFollower}
				on:change={handleToggleChange}>卡组页面显示粉丝数量</Toggle
			>
		</form>

		<!-- Toggle for Enable User Follow Func -->
		<form method="POST" action="?/updateSetting" use:enhance={handleToggleSubmit}>
			<Toggle
				name="enable_user_follow_func"
				bind:checked={enableUserFollowFunc}
				on:change={handleToggleChange}>启用关注功能</Toggle
			>
		</form>

		<!-- Toggle for Enable Deck Favorite Func -->
		<form method="POST" action="?/updateSetting" use:enhance={handleToggleSubmit}>
			<Toggle
				name="enable_deck_favorite_func"
				bind:checked={enableDeckFavoriteFunc}
				on:change={handleToggleChange}>启用卡组收藏功能</Toggle
			>
		</form>
	</div>
</div>
